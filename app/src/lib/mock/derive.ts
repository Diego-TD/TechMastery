import type { LifeArea } from "@shared/enums";
import type {
  Account,
  AuthenticatorApp,
  Device,
  MapData,
  Readiness,
  ReadinessCategory,
  RecommendedAction,
  SimulationImpact,
  SimulationKind,
  SimulationResult,
} from "./types";

// ---------------------------------------------------------------------------
// Graph model (framework-neutral; the map feature turns this into React Flow)
// ---------------------------------------------------------------------------

export type GraphNode =
  | { id: string; kind: "account"; account: Account }
  | { id: string; kind: "device"; device: Device }
  | { id: string; kind: "authenticator"; app: AuthenticatorApp }
  | { id: string; kind: "recovery"; label: string };

/** Three relationships only — see the legend. */
export type GraphEdgeKind = "runs_on" | "recovers" | "depends_on";

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  kind: GraphEdgeKind;
};

export type GraphModel = { nodes: GraphNode[]; edges: GraphEdge[] };

export function buildGraph(data: MapData, lifeArea?: LifeArea): GraphModel {
  const accountsById = new Map(data.accounts.map((a) => [a.id, a]));
  const devicesById = new Map(data.devices.map((d) => [d.id, d]));
  const appsById = new Map(data.authenticatorApps.map((a) => [a.id, a]));
  const phonesById = new Map(data.phoneNumbers.map((p) => [p.id, p]));

  const rootAccounts =
    lifeArea === undefined
      ? data.accounts
      : data.accounts.filter((a) => a.lifeArea === lifeArea);

  const nodes = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];
  const pushEdge = (source: string, target: string, kind: GraphEdgeKind) =>
    edges.push({ id: `${source}-${kind}-${target}`, source, target, kind });

  const ensureAccount = (id: string) => {
    const acc = accountsById.get(id);
    if (acc && !nodes.has(id)) nodes.set(id, { id, kind: "account", account: acc });
  };
  const ensureDevice = (id: string) => {
    const dev = devicesById.get(id);
    if (dev && !nodes.has(id)) nodes.set(id, { id, kind: "device", device: dev });
  };
  const ensureApp = (id: string) => {
    const app = appsById.get(id);
    if (app && !nodes.has(id)) {
      nodes.set(id, { id, kind: "authenticator", app });
      if (app.deviceId) {
        ensureDevice(app.deviceId);
        if (devicesById.has(app.deviceId)) pushEdge(id, app.deviceId, "runs_on");
      }
    }
  };
  const ensurePhone = (phoneId: string) => {
    const phone = phonesById.get(phoneId);
    if (phone && !nodes.has(phoneId)) {
      nodes.set(phoneId, { id: phoneId, kind: "recovery", label: phone.label });
    }
    return phoneId;
  };

  for (const acc of rootAccounts) {
    ensureAccount(acc.id);

    for (const deviceId of acc.deviceIds) {
      ensureDevice(deviceId);
      if (devicesById.has(deviceId)) pushEdge(acc.id, deviceId, "runs_on");
    }

    if (acc.socialLoginAccountId) {
      ensureAccount(acc.socialLoginAccountId);
      pushEdge(acc.id, acc.socialLoginAccountId, "depends_on");
    }

    if (acc.authenticatorAppId) {
      ensureApp(acc.authenticatorAppId);
      if (appsById.has(acc.authenticatorAppId)) pushEdge(acc.id, acc.authenticatorAppId, "depends_on");
    }

    for (const r of acc.recoveryOptions) {
      if (r.type === "email" && r.targetAccountId && r.targetAccountId !== acc.id) {
        ensureAccount(r.targetAccountId);
        pushEdge(acc.id, r.targetAccountId, "recovers");
      } else if (r.type === "phone" && r.phoneId && phonesById.has(r.phoneId)) {
        pushEdge(acc.id, ensurePhone(r.phoneId), "recovers");
      }
    }
  }

  return { nodes: [...nodes.values()], edges };
}

// ---------------------------------------------------------------------------
// Readiness scoring (transparent heuristics — every score names its weak items)
// ---------------------------------------------------------------------------

