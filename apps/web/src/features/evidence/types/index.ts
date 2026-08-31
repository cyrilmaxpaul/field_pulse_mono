export type EvidenceType = "PHOTO" | "VIDEO" | "DOCUMENT" | "SIGNATURE" | "NOTE";
export type EvidenceStatus = "PENDING_UPLOAD" | "UPLOADING" | "UPLOADED" | "FAILED" | "DELETED";

export interface Evidence {
  id: string;
  inspectionId: string;
  questionId: string | null;
  type: EvidenceType;
  fileName: string;
  mimeType: string;
  fileSize: string;
  status: EvidenceStatus;
  viewUrl: string | null;
  uploadedBy: { id: string; firstName: string; lastName: string };
  createdAt: string;
}

export interface PresignResult {
  evidenceId: string;
  storageKey: string;
  uploadUrl: string;
}
