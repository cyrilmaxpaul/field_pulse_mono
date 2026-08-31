import "fastify";
import type { PrismaClient } from "@prisma/client";
import type { Redis } from "ioredis";
import type { S3Client } from "@aws-sdk/client-s3";
import type { PermissionKey } from "@fieldpulse/shared-types";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
    redis: Redis;
    s3: S3Client;
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requirePermission: (permission: PermissionKey) => (request: FastifyRequest) => Promise<void>;
  }

  interface FastifyRequest {
    authUser?: { id: string; organizationId: string };
  }
}
