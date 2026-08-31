import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, Alert } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useCreateTemplate } from "../hooks/useTemplateMutations";
import { ApiError } from "../../../lib/api/client";

const createTemplateFormSchema = z.object({
  name: z.string().min(1, "Required"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof createTemplateFormSchema>;

export function CreateTemplateDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createMutation = useCreateTemplate();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(createTemplateFormSchema) });

  const handleClose = () => {
    reset();
    setFormError(null);
    onClose();
  };

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const template = await createMutation.mutateAsync(values);
      handleClose();
      navigate(`/templates/${template.id}/builder/${template.versions[0].id}`);
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Something went wrong.");
    }
  });

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>New Template</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {formError && <Alert severity="error">{formError}</Alert>}
          <TextField
            label="Template name"
            fullWidth
            error={!!errors.name}
            helperText={errors.name?.message}
            {...register("name")}
          />
          <TextField label="Description" fullWidth multiline rows={2} {...register("description")} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Creating…" : "Create & Edit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
