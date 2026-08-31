import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../middleware/errorHandler.js";
import { createRoleService } from "./role.service.js";
import { createRoleSchema, updateRoleSchema } from "./role.schema.js";

export async function listRolesHandler(request: FastifyRequest, reply: FastifyReply) {
  const service = createRoleService(request.server.prisma);
  const roles = await service.list(request.authUser!.organizationId);
  return reply.send({ success: true, data: roles });
}

export async function listPermissionsHandler(request: FastifyRequest, reply: FastifyReply) {
  const service = createRoleService(request.server.prisma);
  const permissions = await service.listPermissions();
  return reply.send({ success: true, data: permissions });
}

export async function getRoleHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const service = createRoleService(request.server.prisma);
  const role = await service.get(request.authUser!.organizationId, request.params.id);
  return reply.send({ success: true, data: role });
}

export async function createRoleHandler(request: FastifyRequest, reply: FastifyReply) {
  const parsed = createRoleSchema.safeParse(request.body);
  if (!parsed.success) {
    throw new AppError(400, "VALIDATION_ERROR", "Request validation failed.");
  }
  const service = createRoleService(request.server.prisma);
  const role = await service.create(request.authUser!.organizationId, parsed.data);
  return reply.status(201).send({ success: true, data: role });
}

export async function updateRoleHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const parsed = updateRoleSchema.safeParse(request.body);
  if (!parsed.success) {
    throw new AppError(400, "VALIDATION_ERROR", "Request validation failed.");
  }
  const service = createRoleService(request.server.prisma);
  const role = await service.update(request.authUser!.organizationId, request.params.id, parsed.data);
  return reply.send({ success: true, data: role });
}

export async function deleteRoleHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const service = createRoleService(request.server.prisma);
  await service.remove(request.authUser!.organizationId, request.params.id);
  return reply.send({ success: true, data: null });
}
