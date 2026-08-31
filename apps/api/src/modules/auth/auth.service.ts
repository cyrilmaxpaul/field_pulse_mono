import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { PrismaClient } from "@prisma/client";
import { env } from "../../config/env.js";
import { AppError } from "../../middleware/errorHandler.js";
import { toUserDto } from "./auth.mapper.js";
import { createAuthRepository } from "./auth.repository.js";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
// Pin the algorithm on both sign and verify — never let it be inferred from
// the token header, which is how "alg: none" / algorithm-confusion attacks work.
const JWT_ALGORITHM = "HS256";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function signAccessToken(userId: string, organizationId: string) {
  return jwt.sign({ organizationId }, env.JWT_ACCESS_SECRET, {
    subject: userId,
    expiresIn: ACCESS_TOKEN_TTL,
    algorithm: JWT_ALGORITHM,
  });
}

export function verifyAccessToken(token: string) {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: [JWT_ALGORITHM] }) as jwt.JwtPayload;
  return { id: decoded.sub as string, organizationId: decoded.organizationId as string };
}

function generateRefreshToken() {
  return crypto.randomBytes(40).toString("hex");
}

export function createAuthService(prisma: PrismaClient) {
  const repo = createAuthRepository(prisma);

  async function issueTokens(user: { id: string; organizationId: string }) {
    const accessToken = signAccessToken(user.id, user.organizationId);
    const refreshToken = generateRefreshToken();
    await repo.createRefreshToken({
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });
    return { accessToken, refreshToken };
  }

  return {
    async login(email: string, password: string) {
      const user = await repo.findUserByEmail(email);
      if (!user || user.status !== "ACTIVE") {
        throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password.");
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password.");
      }

      const tokens = await issueTokens(user);
      await repo.updateLastLogin(user.id);

      return { ...tokens, user: toUserDto(user) };
    },

    async refresh(rawToken: string | undefined) {
      if (!rawToken) {
        throw new AppError(401, "UNAUTHORIZED", "Missing refresh token.");
      }

      const record = await repo.findRefreshTokenByHash(hashToken(rawToken));
      if (!record) {
        throw new AppError(401, "UNAUTHORIZED", "Invalid or expired refresh token.");
      }

      if (record.revokedAt) {
        // This token was already rotated out. Presenting it again means either
        // a stolen copy is being replayed, or a legitimate client retried after
        // its own successful rotation raced a network blip — either way, the
        // safe response is to kill every active session for this user rather
        // than silently accepting a token that should no longer be valid.
        await repo.revokeAllRefreshTokensForUser(record.userId);
        throw new AppError(
          401,
          "TOKEN_REUSE_DETECTED",
          "This session was revoked for security reasons. Please log in again.",
        );
      }

      const user = await repo.findUserById(record.userId);
      if (!user || user.status !== "ACTIVE") {
        throw new AppError(401, "UNAUTHORIZED", "Account is no longer active.");
      }

      // Rotate: revoke the used token before issuing a new one.
      await repo.revokeRefreshToken(record.id);
      const tokens = await issueTokens(user);

      return { ...tokens, user: toUserDto(user) };
    },

    async logout(rawToken: string | undefined) {
      if (!rawToken) return;
      const record = await repo.findValidRefreshToken(hashToken(rawToken));
      if (record) {
        await repo.revokeRefreshToken(record.id);
      }
    },

    async me(userId: string) {
      const user = await repo.findUserById(userId);
      if (!user) {
        throw new AppError(404, "NOT_FOUND", "User not found.");
      }
      return toUserDto(user);
    },
  };
}
