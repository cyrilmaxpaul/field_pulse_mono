import type { FastifyInstance } from "fastify";
import {
  cancelInspectionHandler,
  createInspectionHandler,
  getInspectionHandler,
  listInspectionsHandler,
  saveResponseHandler,
  startInspectionHandler,
  submitInspectionHandler,
  updateInspectionHandler,
} from "./inspection.controller.js";

export default async function inspectionRoutes(fastify: FastifyInstance) {
  const authGuard = { preHandler: [fastify.authenticate] };
  const createGuard = { preHandler: [fastify.authenticate, fastify.requirePermission("inspection.create")] };

  fastify.get("/inspections", authGuard, listInspectionsHandler);
  fastify.post("/inspections", createGuard, createInspectionHandler);
  fastify.get<{ Params: { id: string } }>("/inspections/:id", authGuard, getInspectionHandler);
  fastify.patch<{ Params: { id: string } }>("/inspections/:id", createGuard, updateInspectionHandler);
  fastify.post<{ Params: { id: string } }>("/inspections/:id/cancel", createGuard, cancelInspectionHandler);

  fastify.post<{ Params: { id: string } }>("/inspections/:id/start", authGuard, startInspectionHandler);
  fastify.post<{ Params: { id: string } }>("/inspections/:id/submit", authGuard, submitInspectionHandler);
  fastify.put<{ Params: { id: string; questionId: string } }>(
    "/inspections/:id/responses/:questionId",
    authGuard,
    saveResponseHandler,
  );
}
