import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Box, Button, Paper, Stack, TextField, Typography, Alert } from "@mui/material";
import { loginSchema, type LoginFormValues } from "../schemas/loginSchema";
import { useLogin } from "../hooks/useLogin";
import { ApiError } from "../../../lib/api/client";

export function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await loginMutation.mutateAsync(values);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    }
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.100",
        px: 2,
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 400 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }} gutterBottom>
          FieldPulse
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Sign in to continue
        </Typography>

        <Box component="form" onSubmit={onSubmit} noValidate>
          <Stack spacing={2}>
            {formError && <Alert severity="error">{formError}</Alert>}

            <TextField
              label="Email"
              type="email"
              autoComplete="email"
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
              {...register("email")}
            />

            <TextField
              label="Password"
              type="password"
              autoComplete="current-password"
              fullWidth
              error={!!errors.password}
              helperText={errors.password?.message}
              {...register("password")}
            />

            <Button type="submit" variant="contained" size="large" disabled={isSubmitting} fullWidth>
              {isSubmitting ? "Signing in…" : "Login"}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
