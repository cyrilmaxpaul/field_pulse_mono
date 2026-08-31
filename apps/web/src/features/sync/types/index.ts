export type SyncEntityType = "inspection_response" | "evidence";
export type SyncOperationKind = "CREATE" | "UPDATE" | "DELETE";
export type SyncResultStatus = "COMPLETED" | "CONFLICT" | "FAILED";

export interface SyncOperationRequest {
  entityType: SyncEntityType;
  entityId: string;
  operation: SyncOperationKind;
  clientVersion: number;
  payload: unknown;
}

export interface SyncOperationResult {
  syncOperationId: string;
  entityId: string;
  status: SyncResultStatus;
  server?: { value: unknown; serverVersion: number } | null;
  error?: string;
}

export interface PushSyncResponse {
  deviceId: string;
  results: SyncOperationResult[];
}

export type SyncResolution = "KEEP_SERVER" | "KEEP_CLIENT" | "MERGE";

export interface ResolveSyncInput {
  syncOperationId: string;
  resolution: SyncResolution;
  mergedValue?: unknown;
}
