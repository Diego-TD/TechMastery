import type {
  AuthMethodType,
  DeviceKind,
  RecoveryMethodType,
  TwoFactorStatus,
} from "@shared/enums";
import type { DeviceLock, Importance } from "@/lib/mock/types";

export const AUTH_METHODS: readonly AuthMethodType[] = [
  "password",
  "social_login",
  "passkey",
  "magic_link",
  "sms_code",
  "unknown",
];

export const TWO_FACTORS: readonly TwoFactorStatus[] = [
  "none",
  "sms",
  "authenticator_app",
  "security_key",
  "unknown",
];

export const RECOVERY_METHODS: readonly RecoveryMethodType[] = [
  "email",
  "phone",
  "backup_codes",
  "security_questions",
  "recovery_contact",
  "customer_support",
  "none",
  "unknown",
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
  "biometric",
  "pin",
  "password",
  "none",
  "unknown",
];
