import type { PrismaClient } from "@prisma/client";
import { AppError } from "../../middleware/errorHandler.js";
import { createSiteRepository } from "./site.repository.js";
import { toSiteDetailDto, toSiteSummaryDto } from "./site.mapper.js";
import type { AddSiteMemberInput, CreateSiteInput, UpdateSiteInput } from "./site.schema.js";

export function createSiteService(prisma: PrismaClient) {
  const repo = createSiteRepository(prisma);

  return {
    async list(organizationId: string) {
      const sites = await repo.listByOrganization(organizationId);
      return sites.map(toSiteSummaryDto);
    },

    async get(organizationId: string, id: string) {
      const site = await repo.findById(organizationId, id);
      if (!site) throw new AppError(404, "NOT_FOUND", "Site not found.");
      return toSiteDetailDto(site);
    },

    async create(organizationId: string, input: CreateSiteInput) {
      const existing = await repo.findByCode(organizationId, input.code);
      if (existing) {
        throw new AppError(409, "SITE_CODE_TAKEN", "A site with this code already exists.", {
          code: "Already in use.",
        });
      }
      const site = await repo.create(organizationId, input);
      return toSiteSummaryDto(site);
    },

    async update(organizationId: string, id: string, input: UpdateSiteInput) {
      const existing = await repo.findById(organizationId, id);
      if (!existing) throw new AppError(404, "NOT_FOUND", "Site not found.");

      const site = await repo.update(id, input);
      return toSiteSummaryDto(site);
    },

    async archive(organizationId: string, id: string) {
      const existing = await repo.findById(organizationId, id);
      if (!existing) throw new AppError(404, "NOT_FOUND", "Site not found.");

      const site = await repo.update(id, { status: "ARCHIVED" });
      return toSiteSummaryDto(site);
    },

    async addMember(organizationId: string, siteId: string, input: AddSiteMemberInput) {
      const existing = await repo.findById(organizationId, siteId);
      if (!existing) throw new AppError(404, "NOT_FOUND", "Site not found.");

      await repo.addMember(siteId, input.userId, input.role);
      return this.get(organizationId, siteId);
    },

    async removeMember(organizationId: string, siteId: string, userId: string) {
      const existing = await repo.findById(organizationId, siteId);
      if (!existing) throw new AppError(404, "NOT_FOUND", "Site not found.");

      await repo.removeMember(siteId, userId);
      return this.get(organizationId, siteId);
    },
  };
}
