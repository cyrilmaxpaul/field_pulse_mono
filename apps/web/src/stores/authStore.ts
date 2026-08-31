import { useSyncExternalStore } from "react";
import { setAccessToken } from "../lib/api/client";

export interface AuthUser {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
}

interface AuthState {
  user: AuthUser | null;
  status: "idle" | "authenticated" | "unauthenticated";
}

let state: AuthState = { user: null, status: "idle" };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function setAuthenticatedUser(user: AuthUser, accessToken: string) {
  setAccessToken(accessToken);
  state = { user, status: "authenticated" };
  emit();
}

export function clearAuth() {
  setAccessToken(null);
  state = { user: null, status: "unauthenticated" };
  emit();
}

export function getAuthState() {
  return state;
}

export function subscribeAuth(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAuthState() {
  return useSyncExternalStore(subscribeAuth, getAuthState);
}
