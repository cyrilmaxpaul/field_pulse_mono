import { Paper, Typography } from "@mui/material";
import { useAuthState } from "../../../stores/authStore";

export function DashboardPage() {
  const { user } = useAuthState();

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Welcome, {user?.firstName}
      </Typography>
      <Typography color="text.secondary">
        Signed in as {user?.email} — Phase 2 adds Sites, Team, and Roles management.
      </Typography>
    </Paper>
  );
}
