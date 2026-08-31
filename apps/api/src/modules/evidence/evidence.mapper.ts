import type { Evidence, User } from "@prisma/client";

type EvidenceWithUploader = Evidence & { uploader: Pick<User, "id" | "firstName" | "lastName"> };

export function toEvidenceDto(evidence: EvidenceWithUploader, viewUrl: string | null) {
  return {
    id: evidence.id,
    inspectionId: evidence.inspectionId,
    questionId: evidence.questionId,
    type: evidence.type,
    fileName: evidence.fileName,
    mimeType: evidence.mimeType,
    fileSize: evidence.fileSize.toString(),
    status: evidence.status,
    viewUrl,
    uploadedBy: evidence.uploader,
    createdAt: evidence.createdAt,
  };
}
