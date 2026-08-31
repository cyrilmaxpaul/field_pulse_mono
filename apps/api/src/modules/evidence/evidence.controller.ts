import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../middleware/errorHandler.js";
import { createEvidenceService } from "./evidence.service.js";
import { finalizeEvidenceSchema, presignEvidenceSchema } from "./evidence.schema.js";

export async function presignEvidenceHandler(request: FastifyRequest, reply: FastifyReply) {
  const parsed = presignEvidenceSchema.safeParse(request.body);
  if (!parsed.success) throw new AppError(400, "VALIDATION_ERROR", "Request validation failed.");

  const service = createEvidenceService(request.server);
  const result = await service.presign(request.authUser!.organizationId, request.authUser!.id, parsed.data);
  return reply.send({ success: true, data: result });
}

export async function finalizeEvidenceHandler(request: FastifyRequest, reply: FastifyReply) {
  const parsed = finalizeEvidenceSchema.safeParse(request.body);
  if (!parsed.success) throw new AppError(400, "VALIDATION_ERROR", "Request validation failed.");

  const service = createEvidenceService(request.server);
  const evidence = await service.finalize(request.authUser!.organizationId, request.authUser!.id, parsed.data);
  return reply.status(201).send({ success: true, data: evidence });
}

export async function listInspectionEvidenceHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const service = createEvidenceService(request.server);
  const evidence = await service.listForInspection(
    request.authUser!.organizationId,
    request.authUser!.id,
    request.params.id,
  );
  return reply.send({ success: true, data: evidence });
}

export async function deleteEvidenceHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const service = createEvidenceService(request.server);
  await service.remove(request.authUser!.organizationId, request.authUser!.id, request.params.id);
  return reply.send({ success: true, data: null });
}
