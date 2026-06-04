import type {
  AuthMethodType,
  DeviceKind,
  LifeArea,
  RecoveryMethodType,
  TwoFactorStatus,
} from "@shared/enums";

/** User-flagged importance — drives which risks the app surfaces first. */
export type Importance = "high" | "medium" | "low";

/**
 * An account the user maps. Holds metadata only — never secrets, passwords, or
 * recovery codes (see CLAUDE.md data boundaries). Relations are stored as id
 * references so the map can derive nodes + edges from this shape directly.
 */
export type Account = {
  id: string;
  name: string;
  provider?: string;
  lifeArea: LifeArea;
  importance: Importance;
  authMethod: AuthMethodType;
  twoFactor: TwoFactorStatus;
  recovery: RecoveryMethodType;
  /** Devices this account is actively used on. */
  deviceIds: string[];
  /** Account whose email recovers this one (e.g. "recover via my Gmail"). */
  recoveryEmailAccountId?: string;
  /** Masked phone number used for recovery / SMS codes. */
  recoveryPhoneNumber?: string;
  /** When `authMethod === "social_login"`, the account you sign in *with*. */
  socialLoginAccountId?: string;
  /** Other accounts this one structurally depends on. */
  dependsOnAccountIds: string[];
  /** Whether backup/recovery codes exist, and (non-secret) where they live. */
  hasBackupCodes: boolean;
  backupCodesLocation?: string;
  /**
   * A credential that lives as a *file*, not a password — e.g. the SAT e.firma
   * (.cer/.key), an SSH key, a recovery kit. We store only its label and where
   * it's kept (non-secret), never the file or any identifier like the RFC.
   */
  keyFile?: { label: string; location?: string };
  /** True for a password manager — used by the "manager unavailable" sim. */
  isPasswordManager?: boolean;
  notes?: string;
};

export type DeviceLock = "biometric" | "pin" | "password" | "none" | "unknown";

export type Device = {
  id: string;
  name: string;
  kind: DeviceKind;
  lock: DeviceLock;
  findMyEnabled: boolean;
  notes?: string;
};

export type MapData = {
  accounts: Account[];
  devices: Device[];
};

/** A single readiness sub-score the app explains back to the user. */
export type ReadinessCategory = {
  key:
    | "account_protection"
    | "recovery_clarity"
    | "device_continuity"
    | "backup_awareness"
    | "dependency_visibility"
    | "unresolved_unknowns";
  /** 0–100. */
  score: number;
  /** Ids of accounts/devices that pull this category down. */
  weakItemIds: string[];
};

export type RecommendedAction = {
  id: string;
  /** i18n key suffix under `actions.*`. */
  kind:
    | "enable_2fa"
    | "add_recovery"
    | "save_backup_codes"
    | "reduce_google_dependency"
    | "set_device_lock"
    | "resolve_unknown";
  /** Account or device the action targets. */
  targetId: string;
  severity: "high" | "medium" | "low";
};

export type Readiness = {
  /** Overall 0–100 readiness score. */
  score: number;
  categories: ReadinessCategory[];
  actions: RecommendedAction[];
};

export type SimulationKind =
  | "lose_phone"
  | "laptop_dies"
  | "email_locked"
  | "card_stolen"
  | "cloud_unavailable"
  | "password_manager_unavailable";

export type SimulationImpact = {
  accountId: string;
  /** Why this account is affected, as an i18n key suffix under `sim.reasons.*`. */
  reason: "lives_on" | "recovery_email" | "recovery_phone" | "social_login" | "stored_here";
  /** Can the user still recover, and how worried should they be. */
  severity: "blocked" | "at_risk" | "ok";
};

export type SimulationResult = {
  kind: SimulationKind;
  impacts: SimulationImpact[];
  blockedCount: number;
  atRiskCount: number;
};
