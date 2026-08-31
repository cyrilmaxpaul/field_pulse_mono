import type { EvidenceStatus, EvidenceType, PrismaClient } from "@prisma/client";

export function createEvidenceRepository(prisma: PrismaClient) {
  return {
    findInspection: (organizationId: string, inspectionId: string) =>
      prisma.inspection.findFirst({ where: { id: inspectionId, organizationId } }),

    findQuestionInVersion: (templateVersionId: string, questionId: string) =>
      prisma.templateQuestion.findFirst({ where: { id: questionId, section: { templateVersionId } } }),

    listByInspection: (inspectionId: string) =>
      prisma.evidence.findMany({
        where: { inspectionId, status: { not: "DELETED" } },
        orderBy: { createdAt: "asc" },
        include: { uploader: { select: { id: true, firstName: true, lastName: true } } },
      }),

    findById: (organizationId: string, id: string) =>
      prisma.evidence.findFirst({ where: { id, organizationId } }),

    create: (data: {
      id: string;
      organizationId: string;
      inspectionId: string;
      questionId?: string;
      type: EvidenceType;
      storageKey: string;
      fileName: string;
      mimeType: string;
      fileSize: number;
      uploadedBy: string;
      status: EvidenceStatus;
    }) => prisma.evidence.create({ data, include: { uploader: { select: { id: true, firstName: true, lastName: true } } } }),

    softDelete: (id: string) => prisma.evidence.update({ where: { id }, data: { status: "DELETED" } }),

    countByQuestion: (inspectionId: string, questionId: string) =>
      prisma.evidence.count({ where: { inspectionId, questionId, status: { not: "DELETED" } } }),
  };
}
