import { z } from "zod";

export const syncOperationSchema = z.object({
  entityType: z.enum(["inspection_response", "evidence"]),
  entityId: z.string().min(1),
  operation: z.enum(["CREATE", "UPDATE", "DELETE"]),
  clientVersion: z.number().int().min(0),
  payload: z.unknown(),
});

export const pushSyncSchema = z.object({
  deviceId: z.string().min(1),
  deviceName: z.string().min(1).optional(),
  platform: z.string().min(1).optional(),
  appVersion: z.string().min(1).optional(),
  operations: z.array(syncOperationSchema).min(1),
});

export const resolveSyncSchema = z.object({
  syncOperationId: z.string().uuid(),
  resolution: z.enum(["KEEP_SERVER", "KEEP_CLIENT", "MERGE"]),
  mergedValue: z.unknown().optional(),
});

export const pullSyncQuerySchema = z.object({
  deviceId: z.string().min(1),
  since: z.string().datetime().optional(),
});

export const statusQuerySchema = z.object({
  deviceId: z.string().min(1),
});

export type SyncOperationInput = z.infer<typeof syncOperationSchema>;
export type PushSyncInput = z.infer<typeof pushSyncSchema>;
export type ResolveSyncInput = z.infer<typeof resolveSyncSchema>;
export type PullSyncQuery = z.infer<typeof pullSyncQuerySchema>;
export type StatusQuery = z.infer<typeof statusQuerySchema>;
