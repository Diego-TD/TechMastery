import type { LifeArea } from "@shared/enums";
import type {
  Account,
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
  | { id: string; kind: "recovery"; label: string };

/**
 * Three relationships, kept deliberately few so the legend reads at a glance:
 * - runs_on:    account ⇒ device it's used on
 * - recovers:   account ⇒ the email/phone that recovers it
 * - depends_on: account ⇒ another account it needs (social login or other)
 */
export type GraphEdgeKind = "runs_on" | "recovers" | "depends_on";

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  kind: GraphEdgeKind;
};

export type GraphModel = { nodes: GraphNode[]; edges: GraphEdge[] };

const phoneNodeId = (num: string) => `rec_phone_${num.replace(/\D/g, "")}`;

/**
 * Build the full dependency graph from the map. When `lifeArea` is set, only
 * accounts in that area are kept — but their connected devices, recovery
 * anchors, and depended-on accounts stay visible, since the point of the map
 * is to see cross-area dependencies.
 */
export function buildGraph(data: MapData, lifeArea?: LifeArea): GraphModel {
  const accountsById = new Map(data.accounts.map((a) => [a.id, a]));
  const devicesById = new Map(data.devices.map((d) => [d.id, d]));

  const rootAccounts =
    lifeArea === undefined
      ? data.accounts
      : data.accounts.filter((a) => a.lifeArea === lifeArea);

  const nodes = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];

  const ensureAccount = (id: string) => {
    const acc = accountsById.get(id);
    if (acc && !nodes.has(id)) nodes.set(id, { id, kind: "account", account: acc });
  };
  const ensureDevice = (id: string) => {
    const dev = devicesById.get(id);
    if (dev && !nodes.has(id)) nodes.set(id, { id, kind: "device", device: dev });
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
      if (devicesById.has(deviceId)) {
        edges.push({
          id: `${acc.id}-runs_on-${deviceId}`,
          source: acc.id,
          target: deviceId,
          kind: "runs_on",
        });
      }
    }

    if (acc.socialLoginAccountId) {
      ensureAccount(acc.socialLoginAccountId);
      edges.push({
        id: `${acc.id}-depends_on-${acc.socialLoginAccountId}`,
        source: acc.id,
        target: acc.socialLoginAccountId,
        kind: "depends_on",
      });
    }

    if (acc.recoveryEmailAccountId && acc.recoveryEmailAccountId !== acc.id) {
      ensureAccount(acc.recoveryEmailAccountId);
      edges.push({
        id: `${acc.id}-recovers-${acc.recoveryEmailAccountId}`,
        source: acc.id,
        target: acc.recoveryEmailAccountId,
        kind: "recovers",
      });
    }

    if (acc.recoveryPhoneNumber) {
      const pid = ensurePhone(acc.recoveryPhoneNumber);
      edges.push({
        id: `${acc.id}-recovers-${pid}`,
        source: acc.id,
        target: pid,
        kind: "recovers",
      });
    }

    for (const depId of acc.dependsOnAccountIds) {
      ensureAccount(depId);
      if (accountsById.has(depId)) {
        edges.push({
          id: `${acc.id}-depends_on-${depId}`,
          source: acc.id,
          target: depId,
          kind: "depends_on",
        });
      }
    }
  }

  return { nodes: [...nodes.values()], edges };
}

// ---------------------------------------------------------------------------
// Readiness scoring (transparent heuristics — every score names its weak items)
// ---------------------------------------------------------------------------

