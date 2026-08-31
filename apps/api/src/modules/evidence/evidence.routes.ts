import type { FastifyInstance } from "fastify";
import {
  deleteEvidenceHandler,
  finalizeEvidenceHandler,
  listInspectionEvidenceHandler,
  presignEvidenceHandler,
} from "./evidence.controller.js";

export default async function evidenceRoutes(fastify: FastifyInstance) {
  const authGuard = { preHandler: [fastify.authenticate] };

  const uploadGuard = {
    preHandler: [fastify.authenticate],
    config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
  };

  fastify.post("/evidence/presign", uploadGuard, presignEvidenceHandler);
  fastify.post("/evidence", uploadGuard, finalizeEvidenceHandler);
  fastify.delete<{ Params: { id: string } }>("/evidence/:id", authGuard, deleteEvidenceHandler);
  fastify.get<{ Params: { id: string } }>("/inspections/:id/evidence", authGuard, listInspectionEvidenceHandler);
}