const isUnknown = (v: string) => v === "unknown";
const REAL_MFA = ["sms", "email", "authenticator_app", "security_key"] as const;
const hasTwoFactor = (a: Account) => a.mfaMethods.some((m) => (REAL_MFA as readonly string[]).includes(m));
const mfaUnknown = (a: Account) => a.mfaMethods.length === 0 || a.mfaMethods.includes("unknown");
/** Accounts whose MFA issues backup codes (app / security key) — only these can "save backup codes". */
const backupRelevant = (a: Account) =>
  a.mfaMethods.includes("authenticator_app") || a.mfaMethods.includes("security_key");
const hasRecovery = (a: Account) => a.recoveryOptions.length > 0;
const matters = (a: Account) => a.importance === "high" || a.importance === "medium";
const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const pct = (good: number, total: number) => (total === 0 ? 100 : (good / total) * 100);

/** How many accounts lean on each account as a recovery email / social login. */
export function dependencyFanIn(accounts: Account[]): Map<string, string[]> {
  const fan = new Map<string, string[]>();
  const add = (hubId: string, dependentId: string) => {
    const list = fan.get(hubId) ?? [];
    list.push(dependentId);
    fan.set(hubId, list);
  };
  for (const a of accounts) {
    if (a.socialLoginAccountId) add(a.socialLoginAccountId, a.id);
    for (const r of a.recoveryOptions) {
      if (r.type === "email" && r.targetAccountId) add(r.targetAccountId, a.id);
    }
  }
  return fan;
}

/** Accounts that rely on an authenticator app (blocks deletion). */
export function authenticatorAppUsage(accounts: Account[], appId: string): Account[] {
  return accounts.filter((a) => a.authenticatorAppId === appId);
}

/** Accounts that rely on a phone number, as identifier or recovery (blocks deletion). */
export function phoneUsage(accounts: Account[], phoneId: string): Account[] {
  return accounts.filter(
    (a) => a.identifierPhoneId === phoneId || a.recoveryOptions.some((r) => r.phoneId === phoneId),
  );
}

export function topHub(accounts: Account[]): { id: string; dependents: string[] } | null {
  let best: { id: string; dependents: string[] } | null = null;
  for (const [id, dependents] of dependencyFanIn(accounts)) {
    if (!best || dependents.length > best.dependents.length) best = { id, dependents };
  }
  return best;
}

