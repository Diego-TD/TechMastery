import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";
import { modules } from "./test.setup";

const identity = {
  tokenIdentifier: "https://clerk.test|user_inventory",
  subject: "user_inventory",
  issuer: "https://clerk.test",
  email: "inventory@example.com",
};

const otherIdentity = {
  tokenIdentifier: "https://clerk.test|user_other",
  subject: "user_other",
  issuer: "https://clerk.test",
  email: "other@example.com",
};

function createTestBackend() {
  return convexTest(schema, modules);
}

function accountInput(overrides: {
  name?: string;
  phoneId?: Id<"phoneNumbers">;
  authAppId?: Id<"authenticatorApps">;
  deviceId?: Id<"devices">;
} = {}) {
  return {
    name: overrides.name ?? "Gmail",
    lifeArea: "email" as const,
    importance: "high" as const,
    identifierType: "email" as const,
    loginMethods: ["password"] as const,
    mfaMethods: overrides.authAppId ? (["authenticator_app"] as const) : (["unknown"] as const),
    authenticatorAppId: overrides.authAppId,
    recoveryOptions: overrides.phoneId
      ? [{ id: "r1", type: "phone" as const, phoneId: overrides.phoneId }]
      : [],
    deviceIds: overrides.deviceId ? [overrides.deviceId] : [],
    hasBackupCodes: false,
  };
}

describe("inventory persistence", () => {
  test("creates and lists the current user's inventory", async () => {
    const t = createTestBackend();
    const asUser = t.withIdentity(identity);
    await asUser.mutation(api.users.ensureUser, {});

    const deviceId = await asUser.mutation(api.inventory.addDevice, {
      input: {
        name: "iPhone",
        kind: "phone",
        lockMethods: ["face"],
        findMyEnabled: true,
      },
    });
    const phoneId = await asUser.mutation(api.inventory.addPhoneNumber, {
      label: "+52 masked",
    });
    const authAppId = await asUser.mutation(api.inventory.addAuthenticatorApp, {
      name: "Google Authenticator",
      deviceId,
    });
    const accountId = await asUser.mutation(api.inventory.addAccount, {
      input: accountInput({ phoneId, authAppId, deviceId }),
    });

    const inventory = await asUser.query(api.inventory.list, {});

    expect(inventory.devices).toMatchObject([{ id: deviceId, name: "iPhone" }]);
    expect(inventory.phoneNumbers).toMatchObject([{ id: phoneId, label: "+52 masked" }]);
    expect(inventory.authenticatorApps).toMatchObject([{ id: authAppId, deviceId }]);
    expect(inventory.accounts).toMatchObject([
      {
        id: accountId,
        authenticatorAppId: authAppId,
        recoveryOptions: [{ id: "r1", type: "phone", phoneId }],
      },
    ]);
  });

  test("does not expose another user's inventory", async () => {
    const t = createTestBackend();
    const asUser = t.withIdentity(identity);
    const asOtherUser = t.withIdentity(otherIdentity);
    await asUser.mutation(api.users.ensureUser, {});
    await asOtherUser.mutation(api.users.ensureUser, {});

    await asUser.mutation(api.inventory.addDevice, {
      input: {
        name: "Private laptop",
        kind: "laptop",
        lockMethods: ["password"],
        findMyEnabled: true,
      },
    });

    const otherInventory = await asOtherUser.query(api.inventory.list, {});

    expect(otherInventory.devices).toEqual([]);
  });

  test("rejects account references owned by a different user", async () => {
    const t = createTestBackend();
    const asUser = t.withIdentity(identity);
    const asOtherUser = t.withIdentity(otherIdentity);
    await asUser.mutation(api.users.ensureUser, {});
    await asOtherUser.mutation(api.users.ensureUser, {});

    const otherPhoneId = await asOtherUser.mutation(api.inventory.addPhoneNumber, {
      label: "Other phone",
    });

    await expect(
      asUser.mutation(api.inventory.addAccount, {
        input: accountInput({ phoneId: otherPhoneId }),
      }),
    ).rejects.toThrow("Not found");
  });

  test("guards deletion of referenced entities", async () => {
    const t = createTestBackend();
    const asUser = t.withIdentity(identity);
    await asUser.mutation(api.users.ensureUser, {});

    const phoneId = await asUser.mutation(api.inventory.addPhoneNumber, {
      label: "Main phone",
    });
    const authAppId = await asUser.mutation(api.inventory.addAuthenticatorApp, {
      name: "Google Authenticator",
    });
    await asUser.mutation(api.inventory.addAccount, {
      input: accountInput({ phoneId, authAppId }),
    });

    await expect(
      asUser.mutation(api.inventory.deletePhoneNumber, { id: phoneId }),
    ).rejects.toThrow("Phone number is in use");
    await expect(
      asUser.mutation(api.inventory.deleteAuthenticatorApp, { id: authAppId }),
    ).rejects.toThrow("Authenticator app is in use");
  });
});
