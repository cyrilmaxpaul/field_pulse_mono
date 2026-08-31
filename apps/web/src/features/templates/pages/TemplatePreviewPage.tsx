import { useParams } from "react-router-dom";
import { Box, Chip, CircularProgress, Divider, Paper, Stack, Typography } from "@mui/material";
import { useTemplate, useTemplatePreview } from "../hooks/useTemplates";
import { QUESTION_TYPE_LABELS } from "../types/builder";

export function TemplatePreviewPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const { data: template } = useTemplate(templateId);
  const { data: version, isLoading, isError } = useTemplatePreview(templateId);

  if (isLoading) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !version) {
    return <Typography color="text.secondary">This template has no content to preview yet.</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {template?.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Version {version.versionNumber} · {version.status}
      </Typography>

      {version.sections.map((section) => (
        <Paper key={section.id} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {section.title}
          </Typography>
          {section.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {section.description}
            </Typography>
          )}
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={2}>
            {section.questions.map((question) => (
              <Box key={question.id}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <Typography>{question.label}</Typography>
                  {question.isRequired && <Chip label="required" size="small" color="warning" />}
                  {question.evidenceRequired && <Chip label="evidence required" size="small" />}
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {QUESTION_TYPE_LABELS[question.questionType]}
                  {Array.isArray(question.options) && question.options.length > 0
                    ? ` — ${question.options.join(", ")}`
                    : ""}
                </Typography>
              </Box>
            ))}
            {section.questions.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No questions in this section.
              </Typography>
            )}
          </Stack>
        </Paper>
      ))}

      {version.sections.length === 0 && (
        <Typography color="text.secondary">This template has no sections yet.</Typography>
      )}
    </Box>
  );
}
