import type { CurrentUserState } from "@/hooks/useCurrentUser";

export type SessionState = CurrentUserState["state"];

/** The canonical entry path for each session state. */
export const HOME_FOR_STATE: Record<
  Exclude<SessionState, "loading">,
  string
> = {
  signedOut: "/",
  needsOnboarding: "/onboarding",
  onboarded: "/app",
};

type Zone = "public" | "onboarding" | "app" | "unknown";

function zoneForPath(pathname: string): Zone {
  if (pathname === "/") return "public";
  if (pathname === "/onboarding" || pathname.startsWith("/onboarding/")) {
    return "onboarding";
  }
  if (pathname === "/app" || pathname.startsWith("/app/")) return "app";
  return "unknown";
}

/** Which zone a given session state is allowed to occupy. */
const ALLOWED_ZONE: Record<Exclude<SessionState, "loading">, Zone> = {
  signedOut: "public",
  needsOnboarding: "onboarding",
  onboarded: "app",
};

/**
 * The single source of truth for auth/onboarding redirects.
 *
 * Returns the path to redirect to, or `null` to stay on the current route.
 * Unknown paths always return `null` so the 404 route can render for any state.
 * `loading` never redirects (callers render a loader instead).
 */
export function resolveRedirect(
  state: SessionState,
  pathname: string,
): string | null {
  if (state === "loading") return null;

  const zone = zoneForPath(pathname);
  if (zone === "unknown") return null;
  if (zone === ALLOWED_ZONE[state]) return null;

  return HOME_FOR_STATE[state];
}
