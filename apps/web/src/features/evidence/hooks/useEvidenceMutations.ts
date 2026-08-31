import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteEvidence, uploadEvidenceFile } from "../api/evidenceApi";

export function useUploadEvidence(inspectionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { questionId?: string; file: File }) => uploadEvidenceFile({ inspectionId, ...input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["evidence", inspectionId] }),
  });
}

export function useDeleteEvidence(inspectionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEvidence,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["evidence", inspectionId] }),
  });
}
