import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/DashboardOutlined";
import PeopleIcon from "@mui/icons-material/PeopleOutlined";
import BusinessIcon from "@mui/icons-material/BusinessOutlined";
import SecurityIcon from "@mui/icons-material/SecurityOutlined";
import DescriptionIcon from "@mui/icons-material/DescriptionOutlined";
import FactCheckIcon from "@mui/icons-material/FactCheckOutlined";
import SyncIcon from "@mui/icons-material/SyncOutlined";
import { useAuthState } from "../../stores/authStore";
import { useLogout } from "../../features/auth/hooks/useLogout";
import { OfflineBanner } from "../../features/sync/components/OfflineBanner";

const DRAWER_WIDTH = 220;

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: <DashboardIcon /> },
  { to: "/inspections", label: "Inspections", icon: <FactCheckIcon /> },
  { to: "/sync", label: "Sync Center", icon: <SyncIcon /> },
  { to: "/sites", label: "Sites", icon: <BusinessIcon /> },
  { to: "/templates", label: "Templates", icon: <DescriptionIcon /> },
  { to: "/users", label: "Team", icon: <PeopleIcon /> },
  { to: "/roles", label: "Roles & Permissions", icon: <SecurityIcon /> },
];

export function AppLayout() {
  const { user } = useAuthState();
  const logoutMutation = useLogout();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate("/login", { replace: true });
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed" color="default" elevation={1} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            FieldPulse
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }} color="text.secondary">
            {user?.firstName} {user?.lastName}
          </Typography>
          <Button onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: "border-box" },
        }}
      >
        <Toolbar />
        <List>
          {NAV_ITEMS.map((item) => (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              sx={{
                "&.active": { bgcolor: "action.selected" },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Toolbar />
        <OfflineBanner />
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
