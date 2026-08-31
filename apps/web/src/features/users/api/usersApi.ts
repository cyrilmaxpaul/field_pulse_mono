import { apiRequest } from "../../../lib/api/client";
import type { CreateUserInput, UserSummary } from "../types";

export function listUsers() {
  return apiRequest<UserSummary[]>("/users");
}

export function createUser(input: CreateUserInput) {
  return apiRequest<UserSummary>("/users", { method: "POST", body: JSON.stringify(input) });
}

export function deactivateUser(id: string) {
  return apiRequest<UserSummary>(`/users/${id}`, { method: "DELETE" });
}
