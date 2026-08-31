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
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateRole } from "../hooks/useRoleMutations";
import { usePermissions } from "../hooks/useRoles";
import { ApiError } from "../../../lib/api/client";

const createRoleFormSchema = z.object({
  name: z.string().min(1, "Required"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof createRoleFormSchema>;

export function CreateRoleDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: permissions } = usePermissions();
  const createRoleMutation = useCreateRole();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(createRoleFormSchema) });

  const toggleKey = (key: string) => {
    setSelectedKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const handleClose = () => {
    reset();
    setSelectedKeys([]);
    setFormError(null);
    onClose();
  };

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await createRoleMutation.mutateAsync({ ...values, permissionKeys: selectedKeys });
      handleClose();
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Something went wrong.");
    }
  });

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Role</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {formError && <Alert severity="error">{formError}</Alert>}

          <TextField
            label="Role name"
            fullWidth
            error={!!errors.name}
            helperText={errors.name?.message}
            {...register("name")}
          />
          <TextField label="Description" fullWidth multiline rows={2} {...register("description")} />

          <Typography variant="subtitle2">Permissions</Typography>
          <FormGroup>
            {(permissions ?? []).map((permission) => (
              <FormControlLabel
                key={permission.key}
                control={
                  <Checkbox checked={selectedKeys.includes(permission.key)} onChange={() => toggleKey(permission.key)} />
                }
                label={permission.description ?? permission.key}
              />
            ))}
          </FormGroup>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Creating…" : "Create Role"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
