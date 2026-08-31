import type { PrismaClient } from "@prisma/client";

const roleWithPermissions = {
  include: { rolePermissions: { include: { permission: true } } },
} as const;

export function createRoleRepository(prisma: PrismaClient) {
  return {
    listByOrganization: (organizationId: string) =>
      prisma.role.findMany({
        where: { organizationId },
        orderBy: { name: "asc" },
        ...roleWithPermissions,
      }),

    findById: (organizationId: string, id: string) =>
      prisma.role.findFirst({
        where: { id, organizationId },
        ...roleWithPermissions,
      }),

    findByName: (organizationId: string, name: string) =>
      prisma.role.findUnique({ where: { organizationId_name: { organizationId, name } } }),

    listPermissions: () => prisma.permission.findMany({ orderBy: { key: "asc" } }),

    findPermissionsByKeys: (keys: string[]) => prisma.permission.findMany({ where: { key: { in: keys } } }),

    async create(organizationId: string, data: { name: string; description?: string; permissionIds: string[] }) {
      return prisma.role.create({
        data: {
          organizationId,
          name: data.name,
          description: data.description,
          rolePermissions: { create: data.permissionIds.map((permissionId) => ({ permissionId })) },
        },
        ...roleWithPermissions,
      });
    },

    async update(
      id: string,
      data: { name?: string; description?: string; permissionIds?: string[] },
    ) {
      return prisma.role.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          ...(data.permissionIds
            ? {
                rolePermissions: {
                  deleteMany: {},
                  create: data.permissionIds.map((permissionId) => ({ permissionId })),
                },
              }
            : {}),
        },
        ...roleWithPermissions,
      });
    },

    delete: (id: string) => prisma.role.delete({ where: { id } }),
  };
}
