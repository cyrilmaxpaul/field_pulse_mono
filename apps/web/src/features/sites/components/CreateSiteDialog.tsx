import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Alert,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateSite } from "../hooks/useSiteMutations";
import { ApiError } from "../../../lib/api/client";

const createSiteFormSchema = z.object({
  name: z.string().min(1, "Required"),
  code: z.string().min(1, "Required"),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
});

type FormValues = z.infer<typeof createSiteFormSchema>;

export function CreateSiteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createSiteMutation = useCreateSite();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(createSiteFormSchema) });

  const handleClose = () => {
    reset();
    setFormError(null);
    onClose();
  };

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await createSiteMutation.mutateAsync(values);
      handleClose();
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Something went wrong.");
    }
  });

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Site</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {formError && <Alert severity="error">{formError}</Alert>}

          <TextField
            label="Site name"
            fullWidth
            error={!!errors.name}
            helperText={errors.name?.message}
            {...register("name")}
          />
          <TextField
            label="Site code"
            fullWidth
            error={!!errors.code}
            helperText={errors.code?.message}
            {...register("code")}
          />
          <TextField label="City" fullWidth {...register("city")} />
          <TextField label="State" fullWidth {...register("state")} />
          <TextField label="Country" fullWidth {...register("country")} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Creating…" : "Create Site"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
