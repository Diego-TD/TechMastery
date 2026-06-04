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

const phoneNodeId = (num: string) => `rec_phone_${num.replace(/\D/g, "")}`;

export function buildGraph(data: MapData, lifeArea?: LifeArea): GraphModel {
  const accountsById = new Map(data.accounts.map((a) => [a.id, a]));
  const devicesById = new Map(data.devices.map((d) => [d.id, d]));
  const appsById = new Map(data.authenticatorApps.map((a) => [a.id, a]));

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
  const ensurePhone = (num: string) => {
    const id = phoneNodeId(num);
    if (!nodes.has(id)) nodes.set(id, { id, kind: "recovery", label: num });
    return id;
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
      } else if (r.type === "phone" && r.value) {
        pushEdge(acc.id, ensurePhone(r.value), "recovers");
      }
    }
  }

  return { nodes: [...nodes.values()], edges };
}

// ---------------------------------------------------------------------------
// Readiness scoring (transparent heuristics — every score names its weak items)
// ---------------------------------------------------------------------------

const isUnknown = (v: string) => v === "unknown";
const REAL_MFA = ["sms", "authenticator_app", "security_key"] as const;
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

function topHub(accounts: Account[]): { id: string; dependents: string[] } | null {
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
  const deviceWeak = devices
    .filter((d) => d.lock === "none" || d.lock === "unknown" || !d.findMyEnabled)
    .map((d) => d.id);
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

export function runSimulation(data: MapData, kind: SimulationKind): SimulationResult {
  const { accounts, devices, authenticatorApps } = data;
  const impacts: SimulationImpact[] = [];
  const push = (i: SimulationImpact) => impacts.push(i);

  const deviceKindOf = (id: string) => devices.find((d) => d.id === id)?.kind;
  const usesDeviceKind = (a: Account, kinds: string[]) =>
    a.deviceIds.some((id) => kinds.includes(deviceKindOf(id) ?? ""));
  const appById = (id?: string) => authenticatorApps.find((x) => x.id === id);
  const phoneDeviceIds = new Set(devices.filter((d) => d.kind === "phone").map((d) => d.id));
  /** A recovery path that doesn't route through the same phone. */
  const hasAltEmailRecovery = (a: Account) =>
    a.recoveryOptions.some((r) => r.type === "email" && r.targetAccountId);
  const hub = topHub(accounts);

  switch (kind) {
    case "lose_phone": {
      for (const a of accounts) {
        const app = appById(a.authenticatorAppId);
        const authOnPhone = Boolean(app?.deviceId && phoneDeviceIds.has(app.deviceId));
        const smsOnPhone = a.mfaMethods.includes("sms");
        const phoneRecovery = a.recoveryOptions.some((r) => r.type === "phone");
        if (!authOnPhone && !smsOnPhone && !phoneRecovery && !usesDeviceKind(a, ["phone"])) continue;

        const codeLocked = authOnPhone || smsOnPhone; // 2FA prompt you can't answer
        const rescued = a.hasBackupCodes || hasAltEmailRecovery(a);
        push({
          accountId: a.id,
          reason: authOnPhone ? "authenticator" : phoneRecovery || smsOnPhone ? "recovery_phone" : "lives_on",
          severity: codeLocked ? (rescued ? "at_risk" : "blocked") : "at_risk",
        });
      }
      break;
    }
    case "laptop_dies": {
      const onLaptop = (loc?: string) => /laptop|macbook|notebook|computer|usb/i.test(loc ?? "");
      for (const a of accounts) {
        const keyFileTrapped = a.keyFile && onLaptop(a.keyFile.location);
        if (!usesDeviceKind(a, ["laptop", "desktop"]) && !keyFileTrapped) continue;
        push({
          accountId: a.id,
          reason: keyFileTrapped ? "stored_here" : "lives_on",
          severity: keyFileTrapped ? "blocked" : a.importance === "high" ? "at_risk" : "ok",
        });
      }
      break;
    }
    case "email_locked": {
      const hubId = hub?.id;
      for (const a of accounts) {
        if (a.id === hubId) {
          push({ accountId: a.id, reason: "lives_on", severity: "blocked" });
          continue;
        }
        if (a.socialLoginAccountId === hubId) {
          push({ accountId: a.id, reason: "social_login", severity: "blocked" });
        } else if (a.recoveryOptions.some((r) => r.type === "email" && r.targetAccountId === hubId)) {
          push({ accountId: a.id, reason: "recovery_email", severity: "at_risk" });
        }
      }
      break;
    }
    case "card_stolen": {
      // A stolen card is mostly a re-issue: payments pause, accounts survive.
      for (const a of accounts) {
        if (a.lifeArea === "banking") push({ accountId: a.id, reason: "lives_on", severity: "at_risk" });
        else if (a.lifeArea === "shopping") push({ accountId: a.id, reason: "stored_here", severity: "ok" });
      }
      break;
    }
    case "cloud_unavailable": {
      for (const a of accounts) {
        if (a.lifeArea === "cloud" && !a.isPasswordManager)
          push({ accountId: a.id, reason: "lives_on", severity: a.importance === "high" ? "blocked" : "at_risk" });
        else if (
          /cloud|drive|icloud/i.test(a.backupCodesLocation ?? "") ||
          /cloud|drive|icloud/i.test(a.keyFile?.location ?? "")
        )
          push({ accountId: a.id, reason: "stored_here", severity: "at_risk" });
      }
      break;
    }
    case "password_manager_unavailable": {
      const manager = accounts.find((a) => a.isPasswordManager);
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
          reason: "stored_here",
          severity: hasRecovery(a) ? "at_risk" : "blocked",
        });
      }
      break;
    }
  }

  return {
    kind,
    impacts,
    blockedCount: impacts.filter((i) => i.severity === "blocked").length,
    atRiskCount: impacts.filter((i) => i.severity === "at_risk").length,
  };
}
