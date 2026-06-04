import { v, type Infer } from "convex/values";

export const userStatus = v.union(v.literal("NEEDS_ONBOARDING"), v.literal("ONBOARDED"));
export type UserStatus = Infer<typeof userStatus>;

/**
 * Shared domain enums for the account/device map. These live in `shared/` so
 * Convex validators and the React app stay in sync once the backend is wired;
 * for now the UI prototype consumes the `Infer<...>` types directly.
 */

/** The life areas an account or device belongs to. "unknown" is an honest state. */
export const lifeArea = v.union(
  v.literal("school_work"),
  v.literal("email"),
  v.literal("phone"),
  v.literal("banking"),
  v.literal("cloud"),
  v.literal("social"),
  v.literal("gaming"),
  v.literal("shopping"),
  v.literal("government_health"),
  v.literal("unknown"),
);
export type LifeArea = Infer<typeof lifeArea>;

export const LIFE_AREAS: readonly LifeArea[] = [
  "school_work",
  "email",
  "phone",
  "banking",
  "cloud",
  "social",
  "gaming",
  "shopping",
  "government_health",
  "unknown",
];

/** How a person logs into an account. */
export const authMethodType = v.union(
  v.literal("password"),
  v.literal("social_login"), // "sign in with Google/Apple/etc."
  v.literal("passkey"),
  v.literal("magic_link"),
  v.literal("sms_code"),
  v.literal("unknown"),
);
export type AuthMethodType = Infer<typeof authMethodType>;

/** Second factor on the account. */
export const twoFactorStatus = v.union(
  v.literal("none"),
  v.literal("sms"),
  v.literal("authenticator_app"),
  v.literal("security_key"),
  v.literal("unknown"),
);
export type TwoFactorStatus = Infer<typeof twoFactorStatus>;

/** How account access is recovered if the primary login fails. */
export const recoveryMethodType = v.union(
  v.literal("email"),
  v.literal("phone"),
  v.literal("backup_codes"),
  v.literal("security_questions"),
  v.literal("recovery_contact"),
  v.literal("customer_support"),
  v.literal("none"),
  v.literal("unknown"),
);
export type RecoveryMethodType = Infer<typeof recoveryMethodType>;

export const deviceKind = v.union(
  v.literal("phone"),
  v.literal("laptop"),
  v.literal("desktop"),
  v.literal("tablet"),
  v.literal("other"),
);
export type DeviceKind = Infer<typeof deviceKind>;

/** Node kinds rendered on the account map. */
export type MapNodeKind = "account" | "device" | "recovery";
