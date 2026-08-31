import type { FastifyInstance } from "fastify";
import {
  archiveTemplateHandler,
  createDraftVersionHandler,
  createTemplateHandler,
  duplicateTemplateHandler,
  getTemplateHandler,
  getVersionHandler,
  listTemplatesHandler,
  previewTemplateHandler,
  publishTemplateHandler,
  replaceStructureHandler,
  updateTemplateHandler,
} from "./template.controller.js";

export default async function templateRoutes(fastify: FastifyInstance) {
  const readGuard = { preHandler: [fastify.authenticate] };
  const writeGuard = { preHandler: [fastify.authenticate, fastify.requirePermission("template.manage")] };

  fastify.get("/templates", readGuard, listTemplatesHandler);
  fastify.post("/templates", writeGuard, createTemplateHandler);
  fastify.get<{ Params: { id: string } }>("/templates/:id", readGuard, getTemplateHandler);
  fastify.patch<{ Params: { id: string } }>("/templates/:id", writeGuard, updateTemplateHandler);
  fastify.delete<{ Params: { id: string } }>("/templates/:id", writeGuard, archiveTemplateHandler);
  fastify.post<{ Params: { id: string } }>("/templates/:id/duplicate", writeGuard, duplicateTemplateHandler);
  fastify.post<{ Params: { id: string } }>("/templates/:id/publish", writeGuard, publishTemplateHandler);
  fastify.get<{ Params: { id: string } }>("/templates/:id/preview", readGuard, previewTemplateHandler);

  fastify.post<{ Params: { id: string } }>("/templates/:id/versions", writeGuard, createDraftVersionHandler);
  fastify.get<{ Params: { id: string; versionId: string } }>(
    "/templates/:id/versions/:versionId",
    readGuard,
    getVersionHandler,
  );
  fastify.put<{ Params: { id: string; versionId: string } }>(
    "/templates/:id/versions/:versionId/structure",
    writeGuard,
    replaceStructureHandler,
  );
}
