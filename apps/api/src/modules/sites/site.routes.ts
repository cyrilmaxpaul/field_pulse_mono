import type { FastifyInstance } from "fastify";
import {
  addSiteMemberHandler,
  archiveSiteHandler,
  createSiteHandler,
  getSiteHandler,
  listSitesHandler,
  removeSiteMemberHandler,
  updateSiteHandler,
} from "./site.controller.js";

export default async function siteRoutes(fastify: FastifyInstance) {
  const readGuard = { preHandler: [fastify.authenticate] };
  const writeGuard = { preHandler: [fastify.authenticate, fastify.requirePermission("site.manage")] };

  fastify.get("/sites", readGuard, listSitesHandler);
  fastify.get<{ Params: { id: string } }>("/sites/:id", readGuard, getSiteHandler);

  fastify.post("/sites", writeGuard, createSiteHandler);
  fastify.patch<{ Params: { id: string } }>("/sites/:id", writeGuard, updateSiteHandler);
  fastify.delete<{ Params: { id: string } }>("/sites/:id", writeGuard, archiveSiteHandler);
  fastify.post<{ Params: { id: string } }>("/sites/:id/members", writeGuard, addSiteMemberHandler);
  fastify.delete<{ Params: { id: string; userId: string } }>(
    "/sites/:id/members/:userId",
    writeGuard,
    removeSiteMemberHandler,
  );
}
