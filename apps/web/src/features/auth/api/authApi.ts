import { apiRequest, refreshSession as refreshSessionRequest } from "../../../lib/api/client";
import type { LoginResponse } from "../types";
import type { LoginFormValues } from "../schemas/loginSchema";
import type { AuthUser } from "../../../stores/authStore";

export function login(values: LoginFormValues) {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(values),
  });
}

export function fetchMe() {
  return apiRequest<AuthUser>("/auth/me");
}

export function logout() {
  return apiRequest<null>("/auth/logout", { method: "POST" });
}

export async function refreshSession() {
  const result = await refreshSessionRequest<AuthUser>();
  if (!result) {
    throw new Error("Unable to restore session.");
  }
  return result;
}
