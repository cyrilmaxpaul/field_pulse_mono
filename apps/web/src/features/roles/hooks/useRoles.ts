import { useQuery } from "@tanstack/react-query";
import { listPermissions, listRoles } from "../api/rolesApi";

export function useRoles() {
  return useQuery({ queryKey: ["roles"], queryFn: listRoles });
}

export function usePermissions() {
  return useQuery({ queryKey: ["permissions"], queryFn: listPermissions });
}
