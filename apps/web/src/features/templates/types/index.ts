export const QUESTION_TYPES = [
  "YES_NO",
  "PASS_FAIL",
  "CHECKBOX",
  "SINGLE_SELECT",
  "MULTI_SELECT",
  "TEXT",
  "NUMBER",
  "DECIMAL",
  "DATE",
  "TIME",
  "RATING",
  "MEASUREMENT",
  "PHOTO",
  "SIGNATURE",
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

export interface TemplateSummary {
  id: string;
  name: string;
  description: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  currentVersionId: string | null;
  currentVersionNumber: number | null;
  latestVersionNumber: number | null;
  latestVersionId: string | null;
  latestVersionStatus: "DRAFT" | "PUBLISHED" | null;
  sectionsCount: number;
  questionsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateVersionSummary {
  id: string;
  versionNumber: number;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  createdAt: string;
}

export interface TemplateDetail {
  id: string;
  name: string;
  description: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  currentVersion: { id: string; versionNumber: number } | null;
  versions: TemplateVersionSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  questionKey: string;
  label: string;
  description: string | null;
  questionType: QuestionType;
  isRequired: boolean;
  displayOrder: number;
  validationRules: unknown;
  options: string[] | null;
  conditionalRules: unknown;
  evidenceRequired: boolean;
}

export interface Section {
  id: string;
  title: string;
  description: string | null;
  displayOrder: number;
  questions: Question[];
}

export interface VersionDetail {
  id: string;
  versionNumber: number;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  sections: Section[];
}

export interface CreateTemplateInput {
  name: string;
  description?: string;
}

export interface StructureQuestionInput {
  questionKey: string;
  label: string;
  description?: string;
  questionType: QuestionType;
  isRequired: boolean;
  options?: string[];
  evidenceRequired: boolean;
}

export interface StructureSectionInput {
  title: string;
  description?: string;
  questions: StructureQuestionInput[];
}

export interface ReplaceStructureInput {
  sections: StructureSectionInput[];
}
