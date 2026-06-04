import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Link2, Phone, Plus, ShieldCheck, type LucideIcon } from "lucide-react";
import { LIFE_AREAS } from "@shared/enums";
import { useInventory, useReadiness } from "@/lib/inventory/store";
import { dependencyFanIn } from "@/lib/inventory/derive";
import { EntityDetailPanel, type EntityRef } from "./EntityDetailPanel";
import type { Account, Device } from "@/lib/inventory/types";
import {
  DEVICE_ICON,
  IMPORTANCE_BADGE,
  LIFE_AREA_ICON,
} from "@/features/shared/display";
import { AddAccountPanel } from "./AddAccountPanel";
import { AccountDetailPanel } from "./AccountDetailPanel";
import { DeviceDetailPanel } from "./DeviceDetailPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ALL = "__all__";
type TypeTab = "all" | "accounts" | "devices" | "authApps" | "phones";

export function InventoryPage() {
  const { t } = useTranslation();
  const { accounts, devices, authenticatorApps, phoneNumbers } = useInventory();
  const readiness = useReadiness();
  const riskyIds = useMemo(
    () => new Set(readiness.actions.map((a) => a.targetId)),
    [readiness],
  );
  const fanIn = useMemo(() => dependencyFanIn(accounts), [accounts]);

  const [tab, setTab] = useState<TypeTab>("all");
  const [area, setArea] = useState<string>(ALL);
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [detailId, setDetailId] = useState<string | undefined>();
  const [detailDeviceId, setDetailDeviceId] = useState<string | undefined>();
  const [entityRef, setEntityRef] = useState<EntityRef | undefined>();

  const filteredAccounts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return accounts.filter(
      (a) =>
        (area === ALL || a.lifeArea === area) &&
        (q === "" || a.name.toLowerCase().includes(q)),
    );
  }, [accounts, area, query]);

  const filteredDevices = useMemo(() => {
    const q = query.trim().toLowerCase();
    return devices.filter((d) => q === "" || d.name.toLowerCase().includes(q));
  }, [devices, query]);
  const filteredAuthenticatorApps = useMemo(() => {
    const q = query.trim().toLowerCase();
    return authenticatorApps.filter((app) => q === "" || app.name.toLowerCase().includes(q));
  }, [authenticatorApps, query]);
  const filteredPhoneNumbers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return phoneNumbers.filter((phone) => q === "" || phone.label.toLowerCase().includes(q));
  }, [phoneNumbers, query]);

  const showAccounts = tab === "all" || tab === "accounts";
  // Devices have no life area, so hide them when filtering by one.
  const showDevices = (tab === "all" || tab === "devices") && area === ALL;
  const showAuthenticatorApps = tab === "authApps" || (tab === "all" && area === ALL);
  const showPhoneNumbers = tab === "phones" || (tab === "all" && (area === ALL || area === "phone"));
  const isEmpty =
    (!showAccounts || filteredAccounts.length === 0) &&
    (!showDevices || filteredDevices.length === 0) &&
    (!showAuthenticatorApps || filteredAuthenticatorApps.length === 0) &&
    (!showPhoneNumbers || filteredPhoneNumbers.length === 0);

  const openDetail = (id: string) => {
    setDetailId(id);
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <header>
        <h1 className="font-serif text-2xl font-semibold">{t(($) => $.inventory.title)}</h1>
        <p className="text-sm text-muted-foreground">{t(($) => $.inventory.subtitle)}</p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Tabs value={tab} onValueChange={(v) => setTab(v as TypeTab)} className="w-full sm:w-auto">
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger value="all">{t(($) => $.inventory.tabs.all)}</TabsTrigger>
            <TabsTrigger value="accounts">{t(($) => $.inventory.tabs.accounts)}</TabsTrigger>
            <TabsTrigger value="devices">{t(($) => $.inventory.tabs.devices)}</TabsTrigger>
            <TabsTrigger value="authApps">{t(($) => $.inventory.tabs.authApps)}</TabsTrigger>
            <TabsTrigger value="phones">{t(($) => $.inventory.tabs.phones)}</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex flex-1 gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t(($) => $.inventory.search)}
            className="flex-1"
          />
          {(tab === "all" || tab === "accounts") && (
            <Select value={area} onValueChange={setArea}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{t(($) => $.map.allAreas)}</SelectItem>
                {LIFE_AREAS.map((a) => (
                  <SelectItem key={a} value={a}>
                    {t(($) => $.lifeAreas[a])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {isEmpty ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Plus className="size-6" />
            </EmptyMedia>
            <EmptyTitle>{t(($) => $.inventory.emptyTitle)}</EmptyTitle>
            <EmptyDescription>{t(($) => $.inventory.emptyDesc)}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setAdding(true)}>{t(($) => $.inventory.emptyCta)}</Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="flex flex-col gap-2">
          {showAccounts &&
            filteredAccounts.map((a) => (
              <AccountCard
                key={a.id}
                account={a}
                risky={riskyIds.has(a.id)}
                dependents={fanIn.get(a.id)?.length ?? 0}
                onClick={() => openDetail(a.id)}
              />
            ))}
          {showDevices &&
            filteredDevices.map((d) => (
              <DeviceCard key={d.id} device={d} onClick={() => setDetailDeviceId(d.id)} />
            ))}

          {/* Phone numbers + authenticator apps are linkable entities too. */}
          {showAuthenticatorApps && filteredAuthenticatorApps.length > 0 && (
            <>
              <GroupLabel>{t(($) => $.inventory.authAppsTitle)}</GroupLabel>
              {filteredAuthenticatorApps.map((app) => (
                <EntityCard
                  key={app.id}
                  icon={ShieldCheck}
                  name={app.name}
                  onClick={() => setEntityRef({ kind: "authApp", id: app.id })}
                />
              ))}
            </>
          )}
          {showPhoneNumbers && filteredPhoneNumbers.length > 0 && (
            <>
              <GroupLabel>{t(($) => $.inventory.phonesTitle)}</GroupLabel>
              {filteredPhoneNumbers.map((p) => (
                <EntityCard
                  key={p.id}
                  icon={Phone}
                  name={p.label}
                  onClick={() => setEntityRef({ kind: "phone", id: p.id })}
                />
              ))}
            </>
          )}
        </div>
      )}

      <AddAccountPanel open={adding} onOpenChange={setAdding} onAdded={(id) => setDetailId(id)} />
      <AccountDetailPanel
        accountId={detailId}
        open={detailId !== undefined}
        onOpenChange={(o) => !o && setDetailId(undefined)}
      />
      <DeviceDetailPanel
        deviceId={detailDeviceId}
        open={detailDeviceId !== undefined}
        onOpenChange={(o) => !o && setDetailDeviceId(undefined)}
      />
      <EntityDetailPanel
        key={entityRef?.id}
        entity={entityRef}
        open={entityRef !== undefined}
        onOpenChange={(o) => !o && setEntityRef(undefined)}
      />
    </div>
  );
}

function AccountCard({
  account,
  risky,
  dependents,
  onClick,
}: {
  account: Account;
  risky: boolean;
  dependents: number;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  const AreaIcon = LIFE_AREA_ICON[account.lifeArea];

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
      className="cursor-pointer gap-0 p-3 transition-colors hover:bg-muted/50"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
          <AreaIcon className="size-4 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium">{account.name}</span>
            <Badge variant={IMPORTANCE_BADGE[account.importance]}>
              {t(($) => $.account.importance[account.importance])}
            </Badge>
            {dependents > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-muted-foreground" title={t(($) => $.inventory.dependedOnBy, { count: dependents })}>
                <Link2 className="size-3" />
                {dependents}
              </span>
            )}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {t(($) => $.lifeAreas[account.lifeArea])}
          </p>
        </div>
        {/* Red is reserved for real risk; a secure-but-critical account stays calm. */}
        {risky ? (
          <AlertTriangle className="size-4 shrink-0 text-amber-500" />
        ) : (
          <ShieldCheck className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        )}
      </div>
    </Card>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {children}
    </div>
  );
}

function EntityCard({
  icon: Icon,
  name,
  onClick,
}: {
  icon: LucideIcon;
  name: string;
  onClick: () => void;
}) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
      className="cursor-pointer gap-0 p-3 transition-colors hover:bg-muted/50"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <span className="truncate font-medium">{name}</span>
      </div>
    </Card>
  );
}

function DeviceCard({ device, onClick }: { device: Device; onClick: () => void }) {
  const { t } = useTranslation();
  const Icon = DEVICE_ICON[device.kind];
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
      className="cursor-pointer gap-0 p-3 transition-colors hover:bg-muted/50"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="truncate font-medium">{device.name}</span>
          <p className="truncate text-xs text-muted-foreground">
            {t(($) => $.deviceKinds[device.kind])} ·{" "}
            {device.lockMethods.map((l) => t(($) => $.deviceLock[l])).join(", ")}
          </p>
        </div>
      </div>
    </Card>
  );
}
