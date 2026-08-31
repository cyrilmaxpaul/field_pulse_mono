import { CircularProgress, Box } from "@mui/material";
import { AppProviders } from "./providers/AppProviders";
import { AppRouter } from "./router/AppRouter";
import { useSessionBootstrap } from "../features/auth/hooks/useSessionBootstrap";

function AppShell() {
  const isBootstrapping = useSessionBootstrap();

  if (isBootstrapping) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return <AppRouter />;
}

export function App() {
  return (
    <AppProviders>
      <AppShell />
    </AppProviders>
  );
}
