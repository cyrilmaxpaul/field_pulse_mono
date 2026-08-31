import type { PrismaClient } from "@prisma/client";
import type { CreateSiteInput, UpdateSiteInput } from "./site.schema.js";

const siteWithMembers = {
  include: { members: { include: { user: true } } },
} as const;

export function createSiteRepository(prisma: PrismaClient) {
  return {
    listByOrganization: (organizationId: string) =>
      prisma.site.findMany({ where: { organizationId }, orderBy: { name: "asc" } }),

    findById: (organizationId: string, id: string) =>
      prisma.site.findFirst({ where: { id, organizationId }, ...siteWithMembers }),

    findByCode: (organizationId: string, code: string) =>
      prisma.site.findUnique({ where: { organizationId_code: { organizationId, code } } }),

    create: (organizationId: string, data: CreateSiteInput) =>
      prisma.site.create({ data: { ...data, organizationId } }),

    update: (id: string, data: UpdateSiteInput) => prisma.site.update({ where: { id }, data }),

    addMember: (siteId: string, userId: string, role: string) =>
      prisma.siteMember.upsert({
        where: { siteId_userId: { siteId, userId } },
        update: { role },
        create: { siteId, userId, role },
      }),

    removeMember: (siteId: string, userId: string) =>
      prisma.siteMember.delete({ where: { siteId_userId: { siteId, userId } } }),
  };
}
