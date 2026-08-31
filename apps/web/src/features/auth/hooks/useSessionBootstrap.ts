import { useEffect, useState } from "react";
import { refreshSession } from "../api/authApi";
import { setAuthenticatedUser, clearAuth } from "../../../stores/authStore";

// On first load the access token only lives in memory, so a page refresh
// needs to silently redeem the httpOnly refresh cookie to restore the session.
export function useSessionBootstrap() {
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let cancelled = false;

    refreshSession()
      .then((data) => {
        if (!cancelled) setAuthenticatedUser(data.user, data.accessToken);
      })
      .catch(() => {
        if (!cancelled) clearAuth();
      })
      .finally(() => {
        if (!cancelled) setIsBootstrapping(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return isBootstrapping;
}
