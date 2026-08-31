import type { FastifyInstance } from "fastify";
import { AppError } from "../../middleware/errorHandler.js";
import { createInspectionRepository } from "../inspections/inspection.repository.js";
import { createEvidenceService } from "../evidence/evidence.service.js";
import { finalizeEvidenceSchema } from "../evidence/evidence.schema.js";
import { createSyncRepository } from "./sync.repository.js";
import type { PushSyncInput, ResolveSyncInput } from "./sync.schema.js";

function splitEntityId(entityId: string) {
  const [inspectionId, questionId] = entityId.split(":");
  if (!inspectionId || !questionId) {
    throw new AppError(
      400,
      "INVALID_ENTITY_ID",
      "inspection_response entityId must be formatted as `inspectionId:questionId`.",
    );
  }
  return { inspectionId, questionId };
}

export function createSyncService(fastify: FastifyInstance) {
  const prisma = fastify.prisma;
  const repo = createSyncRepository(prisma);
  const inspectionRepo = createInspectionRepository(prisma);
  const evidenceService = createEvidenceService(fastify);

  async function applyInspectionResponse(
    organizationId: string,
    userId: string,
    entityId: string,
    clientVersion: number,
    payload: unknown,
  ) {
    const { inspectionId, questionId } = splitEntityId(entityId);

    const inspection = await prisma.inspection.findFirst({ where: { id: inspectionId, organizationId } });
    if (!inspection) throw new AppError(404, "NOT_FOUND", "Inspection not found.");
    if (inspection.assignedTo !== userId) {
      throw new AppError(403, "FORBIDDEN", "Only the assigned worker can sync responses.");
    }
    if (inspection.status !== "IN_PROGRESS") {
      throw new AppError(409, "NOT_IN_PROGRESS", "Start the inspection before syncing responses.");
    }

    const question = await inspectionRepo.findQuestionInVersion(inspection.templateVersionId, questionId);
    if (!question) throw new AppError(404, "QUESTION_NOT_FOUND", "Question does not belong to this inspection.");

    const value = (payload as { value?: unknown } | undefined)?.value;
    return inspectionRepo.upsertResponseVersioned(inspectionId, questionId, value, clientVersion);
  }

  async function applyEvidence(organizationId: string, userId: string, payload: unknown) {
    const parsed = finalizeEvidenceSchema.safeParse(payload);
    if (!parsed.success) throw new AppError(400, "VALIDATION_ERROR", "Invalid evidence payload.");
    return evidenceService.finalize(organizationId, userId, parsed.data);
  }

  return {
    async push(organizationId: string, userId: string, input: PushSyncInput) {
      await repo.upsertDevice(organizationId, userId, input.deviceId, {
        deviceName: input.deviceName,
        platform: input.platform,
        appVersion: input.appVersion,
      });

      const results: Array<{
        syncOperationId: string;
        entityId: string;
        status: "COMPLETED" | "CONFLICT" | "FAILED";
        server?: { value: unknown; serverVersion: number } | null;
        error?: string;
      }> = [];

      for (const op of input.operations) {
        const syncOp = await repo.createSyncOperation({
          organizationId,
          userId,
          deviceId: input.deviceId,
          entityType: op.entityType,
          entityId: op.entityId,
          operation: op.operation,
          clientVersion: op.clientVersion,
          payload: op.payload,
        });

        try {
          if (op.entityType === "inspection_response") {
            const result = await applyInspectionResponse(organizationId, userId, op.entityId, op.clientVersion, op.payload);
            if (result.applied) {
              await repo.updateSyncOperationStatus(syncOp.id, "COMPLETED");
              results.push({ syncOperationId: syncOp.id, entityId: op.entityId, status: "COMPLETED" });
            } else {
              await repo.updateSyncOperationStatus(syncOp.id, "CONFLICT", {
                errorCode: "VERSION_CONFLICT",
                errorMessage: "The response has changed on the server since this device last saw it.",
              });
              results.push({
                syncOperationId: syncOp.id,
                entityId: op.entityId,
                status: "CONFLICT",
                server: result.current ? { value: result.current.value, serverVersion: result.current.serverVersion } : null,
              });
            }
          } else if (op.entityType === "evidence") {
            if (op.operation !== "CREATE") {
              await repo.updateSyncOperationStatus(syncOp.id, "FAILED", {
                errorCode: "UNSUPPORTED_OPERATION",
                errorMessage: "Only CREATE is supported for evidence.",
              });
              results.push({ syncOperationId: syncOp.id, entityId: op.entityId, status: "FAILED" });
            } else {
              await applyEvidence(organizationId, userId, op.payload);
              await repo.updateSyncOperationStatus(syncOp.id, "COMPLETED");
              results.push({ syncOperationId: syncOp.id, entityId: op.entityId, status: "COMPLETED" });
            }
          } else {
            await repo.updateSyncOperationStatus(syncOp.id, "FAILED", {
              errorCode: "UNSUPPORTED_ENTITY",
              errorMessage: `Unsupported entity type: ${op.entityType}`,
            });
            results.push({ syncOperationId: syncOp.id, entityId: op.entityId, status: "FAILED" });
          }
        } catch (err) {
          const errorCode = err instanceof AppError ? err.code : "SYNC_FAILED";
          const errorMessage = err instanceof Error ? err.message : "Sync operation failed.";
          await repo.updateSyncOperationStatus(syncOp.id, "FAILED", { errorCode, errorMessage });
          results.push({ syncOperationId: syncOp.id, entityId: op.entityId, status: "FAILED", error: errorMessage });
        }
      }

      return { deviceId: input.deviceId, results };
    },

    async pull(organizationId: string, userId: string, deviceId: string, since?: string) {
      await repo.upsertDevice(organizationId, userId, deviceId, {});
      const inspections = await repo.listAssignedActiveInspections(
        organizationId,
        userId,
        since ? new Date(since) : undefined,
      );

      return {
        serverTime: new Date().toISOString(),
        inspections: inspections.map((i) => ({
          id: i.id,
          status: i.status,
          serverVersion: i.serverVersion,
          updatedAt: i.updatedAt,
          responses: i.responses,
        })),
      };
    },

    async resolve(organizationId: string, userId: string, input: ResolveSyncInput) {
      const op = await repo.findSyncOperation(organizationId, userId, input.syncOperationId);
      if (!op) throw new AppError(404, "NOT_FOUND", "Sync operation not found.");
      if (op.entityType !== "inspection_response") {
        throw new AppError(400, "UNSUPPORTED_ENTITY", "Only inspection_response conflicts can be resolved.");
      }
      if (op.status !== "CONFLICT") {
        throw new AppError(409, "NOT_CONFLICTED", "This sync operation is not in conflict.");
      }

      const { inspectionId, questionId } = splitEntityId(op.entityId);

      if (input.resolution === "KEEP_SERVER") {
        await repo.updateSyncOperationStatus(op.id, "COMPLETED");
        return { resolution: input.resolution };
      }

      const current = await prisma.inspectionResponse.findUnique({
        where: { inspectionId_questionId: { inspectionId, questionId } },
      });
      const expectedVersion = current?.serverVersion ?? 0;
      const clientPayload = op.payload as { value?: unknown } | null;
      const value = input.resolution === "MERGE" ? input.mergedValue : clientPayload?.value;

      const result = await inspectionRepo.upsertResponseVersioned(inspectionId, questionId, value, expectedVersion);
      await repo.updateSyncOperationStatus(op.id, "COMPLETED");
      return { resolution: input.resolution, response: result.applied ? result.response : undefined };
    },

    async status(organizationId: string, userId: string, deviceId: string) {
      const device = await repo.findDevice(organizationId, userId, deviceId);
      const conflicts = await repo.listConflicts(organizationId, userId);
      return { device, conflicts };
    },
  };
}
