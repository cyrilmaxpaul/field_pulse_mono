import type { Permission, Role, RolePermission } from "@prisma/client";

type RoleWithPermissions = Role & { rolePermissions: (RolePermission & { permission: Permission })[] };

export function toRoleDto(role: RoleWithPermissions) {
  return {
    id: role.id,
    name: role.name,
    description: role.description,
    permissionKeys: role.rolePermissions.map((rp) => rp.permission.key),
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  };
}

export function toPermissionDto(permission: Permission) {
  return { key: permission.key, description: permission.description };
}
