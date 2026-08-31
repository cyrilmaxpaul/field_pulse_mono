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
import { useCreateUser } from "../hooks/useUserMutations";
import { useRoles } from "../../roles/hooks/useRoles";
import { ApiError } from "../../../lib/api/client";

const createUserFormSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email(),
  password: z.string().min(8, "At least 8 characters"),
});

type FormValues = z.infer<typeof createUserFormSchema>;

export function CreateUserDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: roles } = useRoles();
  const createUserMutation = useCreateUser();
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(createUserFormSchema) });

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) => (prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]));
  };

  const handleClose = () => {
    reset();
    setSelectedRoleIds([]);
    setFormError(null);
    onClose();
  };

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await createUserMutation.mutateAsync({ ...values, roleIds: selectedRoleIds });
      handleClose();
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Something went wrong.");
    }
  });

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Add User</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {formError && <Alert severity="error">{formError}</Alert>}

          <TextField
            label="First name"
            fullWidth
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
            {...register("firstName")}
          />
          <TextField
            label="Last name"
            fullWidth
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
            {...register("lastName")}
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            error={!!errors.email}
            helperText={errors.email?.message}
            {...register("email")}
          />
          <TextField
            label="Initial password"
            type="password"
            fullWidth
            error={!!errors.password}
            helperText={errors.password?.message}
            {...register("password")}
          />

          <Typography variant="subtitle2">Roles</Typography>
          <FormGroup>
            {(roles ?? []).map((role) => (
              <FormControlLabel
                key={role.id}
                control={
                  <Checkbox checked={selectedRoleIds.includes(role.id)} onChange={() => toggleRole(role.id)} />
                }
                label={role.name}
              />
            ))}
          </FormGroup>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Creating…" : "Create User"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
