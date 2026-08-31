import type { FastifyInstance } from "fastify";
import {
  createUserHandler,
  deactivateUserHandler,
  getUserHandler,
  listUsersHandler,
  updateUserHandler,
} from "./user.controller.js";

export default async function userRoutes(fastify: FastifyInstance) {
  const guard = { preHandler: [fastify.authenticate, fastify.requirePermission("user.manage")] };

  fastify.get("/users", guard, listUsersHandler);
  fastify.post("/users", guard, createUserHandler);
  fastify.get<{ Params: { id: string } }>("/users/:id", guard, getUserHandler);
  fastify.patch<{ Params: { id: string } }>("/users/:id", guard, updateUserHandler);
  fastify.delete<{ Params: { id: string } }>("/users/:id", guard, deactivateUserHandler);
}
