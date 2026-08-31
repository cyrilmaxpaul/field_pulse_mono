import { z } from "zod";

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

export const createTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
});

export const updateTemplateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
});

const questionSchema = z.object({
  questionKey: z.string().min(1).max(100),
  label: z.string().min(1).max(500),
  description: z.string().max(1000).optional(),
  questionType: z.enum(QUESTION_TYPES),
  isRequired: z.boolean().default(false),
  validationRules: z.unknown().optional(),
  options: z.unknown().optional(),
  conditionalRules: z.unknown().optional(),
  evidenceRequired: z.boolean().default(false),
});

const sectionSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  questions: z.array(questionSchema).default([]),
});

export const replaceStructureSchema = z.object({
  sections: z.array(sectionSchema).default([]),
});

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
export type ReplaceStructureInput = z.infer<typeof replaceStructureSchema>;
