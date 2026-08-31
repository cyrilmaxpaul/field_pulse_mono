const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1";

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

type ApiSuccess<T> = { success: true; data: T };
type ApiFailure = { success: false; error: { code: string; message: string; fields?: Record<string, string> } };

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

async function rawRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });

  const body = (await response.json()) as ApiSuccess<T> | ApiFailure;

  if (!body.success) {
    throw new ApiError(response.status, body.error.code, body.error.message);
  }

  return body.data;
}

// Refresh tokens rotate on use, so two concurrent refresh calls (e.g. two
// tabs, or several requests expiring at once) would otherwise race: the
// second arrives with an already-revoked token and fails. Funnel every
// caller through the same in-flight promise so only one request ever goes out.
let refreshPromise: Promise<RefreshResult | null> | null = null;

interface RefreshResult<TUser = unknown> {
  accessToken: string;
  user: TUser;
}

export function refreshSession<TUser = unknown>(): Promise<RefreshResult<TUser> | null> {
  if (!refreshPromise) {
    refreshPromise = rawRequest<RefreshResult<TUser>>("/auth/refresh", { method: "POST" })
      .then((data) => {
        setAccessToken(data.accessToken);
        return data;
      })
      .catch(() => {
        setAccessToken(null);
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise as Promise<RefreshResult<TUser> | null>;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  try {
    return await rawRequest<T>(path, options);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401 && path !== "/auth/refresh") {
      const refreshed = await refreshSession();
      if (refreshed) {
        return rawRequest<T>(path, options);
      }
    }
    throw error;
  }
}
