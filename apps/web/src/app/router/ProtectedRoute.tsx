import { Navigate } from "react-router-dom";
import { useAuthState } from "../../stores/authStore";
import { AppLayout } from "../layouts/AppLayout";

export function ProtectedRoute() {
  const { status } = useAuthState();

  if (status !== "authenticated") {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout />;
}
