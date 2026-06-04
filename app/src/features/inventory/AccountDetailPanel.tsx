import { useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyRound, Lightbulb, Pencil } from "lucide-react";
import { useAccount, useInventory, useReadiness } from "@/lib/mock/store";
import type { Account } from "@/lib/mock/types";
import { LIFE_AREA_ICON, IMPORTANCE_BADGE, RECOVERY_ICON } from "@/features/shared/display";
import { ResponsivePanel } from "@/features/shared/ResponsivePanel";
import { AccountForm } from "./AccountForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type Props = {
  accountId: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AccountDetailPanel({ accountId, open, onOpenChange }: Props) {
  const { t } = useTranslation();
  const account = useAccount(accountId);
  const { accounts, devices, updateAccount } = useInventory();
  const readiness = useReadiness();
  const [editing, setEditing] = useState(false);
  const improvements = readiness.actions.filter((a) => a.targetId === accountId);

  // Reset to read mode as the panel closes (no effect needed).
  const handleOpenChange = (next: boolean) => {
    if (!next) setEditing(false);
    onOpenChange(next);
  };

  if (!account) return null;
  const AreaIcon = LIFE_AREA_ICON[account.lifeArea];

  return (
    <ResponsivePanel
      open={open}
      onOpenChange={handleOpenChange}
      title={editing ? t(($) => $.accountForm.editTitle) : account.name}
      description={editing ? undefined : t(($) => $.lifeAreas[account.lifeArea])}
    >
      {editing ? (
        <AccountForm
          accounts={accounts}
          devices={devices}
          initial={account}
          onSubmit={(input) => {
            updateAccount(account.id, input);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <AreaIcon className="size-4 text-muted-foreground" />
            <Badge variant={IMPORTANCE_BADGE[account.importance]}>
              {t(($) => $.account.importance[account.importance])}
            </Badge>
          </div>

          <dl className="flex flex-col gap-3 text-sm">
            <Row label={t(($) => $.accountForm.authMethod)}>
              {t(($) => $.account.authMethods[account.authMethod])}
            </Row>
            <Row label={t(($) => $.accountForm.twoFactor)}>
              {t(($) => $.account.twoFactor[account.twoFactor])}
            </Row>
            <Row label={t(($) => $.accountForm.recovery)}>
              <span className="inline-flex items-center gap-1.5">
                <RECOVERY_ICON className="size-3.5 text-muted-foreground" />
                {t(($) => $.account.recoveryMethods[account.recovery])}
              </span>
            </Row>
            {account.socialLoginAccountId && (
              <Row label={t(($) => $.inventory.signsInWith)}>
                {nameOf(accounts, account.socialLoginAccountId)}
              </Row>
            )}
            {account.recoveryEmailAccountId && (
              <Row label={t(($) => $.account.recoveryMethods.email)}>
                {nameOf(accounts, account.recoveryEmailAccountId)}
              </Row>
            )}
            {account.recoveryPhoneNumber && (
              <Row label={t(($) => $.account.recoveryMethods.phone)}>
                {account.recoveryPhoneNumber}
              </Row>
            )}
            {account.deviceIds.length > 0 && (
              <Row label={t(($) => $.inventory.usedOn)}>
                {account.deviceIds.map((id) => devices.find((d) => d.id === id)?.name).filter(Boolean).join(", ")}
              </Row>
            )}
            {account.keyFile && (
              <Row label={t(($) => $.inventory.keyFile)}>
                <span className="inline-flex items-center gap-1.5">
                  <KeyRound className="size-3.5 text-muted-foreground" />
                  {account.keyFile.label}
                  {account.keyFile.location && (
                    <span className="text-muted-foreground">· {account.keyFile.location}</span>
                  )}
                </span>
              </Row>
            )}
            {account.hasBackupCodes && account.backupCodesLocation && (
              <Row label={t(($) => $.accountForm.backupCodesLocation)}>
                {account.backupCodesLocation}
              </Row>
            )}
          </dl>

          {improvements.length > 0 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
              <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-400">
                <Lightbulb className="size-4" />
                {t(($) => $.account.improveTitle)}
              </div>
              <ul className="flex flex-col gap-2">
                {improvements.map((a) => (
                  <li key={a.id} className="text-sm">
                    <div className="font-medium">{t(($) => $.actions[a.kind].title, { name: account.name })}</div>
                    <div className="text-xs text-muted-foreground">{t(($) => $.actions[a.kind].why)}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {account.notes && (
            <>
              <Separator />
              <p className="text-sm text-muted-foreground">{account.notes}</p>
            </>
          )}

          <Button variant="outline" className="mt-1 w-fit" onClick={() => setEditing(true)}>
            <Pencil className="size-4" />
            {t(($) => $.common.edit)}
          </Button>
        </div>
      )}
    </ResponsivePanel>
  );
}

function nameOf(accounts: Account[], id: string) {
  return accounts.find((a) => a.id === id)?.name ?? id;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}
