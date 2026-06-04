/* eslint-disable react-refresh/only-export-components --
 * The provider and its consumer hooks are intentionally colocated as the single
 * data seam. This file is swapped for Convex queries/mutations later; the HMR
 * boundary is the provider, so fast-refresh of hooks isn't a concern here. */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { buildGraph, computeReadiness, runSimulation, type GraphModel } from "./derive";
import { makeSeedData } from "./seed";
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

/**
 * In-memory prototype store. This is the single seam between the UI and "the
 * backend": every screen reads through these hooks, so swapping to Convex
 * queries/mutations later means changing this file only — components stay put.
 */

export type NewAccountInput = Omit<Account, "id">;

type MockStore = {
  data: MapData;
  addAccount: (input: NewAccountInput) => string;
  updateAccount: (id: string, patch: Partial<Account>) => void;
  addDevice: (input: Omit<Device, "id">) => string;
  updateDevice: (id: string, patch: Partial<Device>) => void;
  addAuthenticatorApp: (input: Omit<AuthenticatorApp, "id">) => string;
  updateAuthenticatorApp: (id: string, patch: Partial<AuthenticatorApp>) => void;
  deleteAuthenticatorApp: (id: string) => void;
  addPhoneNumber: (input: Omit<PhoneNumber, "id">) => string;
  updatePhoneNumber: (id: string, patch: Partial<PhoneNumber>) => void;
  deletePhoneNumber: (id: string) => void;
  reset: () => void;
};

const MockDataContext = createContext<MockStore | null>(null);

const newId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function MockDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<MapData>(() => makeSeedData());

  const addAccount = useCallback((input: NewAccountInput) => {
    const id = newId("acc");
    setData((prev) => ({ ...prev, accounts: [...prev.accounts, { ...input, id }] }));
    return id;
  }, []);

  const updateAccount = useCallback((id: string, patch: Partial<Account>) => {
    setData((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
  }, []);

  const addDevice = useCallback((input: Omit<Device, "id">) => {
    const id = newId("dev");
    setData((prev) => ({ ...prev, devices: [...prev.devices, { ...input, id }] }));
    return id;
  }, []);

  const updateDevice = useCallback((id: string, patch: Partial<Device>) => {
    setData((prev) => ({
      ...prev,
      devices: prev.devices.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    }));
  }, []);

  const addAuthenticatorApp = useCallback((input: Omit<AuthenticatorApp, "id">) => {
    const id = newId("auth");
    setData((prev) => ({
      ...prev,
      authenticatorApps: [...prev.authenticatorApps, { ...input, id }],
    }));
    return id;
  }, []);

  const updateAuthenticatorApp = useCallback((id: string, patch: Partial<AuthenticatorApp>) => {
    setData((prev) => ({
      ...prev,
      authenticatorApps: prev.authenticatorApps.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
  }, []);

  const deleteAuthenticatorApp = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      authenticatorApps: prev.authenticatorApps.filter((a) => a.id !== id),
    }));
  }, []);

  const addPhoneNumber = useCallback((input: Omit<PhoneNumber, "id">) => {
    const id = newId("ph");
    setData((prev) => ({ ...prev, phoneNumbers: [...prev.phoneNumbers, { ...input, id }] }));
    return id;
  }, []);

  const updatePhoneNumber = useCallback((id: string, patch: Partial<PhoneNumber>) => {
    setData((prev) => ({
      ...prev,
      phoneNumbers: prev.phoneNumbers.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  }, []);

  const deletePhoneNumber = useCallback((id: string) => {
    setData((prev) => ({ ...prev, phoneNumbers: prev.phoneNumbers.filter((p) => p.id !== id) }));
  }, []);

  const reset = useCallback(() => setData(makeSeedData()), []);

  const value = useMemo<MockStore>(
    () => ({
      data,
      addAccount,
      updateAccount,
      addDevice,
      updateDevice,
      addAuthenticatorApp,
      updateAuthenticatorApp,
      deleteAuthenticatorApp,
      addPhoneNumber,
      updatePhoneNumber,
      deletePhoneNumber,
      reset,
    }),
    [
      data,
      addAccount,
      updateAccount,
      addDevice,
      updateDevice,
      addAuthenticatorApp,
      updateAuthenticatorApp,
      deleteAuthenticatorApp,
      addPhoneNumber,
      updatePhoneNumber,
      deletePhoneNumber,
      reset,
    ],
  );

  return <MockDataContext.Provider value={value}>{children}</MockDataContext.Provider>;
}

function useStore(): MockStore {
  const ctx = useContext(MockDataContext);
  if (!ctx) throw new Error("useStore must be used within <MockDataProvider>");
  return ctx;
}

// --- Read/write hooks consumed by screens -------------------------------------

export function useInventory() {
  const store = useStore();
  const { data } = store;
  return {
    accounts: data.accounts,
    devices: data.devices,
    authenticatorApps: data.authenticatorApps,
    phoneNumbers: data.phoneNumbers,
    addAccount: store.addAccount,
    updateAccount: store.updateAccount,
    addDevice: store.addDevice,
    updateDevice: store.updateDevice,
    addAuthenticatorApp: store.addAuthenticatorApp,
    updateAuthenticatorApp: store.updateAuthenticatorApp,
    deleteAuthenticatorApp: store.deleteAuthenticatorApp,
    addPhoneNumber: store.addPhoneNumber,
    updatePhoneNumber: store.updatePhoneNumber,
    deletePhoneNumber: store.deletePhoneNumber,
  };
}

export function useDeviceById(id: string | undefined) {
  const { data } = useStore();
  return id ? data.devices.find((d) => d.id === id) : undefined;
}

export function useAccount(id: string | undefined): Account | undefined {
  const { data } = useStore();
  return id ? data.accounts.find((a) => a.id === id) : undefined;
}

export function useDevice(id: string | undefined): Device | undefined {
  const { data } = useStore();
  return id ? data.devices.find((d) => d.id === id) : undefined;
}

export function useGraph(lifeArea?: LifeArea): GraphModel {
  const { data } = useStore();
  return useMemo(() => buildGraph(data, lifeArea), [data, lifeArea]);
}

export function useReadiness(): Readiness {
  const { data } = useStore();
  return useMemo(() => computeReadiness(data), [data]);
}

export function useSimulation(kind: SimulationKind, targetId?: string): SimulationResult {
  const { data } = useStore();
  return useMemo(() => runSimulation(data, kind, targetId), [data, kind, targetId]);
}

export function useResetMap() {
  return useStore().reset;
}
