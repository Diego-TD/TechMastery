import { useAuth } from "@clerk/clerk-react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";

export type CurrentUserState =
  | { state: "loading"; user: undefined }
  | { state: "signedOut"; user: undefined }
  | { state: "needsOnboarding"; user: Doc<"users"> }
  | { state: "onboarded"; user: Doc<"users"> };

export function useCurrentUser(): CurrentUserState & { isLoading: boolean } {
  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth();
  const { sessionId, userId } = useAuth();
  const ensureUser = useMutation(api.users.ensureUser);

  const ensureKey =
    isAuthenticated && userId ? `${userId}:${sessionId ?? "no-session"}` : null;
  const [ensuredKey, setEnsuredKey] = useState<string | null>(null);
  const ensureInFlightKeyRef = useRef<string | null>(null);
  const hasEnsuredUser = ensureKey !== null && ensuredKey === ensureKey;

  useEffect(() => {
    if (isAuthLoading) return;
    if (!ensureKey) return;
    if (hasEnsuredUser || ensureInFlightKeyRef.current === ensureKey) return;

    let isActive = true;
    ensureInFlightKeyRef.current = ensureKey;
    void ensureUser({})
      .then(() => {
        if (isActive) setEnsuredKey(ensureKey);
      })
      .finally(() => {
        if (ensureInFlightKeyRef.current === ensureKey) {
          ensureInFlightKeyRef.current = null;
        }
      });

    return () => {
      isActive = false;
    };
  }, [ensureKey, ensureUser, hasEnsuredUser, isAuthLoading]);

  const user = useQuery(
    api.users.me,
    isAuthenticated && hasEnsuredUser ? {} : "skip",
  );

  if (isAuthLoading) {
    return { state: "loading", isLoading: true, user: undefined };
  }

  if (!isAuthenticated) {
    return { state: "signedOut", isLoading: false, user: undefined };
  }

  if (!hasEnsuredUser || user === undefined) {
    return { state: "loading", isLoading: true, user: undefined };
  }

  if (user.status === "NEEDS_ONBOARDING") {
    return {
      state: "needsOnboarding",
      isLoading: false,
      user,
    };
  }

  return {
    state: "onboarded",
    isLoading: false,
    user,
  };
}
