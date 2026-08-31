import { useQuery } from "@tanstack/react-query";
import { getTemplate, getVersion, listTemplates, previewTemplate } from "../api/templatesApi";

export function useTemplates() {
  return useQuery({ queryKey: ["templates"], queryFn: listTemplates });
}

export function useTemplate(id: string | undefined) {
  return useQuery({
    queryKey: ["templates", id],
    queryFn: () => getTemplate(id!),
    enabled: !!id,
  });
}

export function useVersion(templateId: string | undefined, versionId: string | undefined) {
  return useQuery({
    queryKey: ["templates", templateId, "versions", versionId],
    queryFn: () => getVersion(templateId!, versionId!),
    enabled: !!templateId && !!versionId,
  });
}

export function useTemplatePreview(id: string | undefined) {
  return useQuery({
    queryKey: ["templates", id, "preview"],
    queryFn: () => previewTemplate(id!),
    enabled: !!id,
  });
}