export function computeReadiness(data: MapData): Readiness {
  const { accounts, devices } = data;
  const important = accounts.filter(matters);

  const protectionWeak = important.filter((a) => !hasTwoFactor(a)).map((a) => a.id);
  const recoveryWeak = accounts.filter((a) => !hasRecovery(a)).map((a) => a.id);
  const deviceLocked = (d: Device) =>
    d.lockMethods.some((m) => m !== "none" && m !== "unknown");
  const deviceWeak = devices.filter((d) => !deviceLocked(d) || !d.findMyEnabled).map((d) => d.id);
  // Only suggest backup codes where they actually exist (app/key MFA).
  const backupCandidates = accounts.filter(backupRelevant);
  const backupWeak = backupCandidates.filter((a) => !a.hasBackupCodes).map((a) => a.id);

  const hub = topHub(accounts);
  const hubFan = hub ? hub.dependents.length : 0;

  const unknownWeak = accounts
    .filter((a) => isUnknown(a.identifierType) || a.loginMethods.length === 0 || mfaUnknown(a))
    .map((a) => a.id);

  const categories: ReadinessCategory[] = [
    {
      key: "account_protection",
      score: clamp(pct(important.length - protectionWeak.length, important.length)),
      weakItemIds: protectionWeak,
    },
    {
      key: "recovery_clarity",
      score: clamp(pct(accounts.length - recoveryWeak.length, accounts.length)),
      weakItemIds: recoveryWeak,
    },
    {
      key: "device_continuity",
      score: clamp(pct(devices.length - deviceWeak.length, devices.length)),
      weakItemIds: deviceWeak,
    },
    {
      key: "backup_awareness",
      score: clamp(pct(backupCandidates.length - backupWeak.length, backupCandidates.length)),
      weakItemIds: backupWeak,
    },
    {
      key: "dependency_visibility",
      score: clamp(100 - Math.max(0, hubFan - 1) * 14),
      weakItemIds: hub && hubFan > 3 ? hub.dependents : [],
    },
    {
      key: "unresolved_unknowns",
      score: clamp(pct(accounts.length - unknownWeak.length, accounts.length)),
      weakItemIds: unknownWeak,
    },
  ];

  const overall = clamp(categories.reduce((sum, c) => sum + c.score, 0) / categories.length);

  const actions: RecommendedAction[] = [];
  for (const id of protectionWeak) {
    const a = accounts.find((x) => x.id === id)!;
    actions.push({
      id: `enable_2fa-${id}`,
      kind: "enable_2fa",
      targetId: id,
      severity: a.importance === "high" ? "high" : "medium",
    });
  }
  for (const id of recoveryWeak)
    actions.push({ id: `add_recovery-${id}`, kind: "add_recovery", targetId: id, severity: "high" });
  for (const id of backupWeak)
    actions.push({ id: `save_backup_codes-${id}`, kind: "save_backup_codes", targetId: id, severity: "medium" });
  if (hub && hubFan > 3)
    actions.push({ id: `reduce_google_dependency-${hub.id}`, kind: "reduce_google_dependency", targetId: hub.id, severity: "low" });
  for (const id of deviceWeak)
    actions.push({ id: `set_device_lock-${id}`, kind: "set_device_lock", targetId: id, severity: "medium" });
  for (const id of unknownWeak)
    actions.push({ id: `resolve_unknown-${id}`, kind: "resolve_unknown", targetId: id, severity: "low" });

  const order = { high: 0, medium: 1, low: 2 } as const;
  actions.sort((a, b) => order[a.severity] - order[b.severity]);

  return { score: overall, categories, actions };
}

// ---------------------------------------------------------------------------
// Simulations — "what breaks if…"
// ---------------------------------------------------------------------------

