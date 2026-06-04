/* eslint-disable react-refresh/only-export-components --
 * This module remains the single frontend data seam. It used to hold the
 * in-memory prototype store; it now adapts Convex queries/mutations to the same
 * component-facing hooks so the feature screens can stay focused on UI.
 */
import { useMemo, type ReactNode } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { buildGraph, computeReadiness, runSimulation, type GraphModel } from "./derive";
import type {
  Account,
  AuthenticatorApp,
  Device,
  MapData,
  PhoneNumber,
  Readiness,
  SimulationKind,
  SimulationResult,
} from "./types";
import type { LifeArea } from "@shared/enums";

export type NewAccountInput = Omit<Account, "id">;

const EMPTY_DATA: MapData = {
  accounts: [],
  devices: [],
  authenticatorApps: [],
  phoneNumbers: [],
};

export function MockDataProvider({ children }: { children: ReactNode }) {
  return children;
}

function omitUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => omitUndefined(item)) as T;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value).flatMap(([key, entry]) =>
      entry === undefined ? [] : [[key, omitUndefined(entry)]],
    );
    return Object.fromEntries(entries) as T;
  }
  return value;
}

function toAccountInput(input: NewAccountInput) {
  return omitUndefined({
    ...input,
    identifierAccountId: input.identifierAccountId as Id<"accounts"> | undefined,
    identifierPhoneId: input.identifierPhoneId as Id<"phoneNumbers"> | undefined,
    socialLoginAccountId: input.socialLoginAccountId as Id<"accounts"> | undefined,
    authenticatorAppId: input.authenticatorAppId as Id<"authenticatorApps"> | undefined,
    recoveryOptions: input.recoveryOptions.map((recovery) =>
      omitUndefined({
        ...recovery,
        targetAccountId: recovery.targetAccountId as Id<"accounts"> | undefined,
        phoneId: recovery.phoneId as Id<"phoneNumbers"> | undefined,
      }),
    ),
    deviceIds: input.deviceIds as Id<"devices">[],
  });
}

function toDeviceInput(input: Omit<Device, "id">) {
  return omitUndefined(input);
}

function useInventoryData(): MapData {
  return useQuery(api.inventory.list, {}) ?? EMPTY_DATA;
}

// --- Read/write hooks consumed by screens -------------------------------------

export function useInventory() {
  const data = useInventoryData();
  const addAccountMutation = useMutation(api.inventory.addAccount);
  const updateAccountMutation = useMutation(api.inventory.updateAccount);
  const addDeviceMutation = useMutation(api.inventory.addDevice);
  const updateDeviceMutation = useMutation(api.inventory.updateDevice);
  const addAuthenticatorAppMutation = useMutation(api.inventory.addAuthenticatorApp);
  const updateAuthenticatorAppMutation = useMutation(api.inventory.updateAuthenticatorApp);
  const deleteAuthenticatorAppMutation = useMutation(api.inventory.deleteAuthenticatorApp);
  const addPhoneNumberMutation = useMutation(api.inventory.addPhoneNumber);
  const updatePhoneNumberMutation = useMutation(api.inventory.updatePhoneNumber);
  const deletePhoneNumberMutation = useMutation(api.inventory.deletePhoneNumber);

  return {
    accounts: data.accounts,
    devices: data.devices,
    authenticatorApps: data.authenticatorApps,
    phoneNumbers: data.phoneNumbers,
    addAccount: async (input: NewAccountInput) =>
      await addAccountMutation({ input: toAccountInput(input) }),
    updateAccount: async (id: string, input: NewAccountInput) =>
      await updateAccountMutation({
        id: id as Id<"accounts">,
        input: toAccountInput(input),
      }),
    addDevice: async (input: Omit<Device, "id">) =>
      await addDeviceMutation({ input: toDeviceInput(input) }),
    updateDevice: async (id: string, input: Omit<Device, "id">) =>
      await updateDeviceMutation({
        id: id as Id<"devices">,
        input: toDeviceInput(input),
      }),
    addAuthenticatorApp: async (input: Omit<AuthenticatorApp, "id">) =>
      await addAuthenticatorAppMutation(omitUndefined({
        name: input.name,
        deviceId: input.deviceId as Id<"devices"> | undefined,
      })),
    updateAuthenticatorApp: async (id: string, patch: Partial<AuthenticatorApp>) => {
      const existing = data.authenticatorApps.find((app) => app.id === id);
      if (!existing) throw new Error("Authenticator app not found");
      return await updateAuthenticatorAppMutation(omitUndefined({
        id: id as Id<"authenticatorApps">,
        name: patch.name ?? existing.name,
        deviceId: (patch.deviceId ?? existing.deviceId) as Id<"devices"> | undefined,
      }));
    },
    deleteAuthenticatorApp: async (id: string) =>
      await deleteAuthenticatorAppMutation({ id: id as Id<"authenticatorApps"> }),
    addPhoneNumber: async (input: Omit<PhoneNumber, "id">) =>
      await addPhoneNumberMutation({ label: input.label }),
    updatePhoneNumber: async (id: string, patch: Partial<PhoneNumber>) => {
      const existing = data.phoneNumbers.find((phone) => phone.id === id);
      if (!existing) throw new Error("Phone number not found");
      return await updatePhoneNumberMutation({
        id: id as Id<"phoneNumbers">,
        label: patch.label ?? existing.label,
      });
    },
    deletePhoneNumber: async (id: string) =>
      await deletePhoneNumberMutation({ id: id as Id<"phoneNumbers"> }),
  };
}

export function useDeviceById(id: string | undefined): Device | undefined {
  const data = useInventoryData();
  return id ? data.devices.find((d) => d.id === id) : undefined;
}

export function useAccount(id: string | undefined): Account | undefined {
  const data = useInventoryData();
  return id ? data.accounts.find((a) => a.id === id) : undefined;
}

export function useDevice(id: string | undefined): Device | undefined {
  const data = useInventoryData();
  return id ? data.devices.find((d) => d.id === id) : undefined;
}

export function useGraph(lifeArea?: LifeArea): GraphModel {
  const data = useInventoryData();
  return useMemo(() => buildGraph(data, lifeArea), [data, lifeArea]);
}

export function useReadiness(): Readiness {
  const data = useInventoryData();
  return useMemo(() => computeReadiness(data), [data]);
}

export function useSimulation(kind: SimulationKind, targetId?: string): SimulationResult {
  const data = useInventoryData();
  return useMemo(() => runSimulation(data, kind, targetId), [data, kind, targetId]);
}

export function useResetMap() {
  return () => undefined;
}
