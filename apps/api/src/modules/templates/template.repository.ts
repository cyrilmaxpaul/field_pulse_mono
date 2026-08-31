import type { Prisma, PrismaClient } from "@prisma/client";
import type { ReplaceStructureInput } from "./template.schema.js";

const latestVersionWithStructure = {
  versions: {
    orderBy: { versionNumber: "desc" as const },
    take: 1,
    include: { sections: { orderBy: { displayOrder: "asc" as const }, include: { questions: { orderBy: { displayOrder: "asc" as const } } } } },
  },
} satisfies Prisma.InspectionTemplateInclude;

const versionWithStructure = {
  sections: {
    orderBy: { displayOrder: "asc" as const },
    include: { questions: { orderBy: { displayOrder: "asc" as const } } },
  },
} satisfies Prisma.TemplateVersionInclude;

type VersionWithStructure = Prisma.TemplateVersionGetPayload<{ include: typeof versionWithStructure }>;

export function createTemplateRepository(prisma: PrismaClient) {
  return {
    listByOrganization: (organizationId: string) =>
      prisma.inspectionTemplate.findMany({
        where: { organizationId },
        orderBy: { updatedAt: "desc" },
        include: { currentVersion: true, ...latestVersionWithStructure },
      }),

    findById: (organizationId: string, id: string) =>
      prisma.inspectionTemplate.findFirst({
        where: { id, organizationId },
        include: {
          currentVersion: true,
          versions: { orderBy: { versionNumber: "desc" }, select: { id: true, versionNumber: true, status: true, publishedAt: true, createdAt: true } },
        },
      }),

    findTemplateOnly: (organizationId: string, id: string) =>
      prisma.inspectionTemplate.findFirst({ where: { id, organizationId } }),

    findVersion: (organizationId: string, templateId: string, versionId: string) =>
      prisma.templateVersion.findFirst({
        where: { id: versionId, templateId, template: { organizationId } },
        include: versionWithStructure,
      }),

    findLatestVersion: (templateId: string) =>
      prisma.templateVersion.findFirst({
        where: { templateId },
        orderBy: { versionNumber: "desc" },
        include: versionWithStructure,
      }),

    async createWithFirstVersion(organizationId: string, createdBy: string, data: { name: string; description?: string }) {
      return prisma.inspectionTemplate.create({
        data: {
          organizationId,
          createdBy,
          name: data.name,
          description: data.description,
          versions: { create: { versionNumber: 1, status: "DRAFT", createdBy } },
        },
        include: { currentVersion: true, versions: true },
      });
    },

    updateMeta: (id: string, data: { name?: string; description?: string }) =>
      prisma.inspectionTemplate.update({ where: { id }, data }),

    archive: (id: string) => prisma.inspectionTemplate.update({ where: { id }, data: { status: "ARCHIVED" } }),

    async publishVersion(templateId: string, versionId: string) {
      return prisma.$transaction(async (tx) => {
        const version = await tx.templateVersion.update({
          where: { id: versionId },
          data: { status: "PUBLISHED", publishedAt: new Date() },
        });
        await tx.inspectionTemplate.update({
          where: { id: templateId },
          data: { status: "PUBLISHED", currentVersionId: versionId },
        });
        return version;
      });
    },

    async createDraftVersionFrom(templateId: string, createdBy: string, source: VersionWithStructure) {
      const nextVersionNumber = source.versionNumber + 1;
      return prisma.templateVersion.create({
        data: {
          templateId,
          versionNumber: nextVersionNumber,
          status: "DRAFT",
          createdBy,
          sections: {
            create: source.sections.map((section) => ({
              title: section.title,
              description: section.description,
              displayOrder: section.displayOrder,
              questions: {
                create: section.questions.map((question) => ({
                  questionKey: question.questionKey,
                  label: question.label,
                  description: question.description,
                  questionType: question.questionType,
                  isRequired: question.isRequired,
                  displayOrder: question.displayOrder,
                  validationRules: question.validationRules ?? undefined,
                  options: question.options ?? undefined,
                  conditionalRules: question.conditionalRules ?? undefined,
                  evidenceRequired: question.evidenceRequired,
                })),
              },
            })),
          },
        },
        include: versionWithStructure,
      });
    },

    async replaceStructure(versionId: string, structure: ReplaceStructureInput) {
      return prisma.$transaction(async (tx) => {
        await tx.templateSection.deleteMany({ where: { templateVersionId: versionId } });

        for (const [sectionIndex, section] of structure.sections.entries()) {
          await tx.templateSection.create({
            data: {
              templateVersionId: versionId,
              title: section.title,
              description: section.description,
              displayOrder: sectionIndex,
              questions: {
                create: section.questions.map((question, questionIndex) => ({
                  questionKey: question.questionKey,
                  label: question.label,
                  description: question.description,
                  questionType: question.questionType,
                  isRequired: question.isRequired,
                  displayOrder: questionIndex,
                  validationRules: question.validationRules ?? undefined,
                  options: question.options ?? undefined,
                  conditionalRules: question.conditionalRules ?? undefined,
                  evidenceRequired: question.evidenceRequired,
                })),
              },
            },
          });
        }

        return tx.templateVersion.findUniqueOrThrow({ where: { id: versionId }, include: versionWithStructure });
      });
    },
  };
}
