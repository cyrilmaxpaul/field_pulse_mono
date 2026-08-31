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
import { useUsers } from "../hooks/useUsers";
import { useDeactivateUser } from "../hooks/useUserMutations";
import { CreateUserDialog } from "../components/CreateUserDialog";

export function UsersListPage() {
  const { data: users, isLoading } = useUsers();
  const deactivateMutation = useDeactivateUser();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5">Team</Typography>
        <Button variant="contained" onClick={() => setDialogOpen(true)}>
          Add User
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
                  <TableCell>Email</TableCell>
                  <TableCell>Roles</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(users ?? []).map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.roles.map((role) => (
                        <Chip key={role.id} label={role.name} size="small" sx={{ mr: 0.5 }} />
                      ))}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        size="small"
                        color={user.status === "ACTIVE" ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {user.status !== "DISABLED" && (
                        <Button
                          size="small"
                          color="error"
                          onClick={() => deactivateMutation.mutate(user.id)}
                          disabled={deactivateMutation.isPending}
                        >
                          Deactivate
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {users?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      No users yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <CreateUserDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  );
}
