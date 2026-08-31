import { apiRequest } from "../../../lib/api/client";
import { getDeviceMeta } from "../../../lib/offline/deviceId";
import type { PushSyncResponse, ResolveSyncInput, SyncOperationRequest } from "../types";

export function pushSync(deviceId: string, operations: SyncOperationRequest[]) {
  return apiRequest<PushSyncResponse>("/sync/push", {
    method: "POST",
    body: JSON.stringify({ deviceId, ...getDeviceMeta(), operations }),
  });
}

export function resolveSync(input: ResolveSyncInput) {
  return apiRequest<{ resolution: string }>("/sync/resolve", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
