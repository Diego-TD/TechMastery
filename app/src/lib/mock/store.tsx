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
  addAuthenticatorApp: (input: Omit<AuthenticatorApp, "id">) => string;
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

  const addAuthenticatorApp = useCallback((input: Omit<AuthenticatorApp, "id">) => {
    const id = newId("auth");
    setData((prev) => ({
      ...prev,
      authenticatorApps: [...prev.authenticatorApps, { ...input, id }],
    }));
    return id;
  }, []);

  const reset = useCallback(() => setData(makeSeedData()), []);

  const value = useMemo<MockStore>(
    () => ({ data, addAccount, updateAccount, addDevice, addAuthenticatorApp, reset }),
    [data, addAccount, updateAccount, addDevice, addAuthenticatorApp, reset],
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
  const { data, addAccount, updateAccount, addDevice, addAuthenticatorApp } = useStore();
  return {
    accounts: data.accounts,
    devices: data.devices,
    authenticatorApps: data.authenticatorApps,
    addAccount,
    updateAccount,
    addDevice,
    addAuthenticatorApp,
  };
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

export function useSimulation(kind: SimulationKind): SimulationResult {
  const { data } = useStore();
  return useMemo(() => runSimulation(data, kind), [data, kind]);
}

export function useResetMap() {
  return useStore().reset;
}
