import { apiRequest } from "../../../lib/api/client";
import type {
  CreateTemplateInput,
  ReplaceStructureInput,
  TemplateDetail,
  TemplateSummary,
  VersionDetail,
} from "../types";

export function listTemplates() {
  return apiRequest<TemplateSummary[]>("/templates");
}

export function getTemplate(id: string) {
  return apiRequest<TemplateDetail>(`/templates/${id}`);
}

export function createTemplate(input: CreateTemplateInput) {
  return apiRequest<TemplateDetail>("/templates", { method: "POST", body: JSON.stringify(input) });
}

export function archiveTemplate(id: string) {
  return apiRequest<TemplateDetail>(`/templates/${id}`, { method: "DELETE" });
}

export function publishTemplate(id: string) {
  return apiRequest<TemplateDetail>(`/templates/${id}/publish`, { method: "POST" });
}

export function duplicateTemplate(id: string) {
  return apiRequest<TemplateDetail>(`/templates/${id}/duplicate`, { method: "POST" });
}

export function previewTemplate(id: string) {
  return apiRequest<VersionDetail>(`/templates/${id}/preview`);
}

export function createDraftVersion(id: string) {
  return apiRequest<VersionDetail>(`/templates/${id}/versions`, { method: "POST" });
}

export function getVersion(templateId: string, versionId: string) {
  return apiRequest<VersionDetail>(`/templates/${templateId}/versions/${versionId}`);
}

export function replaceStructure(templateId: string, versionId: string, input: ReplaceStructureInput) {
  return apiRequest<VersionDetail>(`/templates/${templateId}/versions/${versionId}/structure`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}
