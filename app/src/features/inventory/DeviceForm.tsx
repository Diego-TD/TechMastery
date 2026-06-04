import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { DeviceKind } from "@shared/enums";
import type { Device, DeviceLock } from "@/lib/inventory/types";
import { DEVICE_KINDS, DEVICE_LOCKS } from "@/features/shared/options";
import { ChipChoice } from "@/features/shared/ChipChoice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Props = {
  initial?: Device;
  onSubmit: (input: Omit<Device, "id">) => void | Promise<void>;
  onCancel?: () => void;
};

export function DeviceForm({ initial, onSubmit, onCancel }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState(initial?.name ?? "");
  const [kind, setKind] = useState<DeviceKind>(initial?.kind ?? "phone");
  const [lockMethods, setLockMethods] = useState<DeviceLock[]>(initial?.lockMethods ?? ["unknown"]);
  const [findMyEnabled, setFindMy] = useState(initial?.findMyEnabled ?? true);

  // "None" and "Not sure" are exclusive; real locks can combine.
  const toggleLock = (m: DeviceLock) => {
    setLockMethods((prev) => {
      if (m === "none" || m === "unknown") return [m];
      const real = prev.filter((x) => x !== "none" && x !== "unknown");
      const next = real.includes(m) ? real.filter((x) => x !== m) : [...real, m];
      return next.length === 0 ? ["unknown"] : next;
    });
  };

  const submit = async () => {
    if (!name.trim()) return;
    await onSubmit({ name: name.trim(), kind, lockMethods, findMyEnabled, notes: initial?.notes });
  };

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <div className="flex flex-col gap-1.5">
        <Label>
          {t(($) => $.deviceForm.name)} <span className="text-destructive">*</span>
        </Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t(($) => $.deviceForm.namePlaceholder)}
          autoFocus
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>{t(($) => $.deviceForm.kind)}</Label>
        <ChipChoice
          value={kind}
          onChange={(v) => setKind(v as DeviceKind)}
          options={DEVICE_KINDS.map((k) => ({ value: k, label: t(($) => $.deviceKinds[k]) }))}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>{t(($) => $.deviceForm.lock)}</Label>
        <ChipChoice
          multiple
          value={lockMethods}
          onToggle={(v) => toggleLock(v as DeviceLock)}
          options={DEVICE_LOCKS.map((l) => ({ value: l, label: t(($) => $.deviceLock[l]) }))}
        />
      </div>

      <div className="flex items-center justify-between rounded-md border p-3">
        <Label htmlFor="findmy-switch" className="font-normal">
          {t(($) => $.deviceForm.findMy)}
        </Label>
        <Switch id="findmy-switch" checked={findMyEnabled} onCheckedChange={setFindMy} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={!name.trim()}>
          {t(($) => $.common.save)}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t(($) => $.common.cancel)}
          </Button>
        )}
      </div>
    </form>
  );
}
