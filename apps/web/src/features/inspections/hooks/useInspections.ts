import { useQuery } from "@tanstack/react-query";
import { getInspection, listInspections } from "../api/inspectionsApi";

export function useInspections() {
  return useQuery({ queryKey: ["inspections"], queryFn: listInspections });
}

export function useInspection(id: string | undefined) {
  return useQuery({
    queryKey: ["inspections", id],
    queryFn: () => getInspection(id!),
    enabled: !!id,
  });
}
