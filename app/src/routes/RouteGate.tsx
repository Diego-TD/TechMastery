import { Navigate, Outlet, useLocation } from "react-router";
import { FullPageLoader } from "@/components/FullPageLoader";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { resolveRedirect } from "@/lib/routeGate";

/**
 * Root layout that centralizes every auth/onboarding redirect.
 *
 * All routes are nested under this element, so the gate runs on every
 * navigation. Nested screens must NOT add their own auth redirects.
 */
export function RouteGate() {
  const { state } = useCurrentUser();
  const { pathname } = useLocation();

  if (state === "loading") {
    return <FullPageLoader />;
  }

  const redirectTo = resolveRedirect(state, pathname);
  if (redirectTo !== null) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}

export default RouteGate;
