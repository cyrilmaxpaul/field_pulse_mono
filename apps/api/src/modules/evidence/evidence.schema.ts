import { z } from "zod";

export const EVIDENCE_TYPES = ["PHOTO", "VIDEO", "DOCUMENT", "SIGNATURE", "NOTE"] as const;

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const presignEvidenceSchema = z.object({
  inspectionId: z.string().uuid(),
  questionId: z.string().uuid().optional(),
  fileName: z.string().min(1).max(255),
  mimeType: z.enum(ALLOWED_MIME_TYPES as [string, ...string[]]),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(MAX_FILE_SIZE_BYTES, `File must be smaller than ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB.`),
});

export const finalizeEvidenceSchema = z.object({
  id: z.string().uuid(),
  inspectionId: z.string().uuid(),
  questionId: z.string().uuid().optional(),
  storageKey: z.string().min(1),
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(1),
  fileSize: z.number().int().positive(),
  type: z.enum(EVIDENCE_TYPES),
});

export type PresignEvidenceInput = z.infer<typeof presignEvidenceSchema>;
export type FinalizeEvidenceInput = z.infer<typeof finalizeEvidenceSchema>;
