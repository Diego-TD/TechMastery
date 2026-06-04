import type {
  DeviceKind,
  IdentifierType,
  LoginMethod,
  RecoveryMethodType,
  TwoFactorStatus,
} from "@shared/enums";
import type { DeviceLock, Importance } from "@/lib/inventory/types";

export const IDENTIFIER_TYPES: readonly IdentifierType[] = [
  "email",
  "phone",
  "username",
  "unknown",
];

export const LOGIN_METHODS: readonly LoginMethod[] = [
  "password",
  "passkey",
  "email_code",
  "social",
];

export const TWO_FACTORS: readonly TwoFactorStatus[] = [
  "none",
  "sms",
  "email",
  "authenticator_app",
  "security_key",
  "unknown",
];

/** Types offered when adding a recovery option (no "none"/"unknown" — an empty list means no recovery). */
export const RECOVERY_TYPES: readonly RecoveryMethodType[] = [
  "email",
  "phone",
  "backup_codes",
  "security_questions",
  "recovery_contact",
  "customer_support",
];

export const IMPORTANCES: readonly Importance[] = ["high", "medium", "low"];

export const DEVICE_KINDS: readonly DeviceKind[] = [
  "phone",
  "laptop",
  "desktop",
  "tablet",
  "other",
];

export const DEVICE_LOCKS: readonly DeviceLock[] = [
  "face",
  "fingerprint",
  "pin",
  "password",
  "none",
  "unknown",
];

export const REAL_DEVICE_LOCKS: readonly DeviceLock[] = ["face", "fingerprint", "pin", "password"];
