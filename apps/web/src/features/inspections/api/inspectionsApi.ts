import { apiRequest } from "../../../lib/api/client";
import type { CreateInspectionInput, InspectionDetail, InspectionSummary } from "../types";

export function listInspections() {
  return apiRequest<InspectionSummary[]>("/inspections");
}

export function getInspection(id: string) {
  return apiRequest<InspectionDetail>(`/inspections/${id}`);
}

export function createInspection(input: CreateInspectionInput) {
  return apiRequest<InspectionDetail>("/inspections", { method: "POST", body: JSON.stringify(input) });
}

export function startInspection(id: string) {
  return apiRequest<InspectionDetail>(`/inspections/${id}/start`, { method: "POST" });
}

export function saveResponse(id: string, questionId: string, value: unknown) {
  return apiRequest<InspectionDetail>(`/inspections/${id}/responses/${questionId}`, {
    method: "PUT",
    body: JSON.stringify({ value }),
  });
}

export function submitInspection(id: string) {
  return apiRequest<InspectionDetail>(`/inspections/${id}/submit`, { method: "POST" });
}

export function cancelInspection(id: string) {
  return apiRequest<InspectionDetail>(`/inspections/${id}/cancel`, { method: "POST" });
}
