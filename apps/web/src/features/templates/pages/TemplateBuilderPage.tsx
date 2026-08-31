import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useTemplate, useVersion } from "../hooks/useTemplates";
import { useCreateDraftVersion, useReplaceStructure } from "../hooks/useTemplateMutations";
import { SectionCard } from "../components/SectionCard";
import { newLocalId, type LocalSection } from "../types/builder";
import type { ReplaceStructureInput } from "../types";
import { ApiError } from "../../../lib/api/client";

function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

export function TemplateBuilderPage() {
  const { templateId, versionId } = useParams<{ templateId: string; versionId: string }>();
  const navigate = useNavigate();
  const { data: template } = useTemplate(templateId);
  const { data: version, isLoading } = useVersion(templateId, versionId);
  const createDraftMutation = useCreateDraftVersion(templateId!);
  const saveMutation = useReplaceStructure(templateId!, versionId!);

  const [sections, setSections] = useState<LocalSection[] | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (version) {
      setSections(
        version.sections.map((section) => ({
          localId: section.id,
          title: section.title,
          questions: section.questions.map((question) => ({
            localId: question.id,
            questionKey: question.questionKey,
            label: question.label,
            questionType: question.questionType,
            isRequired: question.isRequired,
            evidenceRequired: question.evidenceRequired,
            options: (question.options as string[] | null) ?? [],
          })),
        })),
      );
    }
  }, [version]);

  if (isLoading || !sections) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  const isEditable = version?.status === "DRAFT";

  const updateSection = (index: number, next: LocalSection) => {
    const copy = [...sections];
    copy[index] = next;
    setSections(copy);
  };

  const deleteSection = (index: number) => setSections(sections.filter((_, i) => i !== index));
  const moveSection = (index: number, direction: -1 | 1) => setSections(arrayMove(sections, index, index + direction));

  const addSection = () => {
    setSections([...sections, { localId: newLocalId("section"), title: "New Section", questions: [] }]);
  };

  const handleSave = async () => {
    setSaveError(null);
    setSaved(false);
    const payload: ReplaceStructureInput = {
      sections: sections.map((section) => ({
        title: section.title,
        questions: section.questions.map((question) => ({
          questionKey: question.questionKey,
          label: question.label,
          questionType: question.questionType,
          isRequired: question.isRequired,
          evidenceRequired: question.evidenceRequired,
          options: question.options.length > 0 ? question.options : undefined,
        })),
      })),
    };
    try {
      await saveMutation.mutateAsync(payload);
      setSaved(true);
    } catch (error) {
      setSaveError(error instanceof ApiError ? error.message : "Something went wrong saving the template.");
    }
  };

  const handleCreateDraft = async () => {
    const newVersion = await createDraftMutation.mutateAsync();
    navigate(`/templates/${templateId}/builder/${newVersion.id}`, { replace: true });
  };

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box>
          <Typography variant="h5">{template?.name ?? "Template Builder"}</Typography>
          <Typography variant="body2" color="text.secondary">
            Version {version?.versionNumber} · {version?.status}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button onClick={() => navigate(`/templates/${templateId}/preview`)}>Preview</Button>
          {isEditable && (
            <Button variant="contained" onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving…" : "Save Draft"}
            </Button>
          )}
        </Stack>
      </Stack>

      {!isEditable && (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={handleCreateDraft} disabled={createDraftMutation.isPending}>
              Create Draft to Edit
            </Button>
          }
        >
          This version is published and read-only. Create a new draft to make changes.
        </Alert>
      )}

      {saveError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {saveError}
        </Alert>
      )}
      {saved && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSaved(false)}>
          Draft saved.
        </Alert>
      )}

      {sections.map((section, index) => (
        <SectionCard
          key={section.localId}
          section={section}
          onChange={(next) => updateSection(index, next)}
          onDelete={() => deleteSection(index)}
          onMoveUp={() => moveSection(index, -1)}
          onMoveDown={() => moveSection(index, 1)}
          isFirst={index === 0}
          isLast={index === sections.length - 1}
          readOnly={!isEditable}
        />
      ))}

      {isEditable && (
        <Button startIcon={<AddIcon />} onClick={addSection}>
          Add Section
        </Button>
      )}
    </Box>
  );
}
