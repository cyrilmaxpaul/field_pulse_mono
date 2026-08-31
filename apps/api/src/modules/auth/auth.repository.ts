import type { PrismaClient } from "@prisma/client";

export function createAuthRepository(prisma: PrismaClient) {
  return {
    findUserByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),

    findUserById: (id: string) => prisma.user.findUnique({ where: { id } }),

    createRefreshToken: (data: { userId: string; tokenHash: string; expiresAt: Date }) =>
      prisma.refreshToken.create({ data }),

    findValidRefreshToken: (tokenHash: string) =>
      prisma.refreshToken.findFirst({
        where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
      }),

    // Unlike findValidRefreshToken, this also returns already-revoked rows —
    // needed to detect reuse of a rotated-out token (a signal of theft).
    findRefreshTokenByHash: (tokenHash: string) =>
      prisma.refreshToken.findFirst({ where: { tokenHash, expiresAt: { gt: new Date() } } }),

    revokeRefreshToken: (id: string) =>
      prisma.refreshToken.update({ where: { id }, data: { revokedAt: new Date() } }),

    revokeAllRefreshTokensForUser: (userId: string) =>
      prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),

    updateLastLogin: (id: string) =>
      prisma.user.update({ where: { id }, data: { lastLoginAt: new Date() } }),
  };
}
