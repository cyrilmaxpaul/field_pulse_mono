import { apiRequest } from "../../../lib/api/client";
import type { CreateRoleInput, Permission, Role } from "../types";

export function listRoles() {
  return apiRequest<Role[]>("/roles");
}

export function listPermissions() {
  return apiRequest<Permission[]>("/permissions");
}

export function createRole(input: CreateRoleInput) {
  return apiRequest<Role>("/roles", { method: "POST", body: JSON.stringify(input) });
}

export function deleteRole(id: string) {
  return apiRequest<null>(`/roles/${id}`, { method: "DELETE" });
}
