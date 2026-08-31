import { useEffect, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Alert, Box, Button, Chip, CircularProgress, IconButton, Stack } from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { useInspectionEvidence } from "../hooks/useEvidence";
import { useDeleteEvidence, useUploadEvidence } from "../hooks/useEvidenceMutations";
import { useOnlineStatus } from "../../../lib/offline/useOnlineStatus";
import { db } from "../../../lib/db/db";

export function EvidenceUploader({ inspectionId, questionId }: { inspectionId: string; questionId: string }) {
  const isOnline = useOnlineStatus();
  const { data: allEvidence } = useInspectionEvidence(inspectionId);
  const uploadMutation = useUploadEvidence(inspectionId);
  const deleteMutation = useDeleteEvidence(inspectionId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<Record<number, string>>({});

  const items = (allEvidence ?? []).filter((e) => e.questionId === questionId);
  const pendingItems = useLiveQuery(
    () =>
      db.pendingEvidence
        .where("inspectionId")
        .equals(inspectionId)
        .filter((item) => item.questionId === questionId)
        .toArray(),
    [inspectionId, questionId],
    [],
  );

  useEffect(() => {
    const urls: Record<number, string> = {};
    for (const item of pendingItems ?? []) {
      if (item.localId !== undefined) urls[item.localId] = URL.createObjectURL(item.fileBlob);
    }
    setPreviewUrls(urls);
    return () => {
      Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [pendingItems]);

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    try {
      if (isOnline) {
        await uploadMutation.mutateAsync({ questionId, file });
      } else {
        await db.pendingEvidence.add({
          inspectionId,
          questionId,
          fileBlob: file,
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
          createdAt: Date.now(),
          status: "pending",
        });
      }
    } catch {
      setError("Failed to upload photo. Please try again.");
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", alignItems: "center" }}>
        {items.map((evidence) => (
          <Box key={evidence.id} sx={{ position: "relative" }}>
            <Box
              component="img"
              src={evidence.viewUrl ?? undefined}
              alt={evidence.fileName}
              sx={{ width: 72, height: 72, objectFit: "cover", borderRadius: 1, border: "1px solid", borderColor: "divider" }}
            />
            <IconButton
              size="small"
              onClick={() => deleteMutation.mutate(evidence.id)}
              disabled={deleteMutation.isPending}
              sx={{
                position: "absolute",
                top: -8,
                right: -8,
                bgcolor: "background.paper",
                boxShadow: 1,
                "&:hover": { bgcolor: "background.paper" },
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}

        {(pendingItems ?? []).map((item) => (
          <Box key={item.localId} sx={{ position: "relative" }}>
            <Box
              component="img"
              src={item.localId !== undefined ? previewUrls[item.localId] : undefined}
              alt={item.fileName}
              sx={{ width: 72, height: 72, objectFit: "cover", borderRadius: 1, border: "1px dashed", borderColor: "warning.main" }}
            />
            <Chip
              label={item.status === "failed" ? "failed" : "pending"}
              size="small"
              color={item.status === "failed" ? "error" : "warning"}
              sx={{ position: "absolute", bottom: -8, left: 0, right: 0, mx: "auto", fontSize: 10 }}
            />
            <IconButton
              size="small"
              onClick={() => item.localId !== undefined && db.pendingEvidence.delete(item.localId)}
              sx={{
                position: "absolute",
                top: -8,
                right: -8,
                bgcolor: "background.paper",
                boxShadow: 1,
                "&:hover": { bgcolor: "background.paper" },
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}

        <Button
          variant="outlined"
          size="small"
          startIcon={uploadMutation.isPending ? <CircularProgress size={16} /> : <AddPhotoAlternateIcon />}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
        >
          {uploadMutation.isPending ? "Uploading…" : "Add Photo"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          hidden
          onChange={handleFileSelected}
        />
      </Stack>
    </Box>
  );
}
