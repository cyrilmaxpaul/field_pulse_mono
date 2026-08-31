import { z } from "zod";

export const createInspectionSchema = z.object({
  siteId: z.string().uuid(),
  templateVersionId: z.string().uuid(),
  assignedTo: z.string().uuid(),
  scheduledAt: z.string().datetime().optional(),
});

export const updateInspectionSchema = z.object({
  assignedTo: z.string().uuid().optional(),
  scheduledAt: z.string().datetime().optional(),
});

export const saveResponseSchema = z.object({
  value: z.unknown(),
});

export const listInspectionsQuerySchema = z.object({
  status: z
    .enum(["ASSIGNED", "IN_PROGRESS", "PENDING_SYNC", "SUBMITTED", "IN_REVIEW", "REWORK_REQUIRED", "APPROVED", "CANCELLED"])
    .optional(),
});

export type CreateInspectionInput = z.infer<typeof createInspectionSchema>;
export type UpdateInspectionInput = z.infer<typeof updateInspectionSchema>;
export type SaveResponseInput = z.infer<typeof saveResponseSchema>;
export type ListInspectionsQuery = z.infer<typeof listInspectionsQuerySchema>;
