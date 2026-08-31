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
import { useRoles } from "../hooks/useRoles";
import { useDeleteRole } from "../hooks/useRoleMutations";
import { CreateRoleDialog } from "../components/CreateRoleDialog";

export function RolesListPage() {
  const { data: roles, isLoading } = useRoles();
  const deleteMutation = useDeleteRole();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5">Roles & Permissions</Typography>
        <Button variant="contained" onClick={() => setDialogOpen(true)}>
          Add Role
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
                  <TableCell>Description</TableCell>
                  <TableCell>Permissions</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(roles ?? []).map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>{role.name}</TableCell>
                    <TableCell>{role.description}</TableCell>
                    <TableCell>
                      {role.permissionKeys.map((key) => (
                        <Chip key={key} label={key} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      ))}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        color="error"
                        onClick={() => deleteMutation.mutate(role.id)}
                        disabled={deleteMutation.isPending}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {roles?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      No roles yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <CreateRoleDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  );
}
