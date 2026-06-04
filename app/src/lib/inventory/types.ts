import type {
  IdentifierType,
  LoginMethod,
  RecoveryMethodType,
  TwoFactorStatus,
  DeviceKind,
  LifeArea,
} from "@shared/enums";

/** User-flagged importance — drives which risks the app surfaces first. */
export type Importance = "high" | "medium" | "low";

/** A masked phone number, mapped once and linked from many places. */
export type PhoneNumber = {
  id: string;
  label: string;
};

/** A single recovery path. An account can have several. */
export type RecoveryOption = {
  id: string;
  type: RecoveryMethodType;
  /** For `type: "email"` — the account whose inbox recovers this one. */
  targetAccountId?: string;
  /** For `type: "phone"` — the linked phone number entity. */
  phoneId?: string;
};

/**
 * An account the user maps. Metadata only — never secrets, passwords, or
 * recovery codes. The shape separates the four things people conflate:
 * identifier (what you log in as), login methods (how you prove it), 2FA, and
 * recovery (how you get back in).
 */
export type Account = {
  id: string;
  name: string;
  provider?: string;
  lifeArea: LifeArea;
  importance: Importance;

  // Identifier — what you log in as. Derived/linked, not retyped:
  identifierType: IdentifierType;
  /** For `identifierType: "email"` — the email account you log in with (link). */
  identifierAccountId?: string;
  /** For `identifierType: "phone"` — the linked phone number. */
  identifierPhoneId?: string;
  /** For `identifierType: "username"` — a free-text label (no PII needed). */
  identifier?: string;

  // Login — how you prove it's you (can be several).
  loginMethods: LoginMethod[];
  /** When `loginMethods` includes "social", the account you sign in *with*. */
  socialLoginAccountId?: string;

  /**
   * MFA methods in use. Either exactly `["none"]`, exactly `["unknown"]`, or any
   * mix of "sms" / "authenticator_app" / "security_key". Empty == unknown.
   */
  mfaMethods: TwoFactorStatus[];
  /** When `mfaMethods` includes "authenticator_app", which authenticator holds it. */
  authenticatorAppId?: string;

  // Recovery — how you'd get back in (can be several).
  recoveryOptions: RecoveryOption[];

  /** Devices this account is actively used on. */
  deviceIds: string[];

  /** Whether backup/recovery codes exist, and (non-secret) where they live. */
  hasBackupCodes: boolean;
  backupCodesLocation?: string;
  /**
   * A credential that lives as a *file*, not a password — e.g. the SAT e.firma
   * (.cer/.key), an SSH key. Only its label + location, never the file or RFC.
   */
  keyFile?: { label: string; location?: string };
  /** True for a password manager — used by the "manager unavailable" sim. */
  isPasswordManager?: boolean;
  notes?: string;
};

export type DeviceLock = "face" | "fingerprint" | "pin" | "password" | "none" | "unknown";

export type Device = {
  id: string;
  name: string;
  kind: DeviceKind;
  /** Either exactly ["none"], exactly ["unknown"], or any mix of real locks. */
  lockMethods: DeviceLock[];
  findMyEnabled: boolean;
  notes?: string;
};

/** An authenticator app (Google Authenticator, Microsoft Authenticator, …). */
export type AuthenticatorApp = {
  id: string;
  name: string;
  /** Which device it lives on (usually a phone). */
  deviceId?: string;
};

export type MapData = {
  accounts: Account[];
  devices: Device[];
  authenticatorApps: AuthenticatorApp[];
  phoneNumbers: PhoneNumber[];
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
  score: number;
  categories: ReadinessCategory[];
  actions: RecommendedAction[];
};

export type SimulationKind =
  | "lose_device"
  | "lose_phone_number"
  | "email_locked"
  | "card_stolen"
  | "password_manager_unavailable";

export type SimulationImpact = {
  accountId: string;
  reason:
    | "lives_on"
    | "identifier_phone"
    | "recovery_email"
    | "recovery_phone"
    | "social_login"
    | "authenticator"
    | "stored_here"
    | "password_only"
    | "payment_reissue";
  severity: "blocked" | "at_risk" | "ok";
};

export type SimulationResult = {
  kind: SimulationKind;
  targetId?: string;
  impacts: SimulationImpact[];
  blockedCount: number;
  atRiskCount: number;
};
