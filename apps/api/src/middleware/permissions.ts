import fp from "fastify-plugin";
import type { PrismaClient } from "@prisma/client";
import { AppError } from "./errorHandler.js";
import type { PermissionKey } from "@fieldpulse/shared-types";

export async function getUserPermissionKeys(prisma: PrismaClient, userId: string): Promise<Set<string>> {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: { role: { include: { rolePermissions: { include: { permission: true } } } } },
  });

  const keys = new Set<string>();
  for (const userRole of userRoles) {
    for (const rolePermission of userRole.role.rolePermissions) {
      keys.add(rolePermission.permission.key);
    }
  }
  return keys;
}

export async function userHasPermission(prisma: PrismaClient, userId: string, permission: PermissionKey) {
  const keys = await getUserPermissionKeys(prisma, userId);
  return keys.has(permission);
}

export default fp(async (fastify) => {
  fastify.decorate("requirePermission", (permission: PermissionKey) => {
    return async (request: import("fastify").FastifyRequest) => {
      if (!request.authUser) {
        throw new AppError(401, "UNAUTHORIZED", "Missing access token.");
      }

      const keys = await getUserPermissionKeys(request.server.prisma, request.authUser.id);
      if (!keys.has(permission)) {
        throw new AppError(403, "FORBIDDEN", "You do not have permission to perform this action.");
      }
    };
  });
});
