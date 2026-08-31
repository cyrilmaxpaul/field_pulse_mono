import fp from "fastify-plugin";
import { verifyAccessToken } from "../modules/auth/auth.service.js";
import { AppError } from "./errorHandler.js";

export default fp(async (fastify) => {
  fastify.decorate("authenticate", async (request) => {
    const header = request.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new AppError(401, "UNAUTHORIZED", "Missing access token.");
    }

    const token = header.slice("Bearer ".length);
    try {
      request.authUser = verifyAccessToken(token);
    } catch {
      throw new AppError(401, "UNAUTHORIZED", "Invalid or expired access token.");
    }
  });
});
