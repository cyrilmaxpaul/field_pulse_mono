import type { FastifyInstance } from "fastify";
import { pullSyncHandler, pushSyncHandler, resolveSyncHandler, statusSyncHandler } from "./sync.controller.js";

export default async function syncRoutes(fastify: FastifyInstance) {
  const authGuard = { preHandler: [fastify.authenticate] };

  fastify.post("/sync/push", authGuard, pushSyncHandler);
  fastify.get("/sync/pull", authGuard, pullSyncHandler);
  fastify.post("/sync/resolve", authGuard, resolveSyncHandler);
  fastify.get("/sync/status", authGuard, statusSyncHandler);
}
