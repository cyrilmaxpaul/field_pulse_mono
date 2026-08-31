export interface SiteSummary {
  id: string;
  name: string;
  code: string;
  city: string | null;
  state: string | null;
  country: string | null;
  status: "ACTIVE" | "ARCHIVED";
  createdAt: string;
}

export interface CreateSiteInput {
  name: string;
  code: string;
  description?: string;
  city?: string;
  state?: string;
  country?: string;
}
