import type {
  InspectionTemplate,
  TemplateQuestion,
  TemplateSection,
  TemplateVersion,
} from "@prisma/client";

type VersionSummary = Pick<TemplateVersion, "id" | "versionNumber" | "status" | "publishedAt" | "createdAt">;

type SectionWithQuestions = TemplateSection & { questions: TemplateQuestion[] };
type VersionWithSections = TemplateVersion & { sections: SectionWithQuestions[] };

type TemplateForSummary = InspectionTemplate & {
  currentVersion: TemplateVersion | null;
  versions: VersionWithSections[];
};

export function toTemplateSummaryDto(template: TemplateForSummary) {
  const latest = template.versions[0] as VersionWithSections | undefined;
  const sectionsCount = latest?.sections.length ?? 0;
  const questionsCount = latest?.sections.reduce((sum, s) => sum + s.questions.length, 0) ?? 0;

  return {
    id: template.id,
    name: template.name,
    description: template.description,
    status: template.status,
    currentVersionId: template.currentVersion?.id ?? null,
    currentVersionNumber: template.currentVersion?.versionNumber ?? null,
    latestVersionNumber: latest?.versionNumber ?? null,
    latestVersionId: latest?.id ?? null,
    latestVersionStatus: latest?.status ?? null,
    sectionsCount,
    questionsCount,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
  };
}

type TemplateForDetail = InspectionTemplate & {
  currentVersion: TemplateVersion | null;
  versions: VersionSummary[];
};

export function toTemplateDetailDto(template: TemplateForDetail) {
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    status: template.status,
    currentVersion: template.currentVersion
      ? { id: template.currentVersion.id, versionNumber: template.currentVersion.versionNumber }
      : null,
    versions: template.versions.map((v) => ({
      id: v.id,
      versionNumber: v.versionNumber,
      status: v.status,
      publishedAt: v.publishedAt,
      createdAt: v.createdAt,
    })),
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
  };
}

export function toVersionDetailDto(version: VersionWithSections) {
  return {
    id: version.id,
    versionNumber: version.versionNumber,
    status: version.status,
    publishedAt: version.publishedAt,
    sections: version.sections.map((section) => ({
      id: section.id,
      title: section.title,
      description: section.description,
      displayOrder: section.displayOrder,
      questions: section.questions.map((question) => ({
        id: question.id,
        questionKey: question.questionKey,
        label: question.label,
        description: question.description,
        questionType: question.questionType,
        isRequired: question.isRequired,
        displayOrder: question.displayOrder,
        validationRules: question.validationRules,
        options: question.options,
        conditionalRules: question.conditionalRules,
        evidenceRequired: question.evidenceRequired,
      })),
    })),
  };
}