const isUnknown = (v: string) => v === "unknown";
const hasTwoFactor = (a: Account) =>
  a.twoFactor !== "none" && a.twoFactor !== "unknown";
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
    if (a.recoveryEmailAccountId) add(a.recoveryEmailAccountId, a.id);
    if (a.socialLoginAccountId) add(a.socialLoginAccountId, a.id);
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
  const highImportance = accounts.filter((a) => a.importance === "high");

  const protectionWeak = important.filter((a) => !hasTwoFactor(a)).map((a) => a.id);
  const recoveryWeak = accounts
    .filter((a) => a.recovery === "none" || isUnknown(a.recovery))
    .map((a) => a.id);
  const deviceWeak = devices
    .filter((d) => d.lock === "none" || d.lock === "unknown" || !d.findMyEnabled)
    .map((d) => d.id);
  const backupWeak = highImportance.filter((a) => !a.hasBackupCodes).map((a) => a.id);

  const hub = topHub(accounts);
  const hubFan = hub ? hub.dependents.length : 0;

  const unknownWeak = accounts
    .filter(
      (a) => isUnknown(a.authMethod) || isUnknown(a.twoFactor) || isUnknown(a.recovery),
    )
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
      score: clamp(pct(highImportance.length - backupWeak.length, highImportance.length)),
      weakItemIds: backupWeak,
    },
    {
      key: "dependency_visibility",
      // The more accounts funnel through one hub, the lower the score.
      score: clamp(100 - Math.max(0, hubFan - 1) * 14),
      weakItemIds: hub && hubFan > 2 ? hub.dependents : [],
    },
    {
      key: "unresolved_unknowns",
      score: clamp(pct(accounts.length - unknownWeak.length, accounts.length)),
      weakItemIds: unknownWeak,
    },
  ];

  const overall = clamp(
    categories.reduce((sum, c) => sum + c.score, 0) / categories.length,
  );

  // Build a bounded, severity-sorted action list from the weak items.
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
  for (const id of recoveryWeak) {
    actions.push({ id: `add_recovery-${id}`, kind: "add_recovery", targetId: id, severity: "high" });
  }
  for (const id of backupWeak) {
    actions.push({
      id: `save_backup_codes-${id}`,
      kind: "save_backup_codes",
      targetId: id,
      severity: "medium",
    });
  }
  if (hub && hubFan > 2) {
    actions.push({
      id: `reduce_google_dependency-${hub.id}`,
      kind: "reduce_google_dependency",
      targetId: hub.id,
      severity: "medium",
    });
  }
  for (const id of deviceWeak) {
    actions.push({ id: `set_device_lock-${id}`, kind: "set_device_lock", targetId: id, severity: "medium" });
  }
  for (const id of unknownWeak) {
    actions.push({ id: `resolve_unknown-${id}`, kind: "resolve_unknown", targetId: id, severity: "low" });
  }

  const order = { high: 0, medium: 1, low: 2 } as const;
  actions.sort((a, b) => order[a.severity] - order[b.severity]);

  return { score: overall, categories, actions };
}

// ---------------------------------------------------------------------------
// Simulations — "what breaks if…"
// ---------------------------------------------------------------------------

export function runSimulation(data: MapData, kind: SimulationKind): SimulationResult {
  const { accounts, devices } = data;
  const impacts: SimulationImpact[] = [];
  const push = (i: SimulationImpact) => impacts.push(i);

  const deviceKindOf = (id: string) => devices.find((d) => d.id === id)?.kind;
  const usesDeviceKind = (a: Account, kinds: string[]) =>
    a.deviceIds.some((id) => kinds.includes(deviceKindOf(id) ?? ""));
  const hub = topHub(accounts);

  switch (kind) {
    case "lose_phone": {
      for (const a of accounts) {
        const onPhone = usesDeviceKind(a, ["phone"]);
        const smsOrApp = a.twoFactor === "sms" || a.twoFactor === "authenticator_app";
        const phoneRecovery = Boolean(a.recoveryPhoneNumber);
        if (!onPhone && !smsOrApp && !phoneRecovery) continue;
        const blocked = smsOrApp && !a.hasBackupCodes;
        push({
          accountId: a.id,
          reason: smsOrApp ? "recovery_phone" : phoneRecovery ? "recovery_phone" : "lives_on",
          severity: blocked ? "blocked" : "at_risk",
        });
      }
      break;
    }
    case "laptop_dies": {
      const onLaptop = (loc?: string) =>
        /laptop|macbook|notebook|computer|usb/i.test(loc ?? "");
      for (const a of accounts) {
        const keyFileTrapped = a.keyFile && onLaptop(a.keyFile.location);
        if (!usesDeviceKind(a, ["laptop", "desktop"]) && !keyFileTrapped) continue;
        push({
          accountId: a.id,
          // A key file (e.g. e.firma) only on the laptop is the sharpest loss.
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
        } else if (a.recoveryEmailAccountId === hubId) {
          push({ accountId: a.id, reason: "recovery_email", severity: "at_risk" });
        }
      }
      break;
    }
    case "card_stolen": {
      for (const a of accounts) {
        if (a.lifeArea === "banking") push({ accountId: a.id, reason: "lives_on", severity: "at_risk" });
        else if (a.lifeArea === "shopping")
          push({ accountId: a.id, reason: "lives_on", severity: "ok" });
      }
      break;
    }
    case "cloud_unavailable": {
      for (const a of accounts) {
        if (a.lifeArea === "cloud")
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
        if (manager && a.authMethod === "password") {
          push({
            accountId: a.id,
            reason: "stored_here",
            severity: a.recovery === "none" || a.recovery === "unknown" ? "blocked" : "at_risk",
          });
        }
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
