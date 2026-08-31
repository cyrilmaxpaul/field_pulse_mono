import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../middleware/errorHandler.js";
import { createTemplateService } from "./template.service.js";
import { createTemplateSchema, replaceStructureSchema, updateTemplateSchema } from "./template.schema.js";

export async function listTemplatesHandler(request: FastifyRequest, reply: FastifyReply) {
  const service = createTemplateService(request.server.prisma);
  const templates = await service.list(request.authUser!.organizationId);
  return reply.send({ success: true, data: templates });
}

export async function getTemplateHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const service = createTemplateService(request.server.prisma);
  const template = await service.get(request.authUser!.organizationId, request.params.id);
  return reply.send({ success: true, data: template });
}

export async function createTemplateHandler(request: FastifyRequest, reply: FastifyReply) {
  const parsed = createTemplateSchema.safeParse(request.body);
  if (!parsed.success) throw new AppError(400, "VALIDATION_ERROR", "Request validation failed.");

  const service = createTemplateService(request.server.prisma);
  const template = await service.create(request.authUser!.organizationId, request.authUser!.id, parsed.data);
  return reply.status(201).send({ success: true, data: template });
}

export async function updateTemplateHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const parsed = updateTemplateSchema.safeParse(request.body);
  if (!parsed.success) throw new AppError(400, "VALIDATION_ERROR", "Request validation failed.");

  const service = createTemplateService(request.server.prisma);
  const template = await service.update(request.authUser!.organizationId, request.params.id, parsed.data);
  return reply.send({ success: true, data: template });
}

export async function archiveTemplateHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const service = createTemplateService(request.server.prisma);
  const template = await service.archive(request.authUser!.organizationId, request.params.id);
  return reply.send({ success: true, data: template });
}

export async function publishTemplateHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const service = createTemplateService(request.server.prisma);
  const template = await service.publish(request.authUser!.organizationId, request.params.id);
  return reply.send({ success: true, data: template });
}

export async function duplicateTemplateHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const service = createTemplateService(request.server.prisma);
  const template = await service.duplicate(
    request.authUser!.organizationId,
    request.params.id,
    request.authUser!.id,
  );
  return reply.status(201).send({ success: true, data: template });
}

export async function previewTemplateHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const service = createTemplateService(request.server.prisma);
  const version = await service.preview(request.authUser!.organizationId, request.params.id);
  return reply.send({ success: true, data: version });
}

export async function createDraftVersionHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const service = createTemplateService(request.server.prisma);
  const version = await service.createDraftVersion(
    request.authUser!.organizationId,
    request.params.id,
    request.authUser!.id,
  );
  return reply.status(201).send({ success: true, data: version });
}

export async function getVersionHandler(
  request: FastifyRequest<{ Params: { id: string; versionId: string } }>,
  reply: FastifyReply,
) {
  const service = createTemplateService(request.server.prisma);
  const version = await service.getVersion(request.authUser!.organizationId, request.params.id, request.params.versionId);
  return reply.send({ success: true, data: version });
}

export async function replaceStructureHandler(
  request: FastifyRequest<{ Params: { id: string; versionId: string } }>,
  reply: FastifyReply,
) {
  const parsed = replaceStructureSchema.safeParse(request.body);
  if (!parsed.success) throw new AppError(400, "VALIDATION_ERROR", "Request validation failed.");

  const service = createTemplateService(request.server.prisma);
  const version = await service.replaceStructure(
    request.authUser!.organizationId,
    request.params.id,
    request.params.versionId,
    parsed.data,
  );
  return reply.send({ success: true, data: version });
}
