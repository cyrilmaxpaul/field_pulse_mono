import fp from "fastify-plugin";
import { S3Client } from "@aws-sdk/client-s3";
import { env } from "../config/env.js";

export default fp(async (fastify) => {
  const s3 = new S3Client({
    region: env.SUPABASE_S3_REGION,
    endpoint: env.SUPABASE_S3_ENDPOINT,
    forcePathStyle: true,
    credentials: {
      accessKeyId: env.SUPABASE_S3_ACCESS_KEY_ID,
      secretAccessKey: env.SUPABASE_S3_SECRET_ACCESS_KEY,
    },
  });

  fastify.decorate("s3", s3);
});
