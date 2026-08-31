import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Box, Button, Chip, CircularProgress, List, ListItem, ListItemText, Paper, Stack, Typography } from "@mui/material";
import { db } from "../../../lib/db/db";
import { useOnlineStatus } from "../../../lib/offline/useOnlineStatus";
import { usePendingSyncCounts } from "../../../lib/offline/usePendingSyncCounts";
import { flushSyncQueue } from "../../../lib/offline/syncService";

export function SyncCenterPage() {
  const isOnline = useOnlineStatus();
  const { pendingResponses, pendingEvidence, total } = usePendingSyncCounts();
  const [isSyncing, setIsSyncing] = useState(false);

  const responseRows = useLiveQuery(() => db.pendingResponses.toArray(), [], []);
  const evidenceRows = useLiveQuery(() => db.pendingEvidence.toArray(), [], []);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      await flushSyncQueue();
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Sync Center
      </Typography>

      <Paper sx={{ p: 3, mb: 2 }}>
        <Stack direction="row" spacing={4} sx={{ flexWrap: "wrap" }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Connection
            </Typography>
            <Typography variant="h6">
              <Chip label={isOnline ? "Online" : "Offline"} color={isOnline ? "success" : "default"} />
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Pending changes
            </Typography>
            <Typography variant="h6">{total}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Responses
            </Typography>
            <Typography variant="h6">{pendingResponses}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Evidence uploads
            </Typography>
            <Typography variant="h6">{pendingEvidence}</Typography>
          </Box>
        </Stack>

        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={handleSyncNow}
          disabled={!isOnline || total === 0 || isSyncing}
          startIcon={isSyncing ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {isSyncing ? "Syncing…" : "Sync Now"}
        </Button>
      </Paper>

      {total > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Pending Items
          </Typography>
          <List dense>
            {(responseRows ?? []).map((row) => (
              <ListItem key={row.key}>
                <ListItemText
                  primary={`Response — inspection ${row.inspectionId.slice(0, 8)}…`}
                  secondary={`Question ${row.questionId.slice(0, 8)}… · waiting to sync`}
                />
              </ListItem>
            ))}
            {(evidenceRows ?? []).map((row) => (
              <ListItem key={row.localId}>
                <ListItemText
                  primary={`Evidence — ${row.fileName}`}
                  secondary={`Inspection ${row.inspectionId.slice(0, 8)}… · ${row.status}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
