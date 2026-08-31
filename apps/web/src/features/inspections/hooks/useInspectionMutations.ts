import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  cancelInspection,
  createInspection,
  saveResponse,
  startInspection,
  submitInspection,
} from "../api/inspectionsApi";

export function useCreateInspection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInspection,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["inspections"] }),
  });
}

export function useStartInspection(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => startInspection(id),
    onSuccess: (data) => {
      // Write the fresh status synchronously so a navigation right after
      // mutateAsync() resolves doesn't read stale cached data (invalidateQueries
      // only triggers an async background refetch, which loses that race).
      queryClient.setQueryData(["inspections", id], data);
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
    },
  });
}

export function useSaveResponse(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, value }: { questionId: string; value: unknown }) => saveResponse(id, questionId, value),
    onSuccess: (data) => {
      queryClient.setQueryData(["inspections", id], data);
    },
  });
}

export function useSubmitInspection(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => submitInspection(id),
    onSuccess: (data) => {
      queryClient.setQueryData(["inspections", id], data);
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
    },
  });
}

export function useCancelInspection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelInspection,
    onSuccess: (data) => {
      queryClient.setQueryData(["inspections", data.id], data);
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
    },
  });
}
