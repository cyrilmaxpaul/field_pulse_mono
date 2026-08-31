import { useMutation, useQueryClient } from "@tanstack/react-query";
import { archiveSite, createSite } from "../api/sitesApi";

export function useCreateSite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSite,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sites"] }),
  });
}

export function useArchiveSite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: archiveSite,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sites"] }),
  });
}
