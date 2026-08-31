import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useInspection } from "../hooks/useInspections";
import { useSaveResponse, useSubmitInspection } from "../hooks/useInspectionMutations";
import { QuestionInput } from "../components/QuestionInput";
import { EvidenceUploader } from "../../evidence/components/EvidenceUploader";
import { useInspectionEvidence } from "../../evidence/hooks/useEvidence";
import { ApiError } from "../../../lib/api/client";
import { db } from "../../../lib/db/db";
import { useOnlineStatus } from "../../../lib/offline/useOnlineStatus";
import type { InspectionDetail } from "../types";

export function InspectionFormPage() {
  const { inspectionId } = useParams<{ inspectionId: string }>();
  const isOnline = useOnlineStatus();
  const { data: networkInspection, isLoading } = useInspection(inspectionId);
  const { data: networkEvidence } = useInspectionEvidence(inspectionId);
  const saveResponseMutation = useSaveResponse(inspectionId!);
  const submitMutation = useSubmitInspection(inspectionId!);
  const navigate = useNavigate();

  const [cachedInspection, setCachedInspection] = useState<InspectionDetail | null>(null);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const inspection = networkInspection ?? cachedInspection;

  // Cache the last known-good copy so the form still opens (read-only data,
  // but fully answerable) when a worker has no connectivity at all.
  useEffect(() => {
    if (networkInspection) {
      void db.cachedInspections.put({ id: networkInspection.id, data: networkInspection, cachedAt: Date.now() });
    }
  }, [networkInspection]);

  useEffect(() => {
    if (!networkInspection && inspectionId) {
      db.cachedInspections.get(inspectionId).then((row) => {
        if (row) setCachedInspection(row.data);
      });
    }
  }, [networkInspection, inspectionId]);

  const pendingEvidence = useLiveQuery(
    () => (inspection ? db.pendingEvidence.where("inspectionId").equals(inspection.id).toArray() : []),
    [inspection?.id],
    [],
  );

  // Seed `answers` exactly once per inspection load (network responses + any
  // already-queued offline edits from a prior session), then treat it as
  // UI-owned local state from then on. This deliberately does NOT react to
  // the pendingResponses queue draining as it syncs — reactively rebuilding
  // from that live query would wipe just-synced answers off the screen the
  // instant their queue row is deleted, racing ahead of the network refetch
  // that would otherwise confirm them.
  useEffect(() => {
    if (!inspection) return;
    let cancelled = false;
    db.pendingResponses
      .where("inspectionId")
      .equals(inspection.id)
      .toArray()
      .then((pending) => {
        if (cancelled) return;
        const initial: Record<string, unknown> = {};
        for (const response of inspection.responses) {
          initial[response.questionId] = response.value;
        }
        for (const p of pending) {
          initial[p.questionId] = p.value;
        }
        setAnswers(initial);
      });
    return () => {
      cancelled = true;
    };
  }, [inspection?.id]);

  // Navigation must happen in an effect, not during render — calling navigate()
  // directly in the render body triggers a "Cannot update a component while
  // rendering a different component" error from React Router's BrowserRouter.
  useEffect(() => {
    if (inspection && inspection.status !== "IN_PROGRESS") {
      navigate(`/inspections/${inspection.id}`, { replace: true });
    }
  }, [inspection, navigate]);

  if ((isLoading && !cachedInspection) || !inspection || inspection.status !== "IN_PROGRESS") {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  const sections = inspection.templateVersion.sections;
  const isSummaryStep = sectionIndex === sections.length;
  const currentSection = sections[sectionIndex];

  const allQuestions = sections.flatMap((s) => s.questions);
  const answeredQuestionIds = new Set(
    Object.entries(answers)
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .map(([id]) => id),
  );
  const evidencedQuestionIds = new Set([
    ...(networkEvidence ?? []).map((e) => e.questionId),
    ...(pendingEvidence ?? []).map((e) => e.questionId),
  ]);

  const missingRequired = allQuestions.filter((q) => q.isRequired && !answeredQuestionIds.has(q.id));
  const missingEvidence = allQuestions.filter((q) => q.evidenceRequired && !evidencedQuestionIds.has(q.id));
  const isReadyToSubmit = missingRequired.length === 0 && missingEvidence.length === 0;

  const saveCurrentSection = async () => {
    if (!currentSection) return;
    setIsSaving(true);
    setError(null);
    try {
      for (const question of currentSection.questions) {
        if (answers[question.id] === undefined) continue;

        if (isOnline) {
          await saveResponseMutation.mutateAsync({ questionId: question.id, value: answers[question.id] });
        } else {
          await db.pendingResponses.put({
            key: `${inspection.id}:${question.id}`,
            inspectionId: inspection.id,
            questionId: question.id,
            value: answers[question.id],
            updatedAt: Date.now(),
          });
        }
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save responses.");
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    try {
      await saveCurrentSection();
      setSectionIndex((i) => i + 1);
    } catch {
      // error already set
    }
  };

  const handleBack = async () => {
    if (isSummaryStep) {
      setSectionIndex((i) => i - 1);
      return;
    }
    try {
      await saveCurrentSection();
      setSectionIndex((i) => Math.max(0, i - 1));
    } catch {
      // error already set
    }
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      await submitMutation.mutateAsync();
      navigate(`/inspections/${inspection.id}`, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to submit inspection.");
    }
  };

  return (
    <Box sx={{ maxWidth: 640, mx: "auto", pb: 10 }}>
      <Typography variant="body2" color="text.secondary">
        {inspection.template.name}
      </Typography>
      <Typography variant="h6" gutterBottom>
        {isSummaryStep ? "Review & Submit" : `Section ${sectionIndex + 1} of ${sections.length}`}
      </Typography>

      {!isOnline && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Offline — your answers are being saved on this device and will sync automatically once you're back online.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!isSummaryStep && currentSection && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {currentSection.title}
          </Typography>
          <Stack spacing={3}>
            {currentSection.questions.map((question) => (
              <Box key={question.id}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
                  <Typography>{question.label}</Typography>
                  {question.isRequired && <Chip label="required" size="small" color="warning" />}
                  {question.evidenceRequired && <Chip label="evidence required" size="small" />}
                </Stack>
                <QuestionInput
                  question={question}
                  value={answers[question.id]}
                  onChange={(value) => setAnswers((prev) => ({ ...prev, [question.id]: value }))}
                />
                {question.evidenceRequired && (
                  <Box sx={{ mt: 1.5 }}>
                    <EvidenceUploader inspectionId={inspection.id} questionId={question.id} />
                  </Box>
                )}
              </Box>
            ))}
          </Stack>
        </Paper>
      )}

      {isSummaryStep && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            {allQuestions.length - missingRequired.length} / {allQuestions.length} questions completed
          </Typography>
          <LinearProgress
            variant="determinate"
            value={((allQuestions.length - missingRequired.length) / Math.max(allQuestions.length, 1)) * 100}
            sx={{ height: 8, borderRadius: 4, mb: 2 }}
          />

          {missingRequired.length > 0 && (
            <Alert severity="warning" sx={{ mb: 1 }}>
              Missing required answers: {missingRequired.map((q) => q.label).join(", ")}
            </Alert>
          )}
          {missingEvidence.length > 0 && (
            <Alert severity="warning" sx={{ mb: 1 }}>
              Missing required evidence: {missingEvidence.map((q) => q.label).join(", ")}
            </Alert>
          )}
          {isReadyToSubmit && <Alert severity="success">All required questions are answered.</Alert>}

          {!isOnline && (
            <Alert severity="info" sx={{ mt: 1 }}>
              You're offline. Everything is saved on this device — connect to the internet to submit.
            </Alert>
          )}
        </Paper>
      )}

      <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: "space-between" }}>
        <Button onClick={handleBack} disabled={sectionIndex === 0 || isSaving}>
          Back
        </Button>
        {isSummaryStep ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!isReadyToSubmit || !isOnline || submitMutation.isPending}
          >
            {submitMutation.isPending ? "Submitting…" : "Submit Inspection"}
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext} disabled={isSaving}>
            {isSaving ? "Saving…" : "Save & Next"}
          </Button>
        )}
      </Stack>
    </Box>
  );
}
