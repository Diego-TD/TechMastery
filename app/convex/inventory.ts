import { ConvexError, v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./lib/users";
import {
  deviceKind,
  deviceLock,
  identifierType,
  importance,
  lifeArea,
  loginMethod,
  recoveryMethodType,
  twoFactorStatus,
} from "../shared/enums";

const recoveryOptionValidator = v.object({
  id: v.string(),
  type: recoveryMethodType,
  targetAccountId: v.optional(v.id("accounts")),
  phoneId: v.optional(v.id("phoneNumbers")),
});

const keyFileValidator = v.object({
  label: v.string(),
  location: v.optional(v.string()),
});

const accountInputValidator = v.object({
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
  recoveryOptions: v.array(recoveryOptionValidator),
  deviceIds: v.array(v.id("devices")),
  hasBackupCodes: v.boolean(),
  backupCodesLocation: v.optional(v.string()),
  keyFile: v.optional(keyFileValidator),
  isPasswordManager: v.optional(v.boolean()),
  notes: v.optional(v.string()),
});

const deviceInputValidator = v.object({
  name: v.string(),
  kind: deviceKind,
  lockMethods: v.array(deviceLock),
  findMyEnabled: v.boolean(),
  notes: v.optional(v.string()),
});

async function ownedDoc<TableName extends "accounts" | "devices" | "phoneNumbers" | "authenticatorApps">(
  ctx: QueryCtx | MutationCtx,
  table: TableName,
  id: Id<TableName>,
  userId: Id<"users">,
): Promise<Doc<TableName>> {
  const doc = await ctx.db.get(table, id);
  if (!doc || doc.userId !== userId) throw new ConvexError("Not found");
  return doc;
}

async function userAccounts(ctx: QueryCtx | MutationCtx, userId: Id<"users">) {
  return await ctx.db
    .query("accounts")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .take(500);
}

async function userDevices(ctx: QueryCtx | MutationCtx, userId: Id<"users">) {
  return await ctx.db
    .query("devices")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .take(500);
}

async function userPhoneNumbers(ctx: QueryCtx | MutationCtx, userId: Id<"users">) {
  return await ctx.db
    .query("phoneNumbers")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .take(500);
}

async function userAuthenticatorApps(ctx: QueryCtx | MutationCtx, userId: Id<"users">) {
  return await ctx.db
    .query("authenticatorApps")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .take(500);
}

async function assertAccountRefs(ctx: MutationCtx, userId: Id<"users">, input: typeof accountInputValidator.type) {
  if (input.identifierAccountId) {
    await ownedDoc(ctx, "accounts", input.identifierAccountId, userId);
  }
  if (input.socialLoginAccountId) {
    await ownedDoc(ctx, "accounts", input.socialLoginAccountId, userId);
  }
  if (input.identifierPhoneId) {
    await ownedDoc(ctx, "phoneNumbers", input.identifierPhoneId, userId);
  }
  if (input.authenticatorAppId) {
    await ownedDoc(ctx, "authenticatorApps", input.authenticatorAppId, userId);
  }
  for (const deviceId of input.deviceIds) {
    await ownedDoc(ctx, "devices", deviceId, userId);
  }
  for (const recovery of input.recoveryOptions) {
    if (recovery.targetAccountId) {
      await ownedDoc(ctx, "accounts", recovery.targetAccountId, userId);
    }
    if (recovery.phoneId) {
      await ownedDoc(ctx, "phoneNumbers", recovery.phoneId, userId);
    }
  }
}

function mapAccount(account: Doc<"accounts">) {
  return {
    id: account._id,
    name: account.name,
    provider: account.provider,
    lifeArea: account.lifeArea,
    importance: account.importance,
    identifierType: account.identifierType,
    identifierAccountId: account.identifierAccountId,
    identifierPhoneId: account.identifierPhoneId,
    identifier: account.identifier,
    loginMethods: account.loginMethods,
    socialLoginAccountId: account.socialLoginAccountId,
    mfaMethods: account.mfaMethods,
    authenticatorAppId: account.authenticatorAppId,
    recoveryOptions: account.recoveryOptions,
    deviceIds: account.deviceIds,
    hasBackupCodes: account.hasBackupCodes,
    backupCodesLocation: account.backupCodesLocation,
    keyFile: account.keyFile,
    isPasswordManager: account.isPasswordManager,
    notes: account.notes,
  };
}

function mapDevice(device: Doc<"devices">) {
  return {
    id: device._id,
    name: device.name,
    kind: device.kind,
    lockMethods: device.lockMethods,
    findMyEnabled: device.findMyEnabled,
    notes: device.notes,
  };
}

function mapPhoneNumber(phone: Doc<"phoneNumbers">) {
  return { id: phone._id, label: phone.label };
}

function mapAuthenticatorApp(app: Doc<"authenticatorApps">) {
  return {
    id: app._id,
    name: app.name,
    deviceId: app.deviceId,
  };
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    const [accounts, devices, phoneNumbers, authenticatorApps] = await Promise.all([
      userAccounts(ctx, user._id),
      userDevices(ctx, user._id),
      userPhoneNumbers(ctx, user._id),
      userAuthenticatorApps(ctx, user._id),
    ]);

    return {
      accounts: accounts.map(mapAccount),
      devices: devices.map(mapDevice),
      phoneNumbers: phoneNumbers.map(mapPhoneNumber),
      authenticatorApps: authenticatorApps.map(mapAuthenticatorApp),
    };
  },
});

