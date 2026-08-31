import type { QuestionType } from "../../templates/types";

export type InspectionStatus =
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "PENDING_SYNC"
  | "SUBMITTED"
  | "IN_REVIEW"
  | "REWORK_REQUIRED"
  | "APPROVED"
  | "CANCELLED";

export interface InspectionSummary {
  id: string;
  status: InspectionStatus;
  site: { id: string; name: string; code: string };
  assignee: { id: string; firstName: string; lastName: string; email: string };
  templateName: string;
  templateVersionNumber: number;
  scheduledAt: string | null;
  startedAt: string | null;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionQuestion {
  id: string;
  questionKey: string;
  label: string;
  description: string | null;
  questionType: QuestionType;
  isRequired: boolean;
  options: string[] | null;
  evidenceRequired: boolean;
}

export interface InspectionSection {
  id: string;
  title: string;
  description: string | null;
  questions: InspectionQuestion[];
}

export interface InspectionResponse {
  questionId: string;
  value: unknown;
  answeredAt: string;
  serverVersion: number;
}

export interface InspectionDetail {
  id: string;
  status: InspectionStatus;
  site: { id: string; name: string; code: string };
  assignee: { id: string; firstName: string; lastName: string; email: string };
  reviewer: { id: string; firstName: string; lastName: string; email: string } | null;
  scheduledAt: string | null;
  startedAt: string | null;
  submittedAt: string | null;
  completedAt: string | null;
  template: { id: string; name: string };
  templateVersion: { id: string; versionNumber: number; sections: InspectionSection[] };
  responses: InspectionResponse[];
  progress: {
    totalQuestions: number;
    answeredQuestions: number;
    requiredQuestions: number;
    answeredRequiredQuestions: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateInspectionInput {
  siteId: string;
  templateVersionId: string;
  assignedTo: string;
  scheduledAt?: string;
}
