import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { useCancelInspection, useStartInspection } from "../hooks/useInspectionMutations";
import { useAuthState } from "../../../stores/authStore";
import { EvidenceGallery } from "../../evidence/components/EvidenceGallery";
import { ApiError } from "../../../lib/api/client";

export function InspectionDetailPage() {
  const { inspectionId } = useParams<{ inspectionId: string }>();
  const { data: inspection, isLoading } = useInspection(inspectionId);
  const { user } = useAuthState();
  const startMutation = useStartInspection(inspectionId!);
  const cancelMutation = useCancelInspection();
  const navigate = useNavigate();
  const [actionError, setActionError] = useState<string | null>(null);

  if (isLoading || !inspection) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  const isAssignee = user?.id === inspection.assignee.id;
  const canStart = isAssignee && inspection.status === "ASSIGNED";
  const canContinue = isAssignee && inspection.status === "IN_PROGRESS";
  const canCancel = inspection.status === "ASSIGNED" || inspection.status === "IN_PROGRESS";

  const progressPercent =
    inspection.progress.totalQuestions === 0
      ? 0
      : Math.round((inspection.progress.answeredQuestions / inspection.progress.totalQuestions) * 100);

  const handleStart = async () => {
    setActionError(null);
    try {
      await startMutation.mutateAsync();
      navigate(`/inspections/${inspection.id}/form`);
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : "Something went wrong.");
    }
  };

  const handleCancel = async () => {
    setActionError(null);
    try {
      await cancelMutation.mutateAsync(inspection.id);
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : "Something went wrong.");
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {inspection.template.name}
      </Typography>
      <Chip label={inspection.status} sx={{ mb: 2 }} />

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 2 }}>
        <Stack spacing={1}>
          <Typography variant="body2">
            <strong>Site:</strong> {inspection.site.name} ({inspection.site.code})
          </Typography>
          <Typography variant="body2">
            <strong>Assigned worker:</strong> {inspection.assignee.firstName} {inspection.assignee.lastName}
          </Typography>
          <Typography variant="body2">
            <strong>Template version:</strong> v{inspection.templateVersion.versionNumber}
          </Typography>
          {inspection.scheduledAt && (
            <Typography variant="body2">
              <strong>Scheduled:</strong> {new Date(inspection.scheduledAt).toLocaleDateString()}
            </Typography>
          )}
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Progress: {inspection.progress.answeredQuestions} / {inspection.progress.totalQuestions} questions
        </Typography>
        <LinearProgress variant="determinate" value={progressPercent} sx={{ height: 8, borderRadius: 4 }} />
      </Paper>

      <EvidenceGallery inspectionId={inspection.id} />

      <Stack direction="row" spacing={2}>
        {canStart && (
          <Button variant="contained" onClick={handleStart} disabled={startMutation.isPending}>
            Start Inspection
          </Button>
        )}
        {canContinue && (
          <Button variant="contained" onClick={() => navigate(`/inspections/${inspection.id}/form`)}>
            Continue Inspection
          </Button>
        )}
        {canCancel && (
          <Button color="error" onClick={handleCancel} disabled={cancelMutation.isPending}>
            Cancel Inspection
          </Button>
        )}
      </Stack>
    </Box>
  );
}
