import { describe, expect, test } from "vitest";
import { buildGraph, runSimulation } from "./derive";
import type { Account, MapData } from "./types";

const baseAccount = (overrides: Partial<Account>): Account => ({
  id: "account_1",
  name: "Account",
  lifeArea: "social",
  importance: "medium",
  identifierType: "email",
  loginMethods: ["password"],
  mfaMethods: ["unknown"],
  recoveryOptions: [],
  deviceIds: [],
  hasBackupCodes: false,
  ...overrides,
});

describe("inventory derivation", () => {
  test("surfaces phone numbers in the phone life-area graph", () => {
    const data: MapData = {
      accounts: [
        baseAccount({
          id: "account_sms",
          name: "SMS account",
          identifierType: "phone",
          identifierPhoneId: "phone_main",
          recoveryOptions: [{ id: "recovery_phone", type: "phone", phoneId: "phone_main" }],
        }),
      ],
      devices: [],
      authenticatorApps: [],
      phoneNumbers: [
        { id: "phone_main", label: "+52 masked" },
        { id: "phone_unused", label: "+1 backup" },
      ],
    };

    const graph = buildGraph(data, "phone");

    expect(graph.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "phone_main", kind: "phone" }),
        expect.objectContaining({ id: "phone_unused", kind: "phone" }),
        expect.objectContaining({ id: "account_sms", kind: "account" }),
      ]),
    );
    expect(graph.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "account_sms",
          target: "phone_main",
          kind: "depends_on",
        }),
        expect.objectContaining({
          source: "account_sms",
          target: "phone_main",
          kind: "recovers",
        }),
      ]),
    );
  });

  test("downgrades lost-phone impact when another recovery path exists", () => {
    const data: MapData = {
      accounts: [
        baseAccount({
          id: "email_recovery",
          name: "Recovery email",
          lifeArea: "email",
        }),
        baseAccount({
          id: "bank",
          name: "Bank",
          lifeArea: "banking",
          identifierType: "phone",
          identifierPhoneId: "phone_main",
          mfaMethods: ["sms"],
          recoveryOptions: [
            { id: "recovery_phone", type: "phone", phoneId: "phone_main" },
            { id: "recovery_email", type: "email", targetAccountId: "email_recovery" },
          ],
        }),
      ],
      devices: [],
      authenticatorApps: [],
      phoneNumbers: [{ id: "phone_main", label: "+52 masked" }],
    };

    const result = runSimulation(data, "lose_phone_number", "phone_main");

    expect(result.blockedCount).toBe(0);
    expect(result.atRiskCount).toBe(1);
    expect(result.impacts).toEqual([
      expect.objectContaining({
        accountId: "bank",
        reason: "recovery_phone",
        severity: "at_risk",
      }),
    ]);
  });
});
