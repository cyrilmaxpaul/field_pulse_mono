import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useSites } from "../hooks/useSites";
import { useArchiveSite } from "../hooks/useSiteMutations";
import { CreateSiteDialog } from "../components/CreateSiteDialog";

export function SitesListPage() {
  const { data: sites, isLoading } = useSites();
  const archiveMutation = useArchiveSite();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5">Sites</Typography>
        <Button variant="contained" onClick={() => setDialogOpen(true)}>
          Add Site
        </Button>
      </Stack>

      <Paper>
        {isLoading ? (
          <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(sites ?? []).map((site) => (
                  <TableRow key={site.id}>
                    <TableCell>{site.name}</TableCell>
                    <TableCell>{site.code}</TableCell>
                    <TableCell>{[site.city, site.state, site.country].filter(Boolean).join(", ")}</TableCell>
                    <TableCell>
                      <Chip
                        label={site.status}
                        size="small"
                        color={site.status === "ACTIVE" ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {site.status === "ACTIVE" && (
                        <Button
                          size="small"
                          color="error"
                          onClick={() => archiveMutation.mutate(site.id)}
                          disabled={archiveMutation.isPending}
                        >
                          Archive
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {sites?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      No sites yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <CreateSiteDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  );
}
