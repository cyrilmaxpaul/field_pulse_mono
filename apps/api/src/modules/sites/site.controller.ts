import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../middleware/errorHandler.js";
import { createSiteService } from "./site.service.js";
import { addSiteMemberSchema, createSiteSchema, updateSiteSchema } from "./site.schema.js";

export async function listSitesHandler(request: FastifyRequest, reply: FastifyReply) {
  const service = createSiteService(request.server.prisma);
  const sites = await service.list(request.authUser!.organizationId);
  return reply.send({ success: true, data: sites });
}

export async function getSiteHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const service = createSiteService(request.server.prisma);
  const site = await service.get(request.authUser!.organizationId, request.params.id);
  return reply.send({ success: true, data: site });
}

export async function createSiteHandler(request: FastifyRequest, reply: FastifyReply) {
  const parsed = createSiteSchema.safeParse(request.body);
  if (!parsed.success) {
    throw new AppError(400, "VALIDATION_ERROR", "Request validation failed.");
  }
  const service = createSiteService(request.server.prisma);
  const site = await service.create(request.authUser!.organizationId, parsed.data);
  return reply.status(201).send({ success: true, data: site });
}

export async function updateSiteHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const parsed = updateSiteSchema.safeParse(request.body);
  if (!parsed.success) {
    throw new AppError(400, "VALIDATION_ERROR", "Request validation failed.");
  }
  const service = createSiteService(request.server.prisma);
  const site = await service.update(request.authUser!.organizationId, request.params.id, parsed.data);
  return reply.send({ success: true, data: site });
}

export async function archiveSiteHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const service = createSiteService(request.server.prisma);
  const site = await service.archive(request.authUser!.organizationId, request.params.id);
  return reply.send({ success: true, data: site });
}

export async function addSiteMemberHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const parsed = addSiteMemberSchema.safeParse(request.body);
  if (!parsed.success) {
    throw new AppError(400, "VALIDATION_ERROR", "Request validation failed.");
  }
  const service = createSiteService(request.server.prisma);
  const site = await service.addMember(request.authUser!.organizationId, request.params.id, parsed.data);
  return reply.send({ success: true, data: site });
}

export async function removeSiteMemberHandler(
  request: FastifyRequest<{ Params: { id: string; userId: string } }>,
  reply: FastifyReply,
) {
  const service = createSiteService(request.server.prisma);
  const site = await service.removeMember(
    request.authUser!.organizationId,
    request.params.id,
    request.params.userId,
  );
  return reply.send({ success: true, data: site });
}
