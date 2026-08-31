import { useQuery } from "@tanstack/react-query";
import { listSites } from "../api/sitesApi";

export function useSites() {
  return useQuery({ queryKey: ["sites"], queryFn: listSites });
}
