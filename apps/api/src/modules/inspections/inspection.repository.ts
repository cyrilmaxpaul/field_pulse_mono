import type { InspectionStatus, Prisma, PrismaClient } from "@prisma/client";

const detailInclude = {
  site: { select: { id: true, name: true, code: true } },
  assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
  reviewer: { select: { id: true, firstName: true, lastName: true, email: true } },
  templateVersion: {
    include: {
      template: { select: { id: true, name: true } },
      sections: {
        orderBy: { displayOrder: "asc" as const },
        include: { questions: { orderBy: { displayOrder: "asc" as const } } },
      },
    },
  },
  responses: true,
} satisfies Prisma.InspectionInclude;

const summaryInclude = {
  site: { select: { id: true, name: true, code: true } },
  assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
  templateVersion: { include: { template: { select: { id: true, name: true } } } },
} satisfies Prisma.InspectionInclude;

export function createInspectionRepository(prisma: PrismaClient) {
  return {
    list: (organizationId: string, filter: { assignedTo?: string; status?: InspectionStatus }) =>
      prisma.inspection.findMany({
        where: { organizationId, ...filter },
        orderBy: { createdAt: "desc" },
        include: summaryInclude,
      }),

    findById: (organizationId: string, id: string) =>
      prisma.inspection.findFirst({ where: { id, organizationId }, include: detailInclude }),

    findSite: (organizationId: string, siteId: string) =>
      prisma.site.findFirst({ where: { id: siteId, organizationId, status: "ACTIVE" } }),

    findPublishedTemplateVersion: (organizationId: string, templateVersionId: string) =>
      prisma.templateVersion.findFirst({
        where: { id: templateVersionId, status: "PUBLISHED", template: { organizationId } },
      }),

    findActiveOrgUser: (organizationId: string, userId: string) =>
      prisma.user.findFirst({ where: { id: userId, organizationId, status: "ACTIVE" } }),

    create: (
      organizationId: string,
      data: { siteId: string; templateVersionId: string; assignedTo: string; scheduledAt?: Date },
    ) =>
      prisma.inspection.create({
        data: { organizationId, ...data },
        include: detailInclude,
      }),

    update: (id: string, data: { assignedTo?: string; scheduledAt?: Date }) =>
      prisma.inspection.update({ where: { id }, data, include: detailInclude }),

    setStatus: (id: string, data: Partial<Prisma.InspectionUncheckedUpdateInput>) =>
      prisma.inspection.update({ where: { id }, data, include: detailInclude }),

    upsertResponse: (inspectionId: string, questionId: string, value: unknown) =>
      prisma.inspectionResponse.upsert({
        where: { inspectionId_questionId: { inspectionId, questionId } },
        update: { value: value as Prisma.InputJsonValue, answeredAt: new Date() },
        create: { inspectionId, questionId, value: value as Prisma.InputJsonValue },
      }),

    async listEvidencedQuestionIds(inspectionId: string) {
      const rows = await prisma.evidence.findMany({
        where: { inspectionId, status: { not: "DELETED" }, questionId: { not: null } },
        select: { questionId: true },
        distinct: ["questionId"],
      });
      return new Set(rows.map((r) => r.questionId as string));
    },

    findQuestionInVersion: (templateVersionId: string, questionId: string) =>
      prisma.templateQuestion.findFirst({
        where: { id: questionId, section: { templateVersionId } },
      }),
  };
}
