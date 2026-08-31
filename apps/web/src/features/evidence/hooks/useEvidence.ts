import { useQuery } from "@tanstack/react-query";
import { listInspectionEvidence } from "../api/evidenceApi";

export function useInspectionEvidence(inspectionId: string | undefined) {
  return useQuery({
    queryKey: ["evidence", inspectionId],
    queryFn: () => listInspectionEvidence(inspectionId!),
    enabled: !!inspectionId,
  });
}
