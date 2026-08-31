import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { env } from "./config/env.js";
import prismaPlugin from "./plugins/prisma.js";
import redisPlugin from "./plugins/redis.js";
import storagePlugin from "./plugins/storage.js";
import authPlugin from "./middleware/auth.js";
import permissionsPlugin from "./middleware/permissions.js";
import { registerErrorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import roleRoutes from "./modules/roles/role.routes.js";
import siteRoutes from "./modules/sites/site.routes.js";
import templateRoutes from "./modules/templates/template.routes.js";
import inspectionRoutes from "./modules/inspections/inspection.routes.js";
import evidenceRoutes from "./modules/evidence/evidence.routes.js";

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(helmet);
  await app.register(cors, {
    origin: env.WEB_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  });
  await app.register(cookie);
  await app.register(rateLimit, { max: 100, timeWindow: "1 minute" });

  await app.register(prismaPlugin);
  await app.register(redisPlugin);
  await app.register(storagePlugin);
  await app.register(authPlugin);
  await app.register(permissionsPlugin);

  registerErrorHandler(app);

  app.get("/health", async () => ({ success: true, data: { status: "ok" } }));

  await app.register(authRoutes, { prefix: "/api/v1/auth" });
  await app.register(userRoutes, { prefix: "/api/v1" });
  await app.register(roleRoutes, { prefix: "/api/v1" });
  await app.register(siteRoutes, { prefix: "/api/v1" });
  await app.register(templateRoutes, { prefix: "/api/v1" });
  await app.register(inspectionRoutes, { prefix: "/api/v1" });
  await app.register(evidenceRoutes, { prefix: "/api/v1" });

  return app;
}
