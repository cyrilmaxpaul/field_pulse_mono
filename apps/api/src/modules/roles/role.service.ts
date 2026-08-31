import type { PrismaClient } from "@prisma/client";
import { AppError } from "../../middleware/errorHandler.js";
import { createRoleRepository } from "./role.repository.js";
import { toPermissionDto, toRoleDto } from "./role.mapper.js";
import type { CreateRoleInput, UpdateRoleInput } from "./role.schema.js";

export function createRoleService(prisma: PrismaClient) {
  const repo = createRoleRepository(prisma);

  async function resolvePermissionIds(keys: string[]) {
    if (keys.length === 0) return [];
    const permissions = await repo.findPermissionsByKeys(keys);
    if (permissions.length !== new Set(keys).size) {
      throw new AppError(400, "VALIDATION_ERROR", "One or more permission keys are invalid.");
    }
    return permissions.map((p) => p.id);
  }

  return {
    async list(organizationId: string) {
      const roles = await repo.listByOrganization(organizationId);
      return roles.map(toRoleDto);
    },

    async listPermissions() {
      const permissions = await repo.listPermissions();
      return permissions.map(toPermissionDto);
    },

    async get(organizationId: string, id: string) {
      const role = await repo.findById(organizationId, id);
      if (!role) throw new AppError(404, "NOT_FOUND", "Role not found.");
      return toRoleDto(role);
    },

    async create(organizationId: string, input: CreateRoleInput) {
      const existing = await repo.findByName(organizationId, input.name);
      if (existing) {
        throw new AppError(409, "ROLE_NAME_TAKEN", "A role with this name already exists.");
      }
      const permissionIds = await resolvePermissionIds(input.permissionKeys);
      const role = await repo.create(organizationId, {
        name: input.name,
        description: input.description,
        permissionIds,
      });
      return toRoleDto(role);
    },

    async update(organizationId: string, id: string, input: UpdateRoleInput) {
      const existing = await repo.findById(organizationId, id);
      if (!existing) throw new AppError(404, "NOT_FOUND", "Role not found.");

      const permissionIds =
        input.permissionKeys !== undefined ? await resolvePermissionIds(input.permissionKeys) : undefined;

      const role = await repo.update(id, {
        name: input.name,
        description: input.description,
        permissionIds,
      });
      return toRoleDto(role);
    },

    async remove(organizationId: string, id: string) {
      const existing = await repo.findById(organizationId, id);
      if (!existing) throw new AppError(404, "NOT_FOUND", "Role not found.");
      await repo.delete(id);
    },
  };
}
