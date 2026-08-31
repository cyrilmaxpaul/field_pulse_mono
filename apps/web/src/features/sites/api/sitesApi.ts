import { apiRequest } from "../../../lib/api/client";
import type { CreateSiteInput, SiteSummary } from "../types";

export function listSites() {
  return apiRequest<SiteSummary[]>("/sites");
}

export function createSite(input: CreateSiteInput) {
  return apiRequest<SiteSummary>("/sites", { method: "POST", body: JSON.stringify(input) });
}

export function archiveSite(id: string) {
  return apiRequest<SiteSummary>(`/sites/${id}`, { method: "DELETE" });
}
