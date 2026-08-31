import { db } from "../db/db";
import { queryClient } from "../api/queryClient";
import { saveResponse } from "../../features/inspections/api/inspectionsApi";
import { uploadEvidenceFile } from "../../features/evidence/api/evidenceApi";

let isSyncing = false;

async function flushPendingResponses() {
  const rows = await db.pendingResponses.toArray();
  for (const row of rows) {
    try {
      await saveResponse(row.inspectionId, row.questionId, row.value);
      await db.pendingResponses.delete(row.key);
    } catch {
      // Leave it queued — will retry on the next flush (next reconnect or manual Sync Now).
    }
  }
}

async function flushPendingEvidence() {
  const rows = await db.pendingEvidence.where("status").anyOf(["pending", "failed"]).toArray();
  for (const row of rows) {
    if (row.localId === undefined) continue;
    await db.pendingEvidence.update(row.localId, { status: "syncing" });
    try {
      const file = new File([row.fileBlob], row.fileName, { type: row.mimeType });
      await uploadEvidenceFile({ inspectionId: row.inspectionId, questionId: row.questionId, file });
      await db.pendingEvidence.delete(row.localId);
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
