import { fileURLToPath } from "node:url";
import path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

// .env lives at the monorepo root, shared by every app — resolve it relative
// to this file so it loads correctly regardless of the process cwd.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().default(4000),
  WEB_ORIGIN: z.string().default("http://localhost:5173"),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  SUPABASE_S3_ENDPOINT: z.string().min(1),
  SUPABASE_S3_REGION: z.string().min(1),
  SUPABASE_S3_ACCESS_KEY_ID: z.string().min(1),
  SUPABASE_S3_SECRET_ACCESS_KEY: z.string().min(1),
  SUPABASE_S3_BUCKET: z.string().min(1),
});

export const env = envSchema.parse(process.env);
