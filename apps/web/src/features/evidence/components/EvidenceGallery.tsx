import { Box, Chip, Paper, Typography } from "@mui/material";
import { useInspectionEvidence } from "../hooks/useEvidence";

export function EvidenceGallery({ inspectionId }: { inspectionId: string }) {
  const { data: evidence } = useInspectionEvidence(inspectionId);

  if (!evidence || evidence.length === 0) {
    return null;
  }

  return (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Evidence ({evidence.length})
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {evidence.map((item) => (
          <Box key={item.id} sx={{ width: 140 }}>
            <Box
              component="img"
              src={item.viewUrl ?? undefined}
              alt={item.fileName}
              sx={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", borderRadius: 1, border: "1px solid", borderColor: "divider" }}
            />
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block", mt: 0.5 }}>
              {item.uploadedBy.firstName} · {new Date(item.createdAt).toLocaleDateString()}
            </Typography>
            <Chip label={item.status} size="small" sx={{ mt: 0.5 }} />
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
