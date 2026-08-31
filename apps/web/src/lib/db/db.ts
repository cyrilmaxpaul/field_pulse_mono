import Dexie, { type Table } from "dexie";
import type { InspectionDetail } from "../../features/inspections/types";

export interface CachedInspection {
  id: string;
  data: InspectionDetail;
  cachedAt: number;
}

export interface PendingResponse {
  key: string; // `${inspectionId}:${questionId}` — one pending row per question, naturally upserted
  inspectionId: string;
  questionId: string;
  value: unknown;
  updatedAt: number;
}

export interface PendingEvidence {
  localId?: number;
  inspectionId: string;
  questionId: string;
  fileBlob: Blob;
  fileName: string;
  mimeType: string;
  fileSize: number;
  createdAt: number;
  status: "pending" | "syncing" | "failed";
}

class FieldPulseDB extends Dexie {
  cachedInspections!: Table<CachedInspection, string>;
  pendingResponses!: Table<PendingResponse, string>;
  pendingEvidence!: Table<PendingEvidence, number>;

  constructor() {
    super("fieldpulse-offline-store");
    this.version(1).stores({
      cachedInspections: "id",
      pendingResponses: "key, inspectionId",
      pendingEvidence: "++localId, inspectionId",
    });
    // v2: index `status` — the sync flush queries pendingEvidence by status,
    // which Dexie can only do against an indexed field.
    this.version(2).stores({
      cachedInspections: "id",
      pendingResponses: "key, inspectionId",
      pendingEvidence: "++localId, inspectionId, status",
    });
  }
}

export const db = new FieldPulseDB();
