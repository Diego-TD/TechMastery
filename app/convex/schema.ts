import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  deviceKind,
  deviceLock,
  identifierType,
  importance,
  lifeArea,
  loginMethod,
  onboardingGoal,
  recoveryMethodType,
  twoFactorStatus,
  userStatus,
} from "../shared/enums";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    email: v.string(),
    status: userStatus,
    onboardingGoal: v.optional(onboardingGoal),
    updatedAt: v.number(),
  }).index("by_tokenIdentifier", ["tokenIdentifier"]),

  devices: defineTable({
    userId: v.id("users"),
    name: v.string(),
    kind: deviceKind,
    lockMethods: v.array(deviceLock),
    findMyEnabled: v.boolean(),
    notes: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  phoneNumbers: defineTable({
    userId: v.id("users"),
    label: v.string(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  authenticatorApps: defineTable({
    userId: v.id("users"),
    name: v.string(),
    deviceId: v.optional(v.id("devices")),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  accounts: defineTable({
    userId: v.id("users"),
    name: v.string(),
    provider: v.optional(v.string()),
    lifeArea,
    importance,
    identifierType,
    identifierAccountId: v.optional(v.id("accounts")),
    identifierPhoneId: v.optional(v.id("phoneNumbers")),
    identifier: v.optional(v.string()),
    loginMethods: v.array(loginMethod),
    socialLoginAccountId: v.optional(v.id("accounts")),
    mfaMethods: v.array(twoFactorStatus),
    authenticatorAppId: v.optional(v.id("authenticatorApps")),
    recoveryOptions: v.array(
      v.object({
        id: v.string(),
        type: recoveryMethodType,
        targetAccountId: v.optional(v.id("accounts")),
        phoneId: v.optional(v.id("phoneNumbers")),
      }),
    ),
    deviceIds: v.array(v.id("devices")),
    hasBackupCodes: v.boolean(),
    backupCodesLocation: v.optional(v.string()),
    keyFile: v.optional(
      v.object({
        label: v.string(),
        location: v.optional(v.string()),
      }),
    ),
    isPasswordManager: v.optional(v.boolean()),
    notes: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),
});