export function runSimulation(
  data: MapData,
  kind: SimulationKind,
  targetId?: string,
): SimulationResult {
  const { accounts, devices, authenticatorApps, phoneNumbers } = data;
  const impacts = new Map<string, SimulationImpact>();
  const severityOrder: Record<SimulationImpact["severity"], number> = { blocked: 0, at_risk: 1, ok: 2 };
  const push = (i: SimulationImpact) => {
    const existing = impacts.get(i.accountId);
    if (!existing || severityOrder[i.severity] < severityOrder[existing.severity]) {
      impacts.set(i.accountId, i);
    }
  };

  const appById = (id?: string) => authenticatorApps.find((x) => x.id === id);
  const hasAlternateRecovery = (a: Account, unavailablePhoneId?: string) =>
    a.recoveryOptions.some((r) => {
      if (r.type === "none" || r.type === "unknown") return false;
      if (unavailablePhoneId && r.type === "phone" && r.phoneId === unavailablePhoneId) return false;
      return true;
    });
  const hasEmailRecovery = (a: Account, unavailableAccountId?: string) =>
    a.recoveryOptions.some(
      (r) => r.type === "email" && r.targetAccountId && r.targetAccountId !== unavailableAccountId,
    );
  const onlyRealMfa = (a: Account, method: string) => {
    const realMethods = a.mfaMethods.filter((m) => m !== "none" && m !== "unknown");
    return realMethods.length === 1 && realMethods[0] === method;
  };
  const locationMentionsDevice = (location: string | undefined, deviceId: string) => {
    const device = devices.find((d) => d.id === deviceId);
    if (!device || !location) return false;
    const haystack = location.toLowerCase();
    const nameParts = device.name.toLowerCase().split(/\W+/).filter((part) => part.length >= 4);
    return haystack.includes(device.kind) || nameParts.some((part) => haystack.includes(part));
  };
  const hub = topHub(accounts);

  switch (kind) {
    case "lose_device": {
      const deviceId = targetId ?? devices[0]?.id;
      if (!deviceId) break;
      for (const a of accounts) {
        const app = appById(a.authenticatorAppId);
        const authOnDevice = a.mfaMethods.includes("authenticator_app") && app?.deviceId === deviceId;
        const onlyAuthOnDevice = authOnDevice && onlyRealMfa(a, "authenticator_app");
        const usesDevice = a.deviceIds.includes(deviceId);
        const keyFileStoredHere = Boolean(a.keyFile && locationMentionsDevice(a.keyFile.location, deviceId));

        if (keyFileStoredHere) {
          push({ accountId: a.id, reason: "stored_here", severity: "blocked" });
        }
        if (authOnDevice) {
          const rescued = a.hasBackupCodes || hasAlternateRecovery(a);
          push({
            accountId: a.id,
            reason: "authenticator",
            severity: onlyAuthOnDevice && !rescued ? "blocked" : "at_risk",
          });
        } else if (usesDevice) {
          push({ accountId: a.id, reason: "lives_on", severity: "at_risk" });
        }
      }
      break;
    }
    case "lose_phone_number": {
      const phoneId = targetId ?? phoneNumbers[0]?.id;
      if (!phoneId) break;
      for (const a of accounts) {
        const usesAsIdentifier = a.identifierPhoneId === phoneId;
        const phoneRecovery = a.recoveryOptions.some((r) => r.type === "phone" && r.phoneId === phoneId);
        const smsLinkedToPhone = a.mfaMethods.includes("sms") && (usesAsIdentifier || phoneRecovery);
        if (!usesAsIdentifier && !phoneRecovery && !smsLinkedToPhone) continue;

        const hasFallback = a.hasBackupCodes || hasEmailRecovery(a) || hasAlternateRecovery(a, phoneId);
        const blocksPrimaryPath = smsLinkedToPhone || (phoneRecovery && !hasFallback);
        push({
          accountId: a.id,
          reason: smsLinkedToPhone || phoneRecovery ? "recovery_phone" : "identifier_phone",
          severity: blocksPrimaryPath && !hasFallback ? "blocked" : "at_risk",
        });
      }
      break;
    }
    case "email_locked": {
      const hubId = targetId ?? hub?.id;
      for (const a of accounts) {
        if (a.id === hubId) {
          push({ accountId: a.id, reason: "lives_on", severity: "blocked" });
          continue;
        }
        if (a.socialLoginAccountId === hubId) {
          push({ accountId: a.id, reason: "social_login", severity: "blocked" });
        } else if (a.identifierAccountId === hubId) {
          push({ accountId: a.id, reason: "recovery_email", severity: "blocked" });
        } else if (a.recoveryOptions.some((r) => r.type === "email" && r.targetAccountId === hubId)) {
          push({ accountId: a.id, reason: "recovery_email", severity: "at_risk" });
        }
      }
      break;
    }
    case "card_stolen": {
      // A stolen card is mostly a re-issue: payments pause, accounts survive.
      for (const a of accounts) {
        if (a.lifeArea === "banking") push({ accountId: a.id, reason: "payment_reissue", severity: "at_risk" });
        else if (a.lifeArea === "shopping")
          push({ accountId: a.id, reason: "payment_reissue", severity: "ok" });
      }
      break;
    }
    case "password_manager_unavailable": {
      const manager = accounts.find((a) => a.id === targetId) ?? accounts.find((a) => a.isPasswordManager);
      for (const a of accounts) {
        if (a.isPasswordManager) {
          push({ accountId: a.id, reason: "lives_on", severity: "blocked" });
          continue;
        }
        if (!manager || !a.loginMethods.includes("password")) continue;
        // A passkey or social sign-in means you don't need the stored password.
        const hasAlternative = a.loginMethods.includes("passkey") || a.loginMethods.includes("social");
        if (hasAlternative) continue;
        push({
          accountId: a.id,
          reason: "password_only",
          severity: hasRecovery(a) ? "at_risk" : "blocked",
        });
      }
      break;
    }
  }

  const impactList = [...impacts.values()];

  return {
    kind,
    targetId,
    impacts: impactList,
    blockedCount: impactList.filter((i) => i.severity === "blocked").length,
    atRiskCount: impactList.filter((i) => i.severity === "at_risk").length,
  };
}
