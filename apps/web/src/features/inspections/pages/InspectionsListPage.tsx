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
import { useNavigate } from "react-router-dom";
import { useInspections } from "../hooks/useInspections";
import { CreateInspectionDialog } from "../components/CreateInspectionDialog";
import type { InspectionStatus } from "../types";

const STATUS_COLOR: Record<InspectionStatus, "default" | "warning" | "info" | "success" | "error"> = {
  ASSIGNED: "default",
  IN_PROGRESS: "info",
  PENDING_SYNC: "warning",
  SUBMITTED: "success",
  IN_REVIEW: "warning",
  REWORK_REQUIRED: "error",
  APPROVED: "success",
  CANCELLED: "default",
};

export function InspectionsListPage() {
  const { data: inspections, isLoading } = useInspections();
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5">Inspections</Typography>
        <Button variant="contained" onClick={() => setDialogOpen(true)}>
          New Inspection
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
                  <TableCell>Template</TableCell>
                  <TableCell>Site</TableCell>
                  <TableCell>Worker</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Scheduled</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(inspections ?? []).map((inspection) => (
                  <TableRow key={inspection.id} hover sx={{ cursor: "pointer" }} onClick={() => navigate(`/inspections/${inspection.id}`)}>
                    <TableCell>
                      {inspection.templateName} (v{inspection.templateVersionNumber})
                    </TableCell>
                    <TableCell>{inspection.site.name}</TableCell>
                    <TableCell>
                      {inspection.assignee.firstName} {inspection.assignee.lastName}
                    </TableCell>
                    <TableCell>
                      <Chip label={inspection.status} size="small" color={STATUS_COLOR[inspection.status]} />
                    </TableCell>
                    <TableCell>
                      {inspection.scheduledAt ? new Date(inspection.scheduledAt).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={(e) => { e.stopPropagation(); navigate(`/inspections/${inspection.id}`); }}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {inspections?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      No inspections yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <CreateInspectionDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  );
}