export const addAccount = mutation({
  args: { input: accountInputValidator },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    await assertAccountRefs(ctx, user._id, args.input);
    return await ctx.db.insert("accounts", {
      userId: user._id,
      ...args.input,
      updatedAt: Date.now(),
    });
  },
});

export const updateAccount = mutation({
  args: { id: v.id("accounts"), input: accountInputValidator },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    await ownedDoc(ctx, "accounts", args.id, user._id);
    await assertAccountRefs(ctx, user._id, args.input);
    await ctx.db.replace("accounts", args.id, {
      userId: user._id,
      ...args.input,
      updatedAt: Date.now(),
    });
    return args.id;
  },
});

export const addDevice = mutation({
  args: { input: deviceInputValidator },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    return await ctx.db.insert("devices", {
      userId: user._id,
      ...args.input,
      updatedAt: Date.now(),
    });
  },
});

export const updateDevice = mutation({
  args: { id: v.id("devices"), input: deviceInputValidator },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    await ownedDoc(ctx, "devices", args.id, user._id);
    await ctx.db.replace("devices", args.id, {
      userId: user._id,
      ...args.input,
      updatedAt: Date.now(),
    });
    return args.id;
  },
});

export const addPhoneNumber = mutation({
  args: { label: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    return await ctx.db.insert("phoneNumbers", {
      userId: user._id,
      label: args.label,
      updatedAt: Date.now(),
    });
  },
});

export const updatePhoneNumber = mutation({
  args: { id: v.id("phoneNumbers"), label: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    await ownedDoc(ctx, "phoneNumbers", args.id, user._id);
    await ctx.db.patch("phoneNumbers", args.id, { label: args.label, updatedAt: Date.now() });
    return args.id;
  },
});

export const deletePhoneNumber = mutation({
  args: { id: v.id("phoneNumbers") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    await ownedDoc(ctx, "phoneNumbers", args.id, user._id);
    const accounts = await userAccounts(ctx, user._id);
    const inUse = accounts.some(
      (account) =>
        account.identifierPhoneId === args.id ||
        account.recoveryOptions.some((recovery) => recovery.phoneId === args.id),
    );
    if (inUse) throw new ConvexError("Phone number is in use");
    await ctx.db.delete("phoneNumbers", args.id);
    return args.id;
  },
});

export const addAuthenticatorApp = mutation({
  args: { name: v.string(), deviceId: v.optional(v.id("devices")) },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    if (args.deviceId) await ownedDoc(ctx, "devices", args.deviceId, user._id);
    return await ctx.db.insert("authenticatorApps", {
      userId: user._id,
      name: args.name,
      deviceId: args.deviceId,
      updatedAt: Date.now(),
    });
  },
});

export const updateAuthenticatorApp = mutation({
  args: {
    id: v.id("authenticatorApps"),
    name: v.string(),
    deviceId: v.optional(v.id("devices")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    await ownedDoc(ctx, "authenticatorApps", args.id, user._id);
    if (args.deviceId) await ownedDoc(ctx, "devices", args.deviceId, user._id);
    await ctx.db.patch("authenticatorApps", args.id, {
      name: args.name,
      deviceId: args.deviceId,
      updatedAt: Date.now(),
    });
    return args.id;
  },
});

export const deleteAuthenticatorApp = mutation({
  args: { id: v.id("authenticatorApps") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    await ownedDoc(ctx, "authenticatorApps", args.id, user._id);
    const accounts = await userAccounts(ctx, user._id);
    const inUse = accounts.some((account) => account.authenticatorAppId === args.id);
    if (inUse) throw new ConvexError("Authenticator app is in use");
    await ctx.db.delete("authenticatorApps", args.id);
    return args.id;
  },
});
