import type { InspectionStatus, PrismaClient } from "@prisma/client";
import { AppError } from "../../middleware/errorHandler.js";
import { userHasPermission } from "../../middleware/permissions.js";
import { createInspectionRepository } from "./inspection.repository.js";
import { toInspectionDetailDto, toInspectionSummaryDto } from "./inspection.mapper.js";
import type { CreateInspectionInput, ListInspectionsQuery, UpdateInspectionInput } from "./inspection.schema.js";

const ALLOWED_TRANSITIONS: Record<InspectionStatus, InspectionStatus[]> = {
  ASSIGNED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["SUBMITTED", "CANCELLED"],
  PENDING_SYNC: ["SUBMITTED"],
  SUBMITTED: ["IN_REVIEW"],
  IN_REVIEW: ["REWORK_REQUIRED", "APPROVED"],
  REWORK_REQUIRED: ["IN_PROGRESS"],
  APPROVED: [],
  CANCELLED: [],
};

function assertTransition(current: InspectionStatus, target: InspectionStatus) {
  if (!ALLOWED_TRANSITIONS[current].includes(target)) {
    throw new AppError(
      409,
      "INVALID_TRANSITION",
      `Cannot move an inspection from ${current} to ${target}.`,
    );
  }
}

export function createInspectionService(prisma: PrismaClient) {
  const repo = createInspectionRepository(prisma);

  async function requireInspection(organizationId: string, id: string) {
    const inspection = await repo.findById(organizationId, id);
    if (!inspection) throw new AppError(404, "NOT_FOUND", "Inspection not found.");
    return inspection;
  }

  function assertAssignee(inspection: { assignedTo: string }, userId: string) {
    if (inspection.assignedTo !== userId) {
      throw new AppError(403, "FORBIDDEN", "Only the assigned worker can perform this action.");
    }
  }

  return {
    async list(organizationId: string, userId: string, query: ListInspectionsQuery) {
      const canReadAll = await userHasPermission(prisma, userId, "inspection.read");
      const inspections = await repo.list(organizationId, {
        status: query.status,
        ...(canReadAll ? {} : { assignedTo: userId }),
      });
      return inspections.map(toInspectionSummaryDto);
    },

    async get(organizationId: string, userId: string, id: string) {
      const inspection = await requireInspection(organizationId, id);
      const canReadAll = await userHasPermission(prisma, userId, "inspection.read");
      if (!canReadAll && inspection.assignedTo !== userId) {
        throw new AppError(403, "FORBIDDEN", "You do not have access to this inspection.");
      }
      return toInspectionDetailDto(inspection);
    },

    async create(organizationId: string, input: CreateInspectionInput) {
      const site = await repo.findSite(organizationId, input.siteId);
      if (!site) throw new AppError(404, "SITE_NOT_FOUND", "Site not found or inactive.");

      const templateVersion = await repo.findPublishedTemplateVersion(organizationId, input.templateVersionId);
      if (!templateVersion) {
        throw new AppError(400, "TEMPLATE_NOT_PUBLISHED", "Template version must be a published version.");
      }

      const assignee = await repo.findActiveOrgUser(organizationId, input.assignedTo);
      if (!assignee) throw new AppError(404, "USER_NOT_FOUND", "Assigned user not found or inactive.");

      const inspection = await repo.create(organizationId, {
        siteId: input.siteId,
        templateVersionId: input.templateVersionId,
        assignedTo: input.assignedTo,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
      });
      return toInspectionDetailDto(inspection);
    },

    async update(organizationId: string, id: string, input: UpdateInspectionInput) {
      const inspection = await requireInspection(organizationId, id);
      if (inspection.status !== "ASSIGNED") {
        throw new AppError(409, "NOT_EDITABLE", "Only unstarted inspections can be reassigned or rescheduled.");
      }
      if (input.assignedTo) {
        const assignee = await repo.findActiveOrgUser(organizationId, input.assignedTo);
        if (!assignee) throw new AppError(404, "USER_NOT_FOUND", "Assigned user not found or inactive.");
      }
      const updated = await repo.update(id, {
        assignedTo: input.assignedTo,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
      });
      return toInspectionDetailDto(updated);
    },

    async start(organizationId: string, userId: string, id: string) {
      const inspection = await requireInspection(organizationId, id);
      assertAssignee(inspection, userId);
      assertTransition(inspection.status, "IN_PROGRESS");

      const updated = await repo.setStatus(id, { status: "IN_PROGRESS", startedAt: new Date() });
      return toInspectionDetailDto(updated);
    },

    async saveResponse(organizationId: string, userId: string, id: string, questionId: string, value: unknown) {
      const inspection = await requireInspection(organizationId, id);
      assertAssignee(inspection, userId);
      if (inspection.status !== "IN_PROGRESS") {
        throw new AppError(409, "NOT_IN_PROGRESS", "Start the inspection before recording responses.");
      }

      const question = await repo.findQuestionInVersion(inspection.templateVersionId, questionId);
      if (!question) throw new AppError(404, "QUESTION_NOT_FOUND", "Question does not belong to this inspection.");

      await repo.upsertResponse(id, questionId, value);
      return this.get(organizationId, userId, id);
    },

    async submit(organizationId: string, userId: string, id: string) {
      const inspection = await requireInspection(organizationId, id);
      assertAssignee(inspection, userId);
      assertTransition(inspection.status, "SUBMITTED");

      const answeredQuestionIds = new Set(inspection.responses.map((r) => r.questionId));
      const allQuestions = inspection.templateVersion.sections.flatMap((s) => s.questions);

      const missingAnswers = allQuestions.filter((q) => q.isRequired && !answeredQuestionIds.has(q.id));
      if (missingAnswers.length > 0) {
        throw new AppError(400, "VALIDATION_ERROR", "All required questions must be answered before submitting.", {
          questions: missingAnswers.map((q) => q.label).join(", "),
        });
      }

      const evidencedQuestionIds = await repo.listEvidencedQuestionIds(id);
      const missingEvidence = allQuestions.filter((q) => q.evidenceRequired && !evidencedQuestionIds.has(q.id));
      if (missingEvidence.length > 0) {
        throw new AppError(400, "VALIDATION_ERROR", "Required evidence is missing for some questions.", {
          questions: missingEvidence.map((q) => q.label).join(", "),
        });
      }

      const updated = await repo.setStatus(id, { status: "SUBMITTED", submittedAt: new Date() });
      return toInspectionDetailDto(updated);
    },

    async cancel(organizationId: string, id: string) {
      const inspection = await requireInspection(organizationId, id);
      assertTransition(inspection.status, "CANCELLED");

      const updated = await repo.setStatus(id, { status: "CANCELLED" });
      return toInspectionDetailDto(updated);
    },
  };
}
