import bcrypt from "bcryptjs";
import type { PrismaClient } from "@prisma/client";
import { AppError } from "../../middleware/errorHandler.js";
import { createUserRepository } from "./user.repository.js";
import { toUserSummaryDto } from "./user.mapper.js";
import type { CreateUserInput, UpdateUserInput } from "./user.schema.js";

export function createUserService(prisma: PrismaClient) {
  const repo = createUserRepository(prisma);

  return {
    async list(organizationId: string) {
      const users = await repo.listByOrganization(organizationId);
      return users.map(toUserSummaryDto);
    },

    async get(organizationId: string, id: string) {
      const user = await repo.findById(organizationId, id);
      if (!user) throw new AppError(404, "NOT_FOUND", "User not found.");
      return toUserSummaryDto(user);
    },

    async create(organizationId: string, input: CreateUserInput) {
      const existing = await repo.findByEmail(input.email);
      if (existing) {
        throw new AppError(409, "EMAIL_TAKEN", "A user with this email already exists.", {
          email: "Already in use.",
        });
      }

      const passwordHash = await bcrypt.hash(input.password, 10);
      const user = await repo.create(organizationId, {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        passwordHash,
        roleIds: input.roleIds,
      });
      return toUserSummaryDto(user);
    },

    async update(organizationId: string, id: string, input: UpdateUserInput) {
      const existing = await repo.findById(organizationId, id);
      if (!existing) throw new AppError(404, "NOT_FOUND", "User not found.");

      const user = await repo.update(id, input);

      if (input.status === "DISABLED") {
        await repo.revokeActiveRefreshTokens(id);
      }

      return toUserSummaryDto(user);
    },

    async deactivate(organizationId: string, id: string) {
      const existing = await repo.findById(organizationId, id);
      if (!existing) throw new AppError(404, "NOT_FOUND", "User not found.");

      const user = await repo.update(id, { status: "DISABLED" });
      await repo.revokeActiveRefreshTokens(id);
      return toUserSummaryDto(user);
    },
  };
}
