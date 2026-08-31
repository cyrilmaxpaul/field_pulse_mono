import crypto from "node:crypto";
import type { FastifyInstance } from "fastify";
import { PutObjectCommand, HeadObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { AppError } from "../../middleware/errorHandler.js";
import { userHasPermission } from "../../middleware/permissions.js";
import { env } from "../../config/env.js";
import { createEvidenceRepository } from "./evidence.repository.js";
import { toEvidenceDto } from "./evidence.mapper.js";
import type { FinalizeEvidenceInput, PresignEvidenceInput } from "./evidence.schema.js";

const UPLOAD_URL_TTL_SECONDS = 5 * 60;
const VIEW_URL_TTL_SECONDS = 60 * 60;

function extensionFromMimeType(mimeType: string) {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
  };
  return map[mimeType] ?? "bin";
}

export function createEvidenceService(fastify: FastifyInstance) {
  const prisma = fastify.prisma;
  const repo = createEvidenceRepository(prisma);

  async function requireInProgressAssignee(organizationId: string, inspectionId: string, userId: string) {
    const inspection = await repo.findInspection(organizationId, inspectionId);
    if (!inspection) throw new AppError(404, "NOT_FOUND", "Inspection not found.");
    if (inspection.assignedTo !== userId) {
      throw new AppError(403, "FORBIDDEN", "Only the assigned worker can attach evidence.");
    }
    if (inspection.status !== "IN_PROGRESS") {
      throw new AppError(409, "NOT_IN_PROGRESS", "The inspection must be in progress to attach evidence.");
    }
    return inspection;
  }

  async function assertQuestionBelongs(templateVersionId: string, questionId: string | undefined) {
    if (!questionId) return;
    const question = await repo.findQuestionInVersion(templateVersionId, questionId);
    if (!question) throw new AppError(404, "QUESTION_NOT_FOUND", "Question does not belong to this inspection.");
  }

  return {
    async presign(organizationId: string, userId: string, input: PresignEvidenceInput) {
      const inspection = await requireInProgressAssignee(organizationId, input.inspectionId, userId);
      await assertQuestionBelongs(inspection.templateVersionId, input.questionId);

      const evidenceId = crypto.randomUUID();
      const storageKey = `organizations/${organizationId}/inspections/${input.inspectionId}/evidence/${evidenceId}.${extensionFromMimeType(input.mimeType)}`;

      const uploadUrl = await getSignedUrl(
        fastify.s3,
        new PutObjectCommand({
          Bucket: env.SUPABASE_S3_BUCKET,
          Key: storageKey,
          ContentType: input.mimeType,
        }),
        { expiresIn: UPLOAD_URL_TTL_SECONDS },
      );

      return { evidenceId, storageKey, uploadUrl };
    },

    async finalize(organizationId: string, userId: string, input: FinalizeEvidenceInput) {
      const inspection = await requireInProgressAssignee(organizationId, input.inspectionId, userId);
      await assertQuestionBelongs(inspection.templateVersionId, input.questionId);

      try {
        await fastify.s3.send(new HeadObjectCommand({ Bucket: env.SUPABASE_S3_BUCKET, Key: input.storageKey }));
      } catch {
        throw new AppError(400, "UPLOAD_NOT_FOUND", "The file was not found in storage. Please retry the upload.");
      }

      const evidence = await repo.create({
        id: input.id,
        organizationId,
        inspectionId: input.inspectionId,
        questionId: input.questionId,
        type: input.type,
        storageKey: input.storageKey,
        fileName: input.fileName,
        mimeType: input.mimeType,
        fileSize: input.fileSize,
        uploadedBy: userId,
        status: "UPLOADED",
      });

      return toEvidenceDto(evidence, await this.signViewUrl(evidence.storageKey));
    },

    async signViewUrl(storageKey: string) {
      return getSignedUrl(fastify.s3, new GetObjectCommand({ Bucket: env.SUPABASE_S3_BUCKET, Key: storageKey }), {
        expiresIn: VIEW_URL_TTL_SECONDS,
      });
    },

    async listForInspection(organizationId: string, userId: string, inspectionId: string) {
      const inspection = await repo.findInspection(organizationId, inspectionId);
      if (!inspection) throw new AppError(404, "NOT_FOUND", "Inspection not found.");

      const canReadAll = await userHasPermission(prisma, userId, "inspection.read");
      if (!canReadAll && inspection.assignedTo !== userId) {
        throw new AppError(403, "FORBIDDEN", "You do not have access to this inspection.");
      }

      const items = await repo.listByInspection(inspectionId);
      return Promise.all(items.map(async (item) => toEvidenceDto(item, await this.signViewUrl(item.storageKey))));
    },

    async remove(organizationId: string, userId: string, id: string) {
      const evidence = await repo.findById(organizationId, id);
      if (!evidence) throw new AppError(404, "NOT_FOUND", "Evidence not found.");

      const canManage = await userHasPermission(prisma, userId, "inspection.create");
      if (!canManage && evidence.uploadedBy !== userId) {
        throw new AppError(403, "FORBIDDEN", "You do not have permission to delete this evidence.");
      }

      await repo.softDelete(id);
    },
  };
}
