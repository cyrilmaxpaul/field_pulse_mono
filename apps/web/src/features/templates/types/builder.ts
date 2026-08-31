import type { QuestionType } from "./index";

export interface LocalQuestion {
  localId: string;
  questionKey: string;
  label: string;
  questionType: QuestionType;
  isRequired: boolean;
  evidenceRequired: boolean;
  options: string[];
}

export interface LocalSection {
  localId: string;
  title: string;
  questions: LocalQuestion[];
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  YES_NO: "Yes / No",
  PASS_FAIL: "Pass / Fail",
  CHECKBOX: "Checkbox",
  SINGLE_SELECT: "Single select",
  MULTI_SELECT: "Multi select",
  TEXT: "Text",
  NUMBER: "Number",
  DECIMAL: "Decimal",
  DATE: "Date",
  TIME: "Time",
  RATING: "Rating",
  MEASUREMENT: "Measurement",
  PHOTO: "Photo required",
  SIGNATURE: "Signature",
};

let counter = 0;
export function newLocalId(prefix: string) {
  counter += 1;
  return `${prefix}-${Date.now()}-${counter}`;
}
