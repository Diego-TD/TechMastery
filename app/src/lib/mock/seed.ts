import type { Account, AuthenticatorApp, Device, MapData } from "./types";

/**
 * Seeded sample map for an Ensenada CS student. Designed to surface teachable
 * patterns: Gmail is the recovery hub for almost everything (single point of
 * failure), several accounts sign in *with* Google, two authenticator apps are
 * in play (Google + Microsoft), the bank leans on SMS + support, and the SAT
 * e.firma is trapped on one laptop.
 */

const PHONE = "+52 ••• ••• 4821";

const devices: Device[] = [
  { id: "dev_iphone", name: "iPhone 13", kind: "phone", lock: "biometric", findMyEnabled: true },
  { id: "dev_macbook", name: "MacBook Air", kind: "laptop", lock: "password", findMyEnabled: true },
  {
    id: "dev_ipad",
    name: "iPad (old)",
    kind: "tablet",
    lock: "none",
    findMyEnabled: false,
    notes: "Mostly for Netflix on the couch.",
  },
];

const authenticatorApps: AuthenticatorApp[] = [
  { id: "auth_google", name: "Google Authenticator", deviceId: "dev_iphone" },
  { id: "auth_ms", name: "Microsoft Authenticator", deviceId: "dev_iphone" },
];

const accounts: Account[] = [
  {
    id: "acc_gmail",
    name: "Gmail",
    provider: "Google",
    lifeArea: "email",
    importance: "high",
    identifierType: "email",
    identifier: "d•••@gmail.com",
    loginMethods: ["password", "passkey"],
    mfaMethods: ["authenticator_app"],
    authenticatorAppId: "auth_google",
    recoveryOptions: [{ id: "r1", type: "phone", value: PHONE }],
    deviceIds: ["dev_iphone", "dev_macbook"],
    hasBackupCodes: true,
    backupCodesLocation: "Printed, in a drawer at home",
    notes: "Main inbox. Recovers most of my other accounts.",
  },
  {
    id: "acc_cetys",
    name: "CETYS email",
    provider: "Microsoft 365",
    lifeArea: "school_work",
    importance: "high",
    identifierType: "email",
    loginMethods: ["password"],
    mfaMethods: ["authenticator_app"],
    authenticatorAppId: "auth_ms",
    recoveryOptions: [{ id: "r1", type: "email", targetAccountId: "acc_gmail" }],
    deviceIds: ["dev_macbook", "dev_iphone"],
    hasBackupCodes: false,
  },
  {
    id: "acc_icloud",
    name: "iCloud",
    provider: "Apple",
    lifeArea: "cloud",
    importance: "high",
    identifierType: "email",
    loginMethods: ["password"],
    mfaMethods: ["sms"],
    recoveryOptions: [{ id: "r1", type: "phone", value: PHONE }],
    deviceIds: ["dev_iphone", "dev_macbook", "dev_ipad"],
    hasBackupCodes: false,
    notes: "Photos, backups, Find My.",
  },
  {
    id: "acc_bank",
    name: "BBVA",
    provider: "BBVA México",
    lifeArea: "banking",
    importance: "high",
    identifierType: "username",
    loginMethods: ["password"],
    mfaMethods: ["sms"],
    recoveryOptions: [
      { id: "r1", type: "customer_support" },
      { id: "r2", type: "phone", value: PHONE },
    ],
    deviceIds: ["dev_iphone"],
    hasBackupCodes: false,
    notes: "App needs an SMS code on every login.",
  },
  {
    id: "acc_github",
    name: "GitHub",
    lifeArea: "school_work",
    importance: "high",
    identifierType: "username",
    loginMethods: ["password", "passkey"],
    mfaMethods: ["authenticator_app"],
    authenticatorAppId: "auth_google",
    recoveryOptions: [{ id: "r1", type: "email", targetAccountId: "acc_gmail" }],
    deviceIds: ["dev_macbook"],
    hasBackupCodes: true,
    backupCodesLocation: "Saved in Bitwarden",
    notes: "Deployments depend on this.",
  },
  {
    id: "acc_instagram",
    name: "Instagram",
    provider: "Meta",
    lifeArea: "social",
    importance: "medium",
    identifierType: "email",
    loginMethods: ["social"],
    socialLoginAccountId: "acc_gmail",
    mfaMethods: ["none"],
    recoveryOptions: [{ id: "r1", type: "email", targetAccountId: "acc_gmail" }],
    deviceIds: ["dev_iphone"],
    hasBackupCodes: false,
  },
  {
    id: "acc_netflix",
    name: "Netflix",
    lifeArea: "shopping",
    importance: "low",
    identifierType: "email",
    loginMethods: ["social"],
    socialLoginAccountId: "acc_gmail",
    mfaMethods: ["none"],
    recoveryOptions: [{ id: "r1", type: "email", targetAccountId: "acc_gmail" }],
    deviceIds: ["dev_ipad", "dev_macbook"],
    hasBackupCodes: false,
  },
  {
    id: "acc_steam",
    name: "Steam",
    provider: "Valve",
    lifeArea: "gaming",
    importance: "medium",
    identifierType: "username",
    loginMethods: ["password"],
    mfaMethods: ["authenticator_app"],
    authenticatorAppId: "auth_google",
    recoveryOptions: [{ id: "r1", type: "email", targetAccountId: "acc_gmail" }],
    deviceIds: ["dev_macbook"],
    hasBackupCodes: false,
  },
  {
    id: "acc_sat",
    name: "SAT",
    provider: "gob.mx",
    lifeArea: "government_health",
    importance: "high",
    identifierType: "username",
    loginMethods: ["password"],
    mfaMethods: ["none"],
    recoveryOptions: [{ id: "r1", type: "customer_support" }],
    deviceIds: ["dev_macbook"],
    hasBackupCodes: false,
    keyFile: { label: "e.firma", location: "Only on the MacBook (Downloads)" },
    notes: "Login is RFC + password. The e.firma is needed for declarations.",
  },
  {
    id: "acc_bitwarden",
    name: "Bitwarden",
    lifeArea: "cloud",
    importance: "high",
    identifierType: "email",
    loginMethods: ["password"],
    mfaMethods: ["authenticator_app"],
    authenticatorAppId: "auth_google",
    recoveryOptions: [{ id: "r1", type: "email", targetAccountId: "acc_gmail" }],
    deviceIds: ["dev_iphone", "dev_macbook"],
    hasBackupCodes: false,
    isPasswordManager: true,
    notes: "Holds most of my passwords.",
  },
];

export function makeSeedData(): MapData {
  return {
    accounts: accounts.map((a) => ({
      ...a,
      loginMethods: [...a.loginMethods],
      mfaMethods: [...a.mfaMethods],
      recoveryOptions: a.recoveryOptions.map((r) => ({ ...r })),
      deviceIds: [...a.deviceIds],
    })),
    devices: devices.map((d) => ({ ...d })),
    authenticatorApps: authenticatorApps.map((a) => ({ ...a })),
  };
}
