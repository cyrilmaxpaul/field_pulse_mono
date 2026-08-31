import type { PrismaClient } from "@prisma/client";

const userWithRoles = {
  include: { userRoles: { include: { role: true } } },
} as const;

export function createUserRepository(prisma: PrismaClient) {
  return {
    listByOrganization: (organizationId: string) =>
      prisma.user.findMany({
        where: { organizationId },
        orderBy: { createdAt: "asc" },
        ...userWithRoles,
      }),

    findById: (organizationId: string, id: string) =>
      prisma.user.findFirst({ where: { id, organizationId }, ...userWithRoles }),

    findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),

    create: (
      organizationId: string,
      data: { firstName: string; lastName: string; email: string; passwordHash: string; roleIds: string[] },
    ) =>
      prisma.user.create({
        data: {
          organizationId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          passwordHash: data.passwordHash,
          status: "ACTIVE",
          userRoles: { create: data.roleIds.map((roleId) => ({ roleId })) },
        },
        ...userWithRoles,
      }),

    update: (
      id: string,
      data: { firstName?: string; lastName?: string; status?: "ACTIVE" | "DISABLED"; roleIds?: string[] },
    ) =>
      prisma.user.update({
        where: { id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          status: data.status,
          ...(data.roleIds
            ? { userRoles: { deleteMany: {}, create: data.roleIds.map((roleId) => ({ roleId })) } }
            : {}),
        },
        ...userWithRoles,
      }),

    revokeActiveRefreshTokens: (userId: string) =>
      prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
  };
}
