import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";

const identity = {
  tokenIdentifier: "https://clerk.test|user_123",
  subject: "user_123",
  issuer: "https://clerk.test",
  email: "sarah@example.com",
};

function createTestBackend() {
  return convexTest(schema, modules);
}

describe("users.ensureUser", () => {
  test("creates a new user from the authenticated identity", async () => {
    const t = createTestBackend();
    const asUser = t.withIdentity(identity);

    const userId = await asUser.mutation(api.users.ensureUser, {});
    const user = await asUser.query(api.users.me, {});

    expect(user).toMatchObject({
      _id: userId,
      tokenIdentifier: identity.tokenIdentifier,
      email: identity.email,
      status: "NEEDS_ONBOARDING",
    });
  });

  test("returns the existing user id when the identity already exists", async () => {
    const t = createTestBackend();
    const asUser = t.withIdentity(identity);

    const firstUserId = await asUser.mutation(api.users.ensureUser, {});
    const secondUserId = await asUser.mutation(api.users.ensureUser, {});

    expect(secondUserId).toBe(firstUserId);
  });

  test("updates the stored email when the auth identity changes it", async () => {
    const t = createTestBackend();
    const asUser = t.withIdentity(identity);
    const asRenamedUser = t.withIdentity({
      ...identity,
      email: "new-sarah@example.com",
    });

    const userId = await asUser.mutation(api.users.ensureUser, {});
    const existingUser = await asUser.query(api.users.me, {});

    await asRenamedUser.mutation(api.users.ensureUser, {});
    const updatedUser = await asRenamedUser.query(api.users.me, {});

    expect(updatedUser).toMatchObject({
      _id: userId,
      email: "new-sarah@example.com",
      tokenIdentifier: identity.tokenIdentifier,
      status: existingUser.status,
    });
    expect(updatedUser.updatedAt).toBeGreaterThanOrEqual(existingUser.updatedAt);
  });

  test("rejects unauthenticated calls", async () => {
    const t = createTestBackend();

    await expect(t.mutation(api.users.ensureUser, {})).rejects.toThrow("Not signed in");
  });
});

describe("users.me", () => {
  test("rejects authenticated users without a user record", async () => {
    const t = createTestBackend();
    const asUser = t.withIdentity(identity);

    await expect(asUser.query(api.users.me, {})).rejects.toThrow("User not found");
  });

  test("returns the current user for the authenticated identity", async () => {
    const t = createTestBackend();
    const asUser = t.withIdentity(identity);

    const userId = await asUser.mutation(api.users.ensureUser, {});
    const user = await asUser.query(api.users.me, {});

    expect(user._id).toBe(userId);
  });
});