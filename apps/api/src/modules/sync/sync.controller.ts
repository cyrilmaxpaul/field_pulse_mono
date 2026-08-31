import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../middleware/errorHandler.js";
import { createSyncService } from "./sync.service.js";
import { pullSyncQuerySchema, pushSyncSchema, resolveSyncSchema, statusQuerySchema } from "./sync.schema.js";

export async function pushSyncHandler(request: FastifyRequest, reply: FastifyReply) {
  const parsed = pushSyncSchema.safeParse(request.body);
  if (!parsed.success) throw new AppError(400, "VALIDATION_ERROR", "Request validation failed.");

  const service = createSyncService(request.server);
  const result = await service.push(request.authUser!.organizationId, request.authUser!.id, parsed.data);
  return reply.send({ success: true, data: result });
}

export async function pullSyncHandler(request: FastifyRequest, reply: FastifyReply) {
  const parsed = pullSyncQuerySchema.safeParse(request.query);
  if (!parsed.success) throw new AppError(400, "VALIDATION_ERROR", "Request validation failed.");

  const service = createSyncService(request.server);
  const result = await service.pull(
    request.authUser!.organizationId,
    request.authUser!.id,
    parsed.data.deviceId,
    parsed.data.since,
  );
  return reply.send({ success: true, data: result });
}

export async function resolveSyncHandler(request: FastifyRequest, reply: FastifyReply) {
  const parsed = resolveSyncSchema.safeParse(request.body);
  if (!parsed.success) throw new AppError(400, "VALIDATION_ERROR", "Request validation failed.");

  const service = createSyncService(request.server);
  const result = await service.resolve(request.authUser!.organizationId, request.authUser!.id, parsed.data);
  return reply.send({ success: true, data: result });
}

export async function statusSyncHandler(request: FastifyRequest, reply: FastifyReply) {
  const parsed = statusQuerySchema.safeParse(request.query);
  if (!parsed.success) throw new AppError(400, "VALIDATION_ERROR", "Request validation failed.");

  const service = createSyncService(request.server);
  const result = await service.status(request.authUser!.organizationId, request.authUser!.id, parsed.data.deviceId);
  return reply.send({ success: true, data: result });
}
