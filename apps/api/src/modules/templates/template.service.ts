import type { PrismaClient } from "@prisma/client";
import { AppError } from "../../middleware/errorHandler.js";
import { createTemplateRepository } from "./template.repository.js";
import { toTemplateDetailDto, toTemplateSummaryDto, toVersionDetailDto } from "./template.mapper.js";
import type { CreateTemplateInput, ReplaceStructureInput, UpdateTemplateInput } from "./template.schema.js";

function versionToStructureInput(version: {
  sections: { title: string; description: string | null; questions: unknown[] }[];
}): ReplaceStructureInput {
  return {
    sections: version.sections.map((section) => ({
      title: section.title,
      description: section.description ?? undefined,
      questions: (section.questions as any[]).map((q) => ({
        questionKey: q.questionKey,
        label: q.label,
        description: q.description ?? undefined,
        questionType: q.questionType,
        isRequired: q.isRequired,
        validationRules: q.validationRules ?? undefined,
        options: q.options ?? undefined,
        conditionalRules: q.conditionalRules ?? undefined,
        evidenceRequired: q.evidenceRequired,
      })),
    })),
  };
}

export function createTemplateService(prisma: PrismaClient) {
  const repo = createTemplateRepository(prisma);

  async function requireTemplate(organizationId: string, id: string) {
    const template = await repo.findTemplateOnly(organizationId, id);
    if (!template) throw new AppError(404, "NOT_FOUND", "Template not found.");
    return template;
  }

  return {
    async list(organizationId: string) {
      const templates = await repo.listByOrganization(organizationId);
      return templates.map(toTemplateSummaryDto);
    },

    async get(organizationId: string, id: string) {
      const template = await repo.findById(organizationId, id);
      if (!template) throw new AppError(404, "NOT_FOUND", "Template not found.");
      return toTemplateDetailDto(template);
    },

    async create(organizationId: string, createdBy: string, input: CreateTemplateInput) {
      const template = await repo.createWithFirstVersion(organizationId, createdBy, input);
      return toTemplateDetailDto(template as Parameters<typeof toTemplateDetailDto>[0]);
    },

    async update(organizationId: string, id: string, input: UpdateTemplateInput) {
      await requireTemplate(organizationId, id);
      await repo.updateMeta(id, input);
      return this.get(organizationId, id);
    },

    async archive(organizationId: string, id: string) {
      await requireTemplate(organizationId, id);
      await repo.archive(id);
      return this.get(organizationId, id);
    },

    async publish(organizationId: string, id: string) {
      await requireTemplate(organizationId, id);
      const latest = await repo.findLatestVersion(id);
      if (!latest || latest.status !== "DRAFT") {
        throw new AppError(409, "NO_DRAFT_VERSION", "There is no draft version to publish.");
      }
      await repo.publishVersion(id, latest.id);
      return this.get(organizationId, id);
    },

    async createDraftVersion(organizationId: string, id: string, createdBy: string) {
      await requireTemplate(organizationId, id);
      const latest = await repo.findLatestVersion(id);
      if (!latest) throw new AppError(404, "NOT_FOUND", "Template has no versions.");
      if (latest.status === "DRAFT") {
        throw new AppError(409, "DRAFT_EXISTS", "A draft version already exists. Edit it instead.", undefined);
      }
      const version = await repo.createDraftVersionFrom(id, createdBy, latest);
      return toVersionDetailDto(version);
    },

    async getVersion(organizationId: string, templateId: string, versionId: string) {
      const version = await repo.findVersion(organizationId, templateId, versionId);
      if (!version) throw new AppError(404, "NOT_FOUND", "Template version not found.");
      return toVersionDetailDto(version);
    },

    async replaceStructure(
      organizationId: string,
      templateId: string,
      versionId: string,
      input: ReplaceStructureInput,
    ) {
      const version = await repo.findVersion(organizationId, templateId, versionId);
      if (!version) throw new AppError(404, "NOT_FOUND", "Template version not found.");
      if (version.status !== "DRAFT") {
        throw new AppError(409, "VERSION_NOT_EDITABLE", "Only draft versions can be edited.");
      }
      const updated = await repo.replaceStructure(versionId, input);
      return toVersionDetailDto(updated);
    },

    async duplicate(organizationId: string, id: string, createdBy: string) {
      const template = await requireTemplate(organizationId, id);
      const source = template.currentVersionId
        ? await repo.findVersion(organizationId, id, template.currentVersionId)
        : await repo.findLatestVersion(id);
      if (!source) throw new AppError(404, "NOT_FOUND", "Template has no versions to duplicate.");

      const created = await repo.createWithFirstVersion(organizationId, createdBy, {
        name: `${template.name} (Copy)`,
        description: template.description ?? undefined,
      });
      const newVersion = (created as any).versions[0];
      await repo.replaceStructure(newVersion.id, versionToStructureInput(source));

      return this.get(organizationId, created.id);
    },

    async preview(organizationId: string, id: string) {
      const template = await requireTemplate(organizationId, id);
      const version = template.currentVersionId
        ? await repo.findVersion(organizationId, id, template.currentVersionId)
        : await repo.findLatestVersion(id);
      if (!version) throw new AppError(404, "NOT_FOUND", "Template has no versions.");
      return toVersionDetailDto(version);
    },
  };
}
