import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTemplates } from "../hooks/useTemplates";
import { useArchiveTemplate, useDuplicateTemplate, usePublishTemplate } from "../hooks/useTemplateMutations";
import { CreateTemplateDialog } from "../components/CreateTemplateDialog";

export function TemplatesListPage() {
  const { data: templates, isLoading } = useTemplates();
  const publishMutation = usePublishTemplate();
  const duplicateMutation = useDuplicateTemplate();
  const archiveMutation = useArchiveTemplate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5">Inspection Templates</Typography>
        <Button variant="contained" onClick={() => setDialogOpen(true)}>
          New Template
        </Button>
      </Stack>

      <Paper>
        {isLoading ? (
          <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Version</TableCell>
                  <TableCell>Sections</TableCell>
                  <TableCell>Questions</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(templates ?? []).map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>{template.name}</TableCell>
                    <TableCell>
                      v{template.latestVersionNumber}
                      {template.latestVersionStatus === "DRAFT" && (
                        <Chip label="draft" size="small" sx={{ ml: 1 }} />
                      )}
                    </TableCell>
                    <TableCell>{template.sectionsCount}</TableCell>
                    <TableCell>{template.questionsCount}</TableCell>
                    <TableCell>
                      <Chip
                        label={template.status}
                        size="small"
                        color={
                          template.status === "PUBLISHED"
                            ? "success"
                            : template.status === "ARCHIVED"
                              ? "default"
                              : "warning"
                        }
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                        {template.status !== "ARCHIVED" && (
                          <>
                            <Button
                              size="small"
                              onClick={() => navigate(`/templates/${template.id}/preview`)}
                            >
                              Preview
                            </Button>
                            {template.latestVersionStatus === "DRAFT" && (
                              <Button
                                size="small"
                                onClick={() =>
                                  navigate(`/templates/${template.id}/builder/${template.latestVersionId}`)
                                }
                              >
                                Edit
                              </Button>
                            )}
                            {template.latestVersionStatus === "DRAFT" && (
                              <Button
                                size="small"
                                color="success"
                                onClick={() => publishMutation.mutate(template.id)}
                                disabled={publishMutation.isPending}
                              >
                                Publish
                              </Button>
                            )}
                            <Button
                              size="small"
                              onClick={() => duplicateMutation.mutate(template.id)}
                              disabled={duplicateMutation.isPending}
                            >
                              Duplicate
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => archiveMutation.mutate(template.id)}
                              disabled={archiveMutation.isPending}
                            >
                              Archive
                            </Button>
                          </>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {templates?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      No templates yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <CreateTemplateDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  );
}
