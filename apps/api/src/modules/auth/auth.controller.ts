import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../middleware/errorHandler.js";
import { loginSchema } from "./auth.schema.js";
import { createAuthService } from "./auth.service.js";

const REFRESH_COOKIE = "refreshToken";
const REFRESH_COOKIE_PATH = "/api/v1/auth";

function setRefreshCookie(reply: FastifyReply, token: string) {
  reply.setCookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: REFRESH_COOKIE_PATH,
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function loginHandler(request: FastifyRequest, reply: FastifyReply) {
  const parsed = loginSchema.safeParse(request.body);
  if (!parsed.success) {
    throw new AppError(400, "VALIDATION_ERROR", "Request validation failed.");
  }

  const authService = createAuthService(request.server.prisma);
  const { accessToken, refreshToken, user } = await authService.login(
    parsed.data.email,
    parsed.data.password,
  );

  setRefreshCookie(reply, refreshToken);
  return reply.send({ success: true, data: { accessToken, user } });
}

export async function refreshHandler(request: FastifyRequest, reply: FastifyReply) {
  const authService = createAuthService(request.server.prisma);
  const rawToken = request.cookies[REFRESH_COOKIE];
  const { accessToken, refreshToken, user } = await authService.refresh(rawToken);

  setRefreshCookie(reply, refreshToken);
  return reply.send({ success: true, data: { accessToken, user } });
}

export async function logoutHandler(request: FastifyRequest, reply: FastifyReply) {
  const authService = createAuthService(request.server.prisma);
  const rawToken = request.cookies[REFRESH_COOKIE];
  await authService.logout(rawToken);

  reply.clearCookie(REFRESH_COOKIE, { path: REFRESH_COOKIE_PATH });
  return reply.send({ success: true, data: null });
}

export async function meHandler(request: FastifyRequest, reply: FastifyReply) {
  const authService = createAuthService(request.server.prisma);
  const user = await authService.me(request.authUser!.id);
  return reply.send({ success: true, data: user });
}
