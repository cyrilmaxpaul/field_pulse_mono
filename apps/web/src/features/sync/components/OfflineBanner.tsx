import { Alert, Box } from "@mui/material";
import { useOnlineStatus } from "../../../lib/offline/useOnlineStatus";
import { usePendingSyncCounts } from "../../../lib/offline/usePendingSyncCounts";

export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const { total } = usePendingSyncCounts();

  if (isOnline && total === 0) return null;

  return (
    <Box sx={{ px: 3, pt: 2 }}>
      <Alert severity={isOnline ? "info" : "warning"} variant="outlined">
        {isOnline
          ? `Syncing ${total} pending change${total === 1 ? "" : "s"}…`
          : "Offline — changes are saved locally and will sync automatically when you're back online."}
      </Alert>
    </Box>
  );
}
