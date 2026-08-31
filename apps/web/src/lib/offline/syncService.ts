import { db } from "../db/db";
import { queryClient } from "../api/queryClient";
import { presignEvidence, uploadToPresignedUrl } from "../../features/evidence/api/evidenceApi";
import { pushSync } from "../../features/sync/api/syncApi";
import { getDeviceId } from "./deviceId";
import type { SyncOperationRequest } from "../../features/sync/types";

let isSyncing = false;

async function flushPendingResponses() {
  const rows = await db.pendingResponses.toArray();
  if (rows.length === 0) return;

  const operations: SyncOperationRequest[] = rows.map((row) => ({
    entityType: "inspection_response",
    entityId: row.key,
    operation: "UPDATE",
    clientVersion: row.baseVersion,
    payload: { value: row.value },
  }));

  try {
    const { results } = await pushSync(getDeviceId(), operations);
    for (const result of results) {
      if (result.status === "FAILED") continue; // leave queued — retry on the next flush

      const row = rows.find((r) => r.key === result.entityId);
      if (!row) continue;

      if (result.status === "CONFLICT") {
        await db.syncConflicts.add({
          syncOperationId: result.syncOperationId,
          inspectionId: row.inspectionId,
          questionId: row.questionId,
          clientValue: row.value,
          serverValue: result.server?.value,
          serverVersion: result.server?.serverVersion ?? row.baseVersion,
          detectedAt: Date.now(),
        });
      }
      await db.pendingResponses.delete(row.key);
    }
  } catch {
    // Whole-batch network/auth failure — leave everything queued for retry.
  }
}

async function flushPendingEvidence() {
  const rows = await db.pendingEvidence.where("status").anyOf(["pending", "failed"]).toArray();
  for (const row of rows) {
    if (row.localId === undefined) continue;
    await db.pendingEvidence.update(row.localId, { status: "syncing" });
    try {
      const file = new File([row.fileBlob], row.fileName, { type: row.mimeType });
      const presigned = await presignEvidence({
        inspectionId: row.inspectionId,
        questionId: row.questionId,
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
      });
      await uploadToPresignedUrl(presigned.uploadUrl, file);

      const { results } = await pushSync(getDeviceId(), [
        {
          entityType: "evidence",
          entityId: presigned.evidenceId,
          operation: "CREATE",
          clientVersion: 0,
          payload: {
            id: presigned.evidenceId,
            inspectionId: row.inspectionId,
            questionId: row.questionId,
            storageKey: presigned.storageKey,
            fileName: file.name,
            mimeType: file.type,
            fileSize: file.size,
            type: "PHOTO",
          },
        },
      ]);

      if (results[0]?.status === "COMPLETED") {
        await db.pendingEvidence.delete(row.localId);
      } else {
        await db.pendingEvidence.update(row.localId, { status: "failed" });
      }
    } catch {
      await db.pendingEvidence.update(row.localId, { status: "failed" });
    }
  }
}

export async function flushSyncQueue() {
  if (isSyncing || !navigator.onLine) return;
  isSyncing = true;
  try {
    const inspectionIds = new Set([
      ...(await db.pendingResponses.toCollection().primaryKeys()).map((k) => String(k).split(":")[0]),
      ...(await db.pendingEvidence.toArray()).map((e) => e.inspectionId),
    ]);

    await flushPendingResponses();
    await flushPendingEvidence();

    for (const id of inspectionIds) {
      queryClient.invalidateQueries({ queryKey: ["inspections", id] });
      queryClient.invalidateQueries({ queryKey: ["evidence", id] });
    }
    queryClient.invalidateQueries({ queryKey: ["inspections"] });
  } finally {
    isSyncing = false;
  }
}

export function initSyncOnReconnect() {
  window.addEventListener("online", () => {
    void flushSyncQueue();
  });
  if (navigator.onLine) {
    void flushSyncQueue();
  }
}
