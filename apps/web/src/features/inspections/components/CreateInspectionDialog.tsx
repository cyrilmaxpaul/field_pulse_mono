import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Stack,
  Alert,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateInspection } from "../hooks/useInspectionMutations";
import { useSites } from "../../sites/hooks/useSites";
import { useUsers } from "../../users/hooks/useUsers";
import { useTemplates } from "../../templates/hooks/useTemplates";
import { ApiError } from "../../../lib/api/client";

const createInspectionFormSchema = z.object({
  siteId: z.string().min(1, "Required"),
  templateVersionId: z.string().min(1, "Required"),
  assignedTo: z.string().min(1, "Required"),
  scheduledAt: z.string().optional(),
});

type FormValues = z.infer<typeof createInspectionFormSchema>;

export function CreateInspectionDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: sites } = useSites();
  const { data: users } = useUsers();
  const { data: templates } = useTemplates();
  const createMutation = useCreateInspection();
  const [formError, setFormError] = useState<string | null>(null);

  const publishedTemplates = (templates ?? []).filter((t) => t.currentVersionId);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(createInspectionFormSchema) });

  const handleClose = () => {
    reset();
    setFormError(null);
    onClose();
  };

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await createMutation.mutateAsync({
        siteId: values.siteId,
        templateVersionId: values.templateVersionId,
        assignedTo: values.assignedTo,
        scheduledAt: values.scheduledAt ? new Date(values.scheduledAt).toISOString() : undefined,
      });
      handleClose();
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Something went wrong.");
    }
  });

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>New Inspection</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {formError && <Alert severity="error">{formError}</Alert>}

          <Controller
            control={control}
            name="siteId"
            defaultValue=""
            render={({ field }) => (
              <TextField {...field} select label="Site" fullWidth error={!!errors.siteId} helperText={errors.siteId?.message}>
                {(sites ?? []).map((site) => (
                  <MenuItem key={site.id} value={site.id}>
                    {site.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Controller
            control={control}
            name="templateVersionId"
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Template"
                fullWidth
                error={!!errors.templateVersionId}
                helperText={errors.templateVersionId?.message}
              >
                {publishedTemplates.map((template) => (
                  <MenuItem key={template.id} value={template.currentVersionId!}>
                    {template.name} (v{template.currentVersionNumber})
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Controller
            control={control}
            name="assignedTo"
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Assign to"
                fullWidth
                error={!!errors.assignedTo}
                helperText={errors.assignedTo?.message}
              >
                {(users ?? [])
                  .filter((u) => u.status === "ACTIVE")
                  .map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </MenuItem>
                  ))}
              </TextField>
            )}
          />

          <Controller
            control={control}
            name="scheduledAt"
            defaultValue=""
            render={({ field }) => <TextField {...field} label="Scheduled date" type="date" fullWidth slotProps={{ inputLabel: { shrink: true } }} />}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Creating…" : "Create Inspection"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
