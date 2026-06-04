import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useInventory } from "@/lib/mock/store";
import { authenticatorAppUsage, phoneUsage } from "@/lib/mock/derive";
import { ResponsivePanel } from "@/features/shared/ResponsivePanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type EntityRef = { kind: "phone" | "authApp"; id: string };

/** View/edit/delete a phone number or authenticator app, guarding deletion when
 * accounts still depend on it. */
export function EntityDetailPanel({
  entity,
  open,
  onOpenChange,
}: {
  entity: EntityRef | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const {
    accounts,
    phoneNumbers,
    authenticatorApps,
    updatePhoneNumber,
    deletePhoneNumber,
    updateAuthenticatorApp,
    deleteAuthenticatorApp,
  } = useInventory();

  const isPhone = entity?.kind === "phone";
  const record = entity
    ? isPhone
      ? phoneNumbers.find((p) => p.id === entity.id)
      : authenticatorApps.find((a) => a.id === entity.id)
    : undefined;

  // The parent keys this component by entity id, so this init runs per entity.
  const [name, setName] = useState(() =>
    record ? ("label" in record ? record.label : record.name) : "",
  );

  if (!entity || !record) return null;

  const dependents = isPhone
    ? phoneUsage(accounts, entity.id)
    : authenticatorAppUsage(accounts, entity.id);
  const canDelete = dependents.length === 0;

  const save = () => {
    if (!name.trim()) return;
    if (isPhone) updatePhoneNumber(entity.id, { label: name.trim() });
    else updateAuthenticatorApp(entity.id, { name: name.trim() });
    onOpenChange(false);
    toast.success(t(($) => $.toasts.saved));
  };

  const remove = () => {
    if (!canDelete) return;
    if (isPhone) deletePhoneNumber(entity.id);
    else deleteAuthenticatorApp(entity.id);
    onOpenChange(false);
    toast.success(t(($) => $.toasts.deleted));
  };

  return (
    <ResponsivePanel
      open={open}
      onOpenChange={onOpenChange}
      title={isPhone ? t(($) => $.inventory.phoneNumber) : t(($) => $.inventory.authApp)}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label>{isPhone ? t(($) => $.inventory.phoneNumber) : t(($) => $.deviceForm.name)}</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>

        {dependents.length > 0 && (
          <div className="rounded-lg border p-3 text-sm">
            <div className="mb-1 text-muted-foreground">{t(($) => $.inventory.usedByTitle)}</div>
            <div className="flex flex-wrap gap-1.5">
              {dependents.map((a) => (
                <span key={a.id} className="rounded-md border px-2 py-0.5 text-xs">
                  {a.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button className="flex-1" onClick={save} disabled={!name.trim()}>
            {t(($) => $.common.save)}
          </Button>
          <Button
            variant="outline"
            onClick={remove}
            disabled={!canDelete}
            title={canDelete ? undefined : t(($) => $.inventory.cannotDelete)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
        {!canDelete && (
          <p className="-mt-2 text-xs text-muted-foreground">{t(($) => $.inventory.cannotDelete)}</p>
        )}
      </div>
    </ResponsivePanel>
  );
}
