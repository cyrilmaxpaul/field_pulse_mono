import type { FastifyInstance } from "fastify";
import {
  createRoleHandler,
  deleteRoleHandler,
  getRoleHandler,
  listPermissionsHandler,
  listRolesHandler,
  updateRoleHandler,
} from "./role.controller.js";

export default async function roleRoutes(fastify: FastifyInstance) {
  const guard = { preHandler: [fastify.authenticate, fastify.requirePermission("user.manage")] };

  fastify.get("/permissions", guard, listPermissionsHandler);
  fastify.get("/roles", guard, listRolesHandler);
  fastify.post("/roles", guard, createRoleHandler);
  fastify.get<{ Params: { id: string } }>("/roles/:id", guard, getRoleHandler);
  fastify.patch<{ Params: { id: string } }>("/roles/:id", guard, updateRoleHandler);
  fastify.delete<{ Params: { id: string } }>("/roles/:id", guard, deleteRoleHandler);
}
