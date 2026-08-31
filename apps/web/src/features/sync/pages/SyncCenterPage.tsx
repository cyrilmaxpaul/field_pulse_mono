import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { db } from "../../../lib/db/db";
import type { SyncConflict } from "../../../lib/db/db";
import { useOnlineStatus } from "../../../lib/offline/useOnlineStatus";
import { usePendingSyncCounts } from "../../../lib/offline/usePendingSyncCounts";
import { flushSyncQueue } from "../../../lib/offline/syncService";
import { resolveSync } from "../api/syncApi";
import { queryClient } from "../../../lib/api/queryClient";

function ConflictItem({ conflict }: { conflict: SyncConflict }) {
  const [isResolving, setIsResolving] = useState<string | null>(null);
  const [mergedText, setMergedText] = useState(JSON.stringify(conflict.clientValue));
  const [error, setError] = useState<string | null>(null);

  const cleanup = async () => {
    if (conflict.id !== undefined) await db.syncConflicts.delete(conflict.id);
    queryClient.invalidateQueries({ queryKey: ["inspections", conflict.inspectionId] });
  };

  const handleKeepServer = async () => {
    setIsResolving("server");
    setError(null);
    try {
      await resolveSync({ syncOperationId: conflict.syncOperationId, resolution: "KEEP_SERVER" });
      await cleanup();
    } catch {
      setError("Failed to resolve conflict. Please try again.");
    } finally {
      setIsResolving(null);
    }
  };

  const handleKeepClient = async () => {
    setIsResolving("client");
    setError(null);
    try {
      await resolveSync({ syncOperationId: conflict.syncOperationId, resolution: "KEEP_CLIENT" });
      await cleanup();
    } catch {
      setError("Failed to resolve conflict. Please try again.");
    } finally {
      setIsResolving(null);
    }
  };

  const handleMerge = async () => {
    setIsResolving("merge");
    setError(null);
    try {
      let mergedValue: unknown = mergedText;
      try {
        mergedValue = JSON.parse(mergedText);
      } catch {
        // Not valid JSON — treat it as a plain string value.
      }
      await resolveSync({ syncOperationId: conflict.syncOperationId, resolution: "MERGE", mergedValue });
      await cleanup();
    } catch {
      setError("Failed to resolve conflict. Please try again.");
    } finally {
      setIsResolving(null);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Inspection {conflict.inspectionId.slice(0, 8)}… — Question {conflict.questionId.slice(0, 8)}…
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: "wrap" }}>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Typography variant="caption" color="text.secondary">
            Server version
          </Typography>
          <Typography variant="body2">{JSON.stringify(conflict.serverValue)}</Typography>
        </Box>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Typography variant="caption" color="text.secondary">
            Your offline version
          </Typography>
          <Typography variant="body2">{JSON.stringify(conflict.clientValue)}</Typography>
        </Box>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", alignItems: "center" }}>
        <Button
          size="small"
          variant="outlined"
          onClick={handleKeepServer}
          disabled={isResolving !== null}
          startIcon={isResolving === "server" ? <CircularProgress size={14} /> : undefined}
        >
          Keep Server
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={handleKeepClient}
          disabled={isResolving !== null}
          startIcon={isResolving === "client" ? <CircularProgress size={14} /> : undefined}
        >
          Keep My Changes
        </Button>
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      <Typography variant="caption" color="text.secondary">
        Review &amp; Merge
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mt: 0.5, alignItems: "center" }}>
        <TextField
          size="small"
          fullWidth
          value={mergedText}
          onChange={(e) => setMergedText(e.target.value)}
          disabled={isResolving !== null}
        />
        <Button
          size="small"
          variant="contained"
          onClick={handleMerge}
          disabled={isResolving !== null}
          startIcon={isResolving === "merge" ? <CircularProgress size={14} color="inherit" /> : undefined}
        >
          Save Merge
        </Button>
      </Stack>
    </Paper>
  );
}

export function SyncCenterPage() {
  const isOnline = useOnlineStatus();
  const { pendingResponses, pendingEvidence, total } = usePendingSyncCounts();
  const [isSyncing, setIsSyncing] = useState(false);

  const responseRows = useLiveQuery(() => db.pendingResponses.toArray(), [], []);
  const evidenceRows = useLiveQuery(() => db.pendingEvidence.toArray(), [], []);
  const conflicts = useLiveQuery(() => db.syncConflicts.toArray(), [], []);

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

      {(conflicts?.length ?? 0) > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Sync Conflicts
          </Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            These responses changed on the server while you were offline. Choose how to resolve each one.
          </Alert>
          {(conflicts ?? []).map((conflict) => (
            <ConflictItem key={conflict.id} conflict={conflict} />
          ))}
        </Box>
      )}

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
