import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../middleware/errorHandler.js";
import { createUserService } from "./user.service.js";
import { createUserSchema, updateUserSchema } from "./user.schema.js";

export async function listUsersHandler(request: FastifyRequest, reply: FastifyReply) {
  const service = createUserService(request.server.prisma);
  const users = await service.list(request.authUser!.organizationId);
  return reply.send({ success: true, data: users });
}

export async function getUserHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const service = createUserService(request.server.prisma);
  const user = await service.get(request.authUser!.organizationId, request.params.id);
  return reply.send({ success: true, data: user });
}

export async function createUserHandler(request: FastifyRequest, reply: FastifyReply) {
  const parsed = createUserSchema.safeParse(request.body);
  if (!parsed.success) {
    throw new AppError(400, "VALIDATION_ERROR", "Request validation failed.");
  }
  const service = createUserService(request.server.prisma);
  const user = await service.create(request.authUser!.organizationId, parsed.data);
  return reply.status(201).send({ success: true, data: user });
}

export async function updateUserHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const parsed = updateUserSchema.safeParse(request.body);
  if (!parsed.success) {
    throw new AppError(400, "VALIDATION_ERROR", "Request validation failed.");
  }
  const service = createUserService(request.server.prisma);
  const user = await service.update(request.authUser!.organizationId, request.params.id, parsed.data);
  return reply.send({ success: true, data: user });
}

export async function deactivateUserHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const service = createUserService(request.server.prisma);
  const user = await service.deactivate(request.authUser!.organizationId, request.params.id);
  return reply.send({ success: true, data: user });
}
