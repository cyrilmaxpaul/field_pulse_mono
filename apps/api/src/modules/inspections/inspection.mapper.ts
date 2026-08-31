import type {
  Inspection,
  InspectionResponse,
  Site,
  TemplateQuestion,
  TemplateSection,
  TemplateVersion,
  InspectionTemplate,
  User,
} from "@prisma/client";

type UserRef = Pick<User, "id" | "firstName" | "lastName" | "email">;

type InspectionSummary = Inspection & {
  site: Pick<Site, "id" | "name" | "code">;
  assignee: UserRef;
  templateVersion: TemplateVersion & { template: Pick<InspectionTemplate, "id" | "name"> };
};

export function toInspectionSummaryDto(inspection: InspectionSummary) {
  return {
    id: inspection.id,
    status: inspection.status,
    site: inspection.site,
    assignee: inspection.assignee,
    templateName: inspection.templateVersion.template.name,
    templateVersionNumber: inspection.templateVersion.versionNumber,
    scheduledAt: inspection.scheduledAt,
    startedAt: inspection.startedAt,
    submittedAt: inspection.submittedAt,
    createdAt: inspection.createdAt,
    updatedAt: inspection.updatedAt,
  };
}

type SectionWithQuestions = TemplateSection & { questions: TemplateQuestion[] };
type InspectionDetail = Inspection & {
  site: Pick<Site, "id" | "name" | "code">;
  assignee: UserRef;
  reviewer: UserRef | null;
  templateVersion: TemplateVersion & {
    template: Pick<InspectionTemplate, "id" | "name">;
    sections: SectionWithQuestions[];
  };
  responses: InspectionResponse[];
};

export function toInspectionDetailDto(inspection: InspectionDetail) {
  const responseByQuestionId = new Map(inspection.responses.map((r) => [r.questionId, r]));

  const allQuestions = inspection.templateVersion.sections.flatMap((s) => s.questions);
  const requiredQuestions = allQuestions.filter((q) => q.isRequired);
  const answeredRequired = requiredQuestions.filter((q) => responseByQuestionId.has(q.id));

  return {
    id: inspection.id,
    status: inspection.status,
    site: inspection.site,
    assignee: inspection.assignee,
    reviewer: inspection.reviewer,
    scheduledAt: inspection.scheduledAt,
    startedAt: inspection.startedAt,
    submittedAt: inspection.submittedAt,
    completedAt: inspection.completedAt,
    template: {
      id: inspection.templateVersion.template.id,
      name: inspection.templateVersion.template.name,
    },
    templateVersion: {
      id: inspection.templateVersion.id,
      versionNumber: inspection.templateVersion.versionNumber,
      sections: inspection.templateVersion.sections.map((section) => ({
        id: section.id,
        title: section.title,
        description: section.description,
        questions: section.questions.map((question) => ({
          id: question.id,
          questionKey: question.questionKey,
          label: question.label,
          description: question.description,
          questionType: question.questionType,
          isRequired: question.isRequired,
          options: question.options,
          evidenceRequired: question.evidenceRequired,
        })),
      })),
    },
    responses: inspection.responses.map((r) => ({
      questionId: r.questionId,
      value: r.value,
      answeredAt: r.answeredAt,
      serverVersion: r.serverVersion,
    })),
    progress: {
      totalQuestions: allQuestions.length,
      answeredQuestions: responseByQuestionId.size,
      requiredQuestions: requiredQuestions.length,
      answeredRequiredQuestions: answeredRequired.length,
    },
    createdAt: inspection.createdAt,
    updatedAt: inspection.updatedAt,
  };
}
