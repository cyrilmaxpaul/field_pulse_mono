import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../middleware/errorHandler.js";
import { createInspectionService } from "./inspection.service.js";
import {
  createInspectionSchema,
  listInspectionsQuerySchema,
  saveResponseSchema,
  updateInspectionSchema,
} from "./inspection.schema.js";

export async function listInspectionsHandler(request: FastifyRequest, reply: FastifyReply) {
  const parsed = listInspectionsQuerySchema.safeParse(request.query);
  if (!parsed.success) throw new AppError(400, "VALIDATION_ERROR", "Request validation failed.");

  const service = createInspectionService(request.server.prisma);
  const inspections = await service.list(request.authUser!.organizationId, request.authUser!.id, parsed.data);
  return reply.send({ success: true, data: inspections });
}

export async function getInspectionHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const service = createInspectionService(request.server.prisma);
  const inspection = await service.get(request.authUser!.organizationId, request.authUser!.id, request.params.id);
  return reply.send({ success: true, data: inspection });
}

export async function createInspectionHandler(request: FastifyRequest, reply: FastifyReply) {
  const parsed = createInspectionSchema.safeParse(request.body);
  if (!parsed.success) throw new AppError(400, "VALIDATION_ERROR", "Request validation failed.");

  const service = createInspectionService(request.server.prisma);
  const inspection = await service.create(request.authUser!.organizationId, parsed.data);
  return reply.status(201).send({ success: true, data: inspection });
}

export async function updateInspectionHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const parsed = updateInspectionSchema.safeParse(request.body);
  if (!parsed.success) throw new AppError(400, "VALIDATION_ERROR", "Request validation failed.");

  const service = createInspectionService(request.server.prisma);
  const inspection = await service.update(request.authUser!.organizationId, request.params.id, parsed.data);
  return reply.send({ success: true, data: inspection });
}

export async function startInspectionHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const service = createInspectionService(request.server.prisma);
  const inspection = await service.start(request.authUser!.organizationId, request.authUser!.id, request.params.id);
  return reply.send({ success: true, data: inspection });
}

export async function saveResponseHandler(
  request: FastifyRequest<{ Params: { id: string; questionId: string } }>,
  reply: FastifyReply,
) {
  const parsed = saveResponseSchema.safeParse(request.body);
  if (!parsed.success) throw new AppError(400, "VALIDATION_ERROR", "Request validation failed.");

  const service = createInspectionService(request.server.prisma);
  const inspection = await service.saveResponse(
    request.authUser!.organizationId,
    request.authUser!.id,
    request.params.id,
    request.params.questionId,
    parsed.data.value,
  );
  return reply.send({ success: true, data: inspection });
}

export async function submitInspectionHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const service = createInspectionService(request.server.prisma);
  const inspection = await service.submit(request.authUser!.organizationId, request.authUser!.id, request.params.id);
  return reply.send({ success: true, data: inspection });
}

export async function cancelInspectionHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const service = createInspectionService(request.server.prisma);
  const inspection = await service.cancel(request.authUser!.organizationId, request.params.id);
  return reply.send({ success: true, data: inspection });
}
