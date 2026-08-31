import type { FastifyInstance } from "fastify";
import { loginHandler, logoutHandler, meHandler, refreshHandler } from "./auth.controller.js";

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/login",
    { config: { rateLimit: { max: 5, timeWindow: "1 minute" } } },
    loginHandler,
  );
  fastify.post(
    "/refresh",
    { config: { rateLimit: { max: 20, timeWindow: "1 minute" } } },
    refreshHandler,
  );
  fastify.post("/logout", logoutHandler);
  fastify.get("/me", { preHandler: fastify.authenticate }, meHandler);
}
