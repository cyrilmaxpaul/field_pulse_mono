import { apiRequest } from "../../../lib/api/client";
import type { Evidence, PresignResult } from "../types";

export function listInspectionEvidence(inspectionId: string) {
  return apiRequest<Evidence[]>(`/inspections/${inspectionId}/evidence`);
}

function presignEvidence(input: {
  inspectionId: string;
  questionId?: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}) {
  return apiRequest<PresignResult>("/evidence/presign", { method: "POST", body: JSON.stringify(input) });
}

function finalizeEvidence(input: {
  id: string;
  inspectionId: string;
  questionId?: string;
  storageKey: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  type: "PHOTO";
}) {
  return apiRequest<Evidence>("/evidence", { method: "POST", body: JSON.stringify(input) });
}

export function deleteEvidence(id: string) {
  return apiRequest<null>(`/evidence/${id}`, { method: "DELETE" });
}

export async function uploadEvidenceFile(input: {
  inspectionId: string;
  questionId?: string;
  file: File;
}): Promise<Evidence> {
  const presigned = await presignEvidence({
    inspectionId: input.inspectionId,
    questionId: input.questionId,
    fileName: input.file.name,
    mimeType: input.file.type,
    fileSize: input.file.size,
  });

  // Direct upload to object storage — do not route this through apiRequest,
  // which adds our API's Authorization header and credentials that Supabase's
  // S3 endpoint neither needs nor expects.
  const uploadResponse = await fetch(presigned.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": input.file.type },
    body: input.file,
  });
  if (!uploadResponse.ok) {
    throw new Error("Failed to upload file to storage.");
  }

  return finalizeEvidence({
    id: presigned.evidenceId,
    inspectionId: input.inspectionId,
    questionId: input.questionId,
    storageKey: presigned.storageKey,
    fileName: input.file.name,
    mimeType: input.file.type,
    fileSize: input.file.size,
    type: "PHOTO",
  });
}
