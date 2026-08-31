import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  archiveTemplate,
  createDraftVersion,
  createTemplate,
  duplicateTemplate,
  publishTemplate,
  replaceStructure,
} from "../api/templatesApi";
import type { ReplaceStructureInput } from "../types";

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTemplate,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["templates"] }),
  });
}

export function useArchiveTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: archiveTemplate,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["templates"] }),
  });
}

export function usePublishTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: publishTemplate,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      queryClient.invalidateQueries({ queryKey: ["templates", data.id] });
    },
  });
}

export function useDuplicateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: duplicateTemplate,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["templates"] }),
  });
}

export function useCreateDraftVersion(templateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => createDraftVersion(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      queryClient.invalidateQueries({ queryKey: ["templates", templateId] });
    },
  });
}

export function useReplaceStructure(templateId: string, versionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ReplaceStructureInput) => replaceStructure(templateId, versionId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      queryClient.invalidateQueries({ queryKey: ["templates", templateId, "versions", versionId] });
    },
  });
}
