import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { DeviceKind } from "@shared/enums";
import type { DeviceLock } from "@/lib/mock/types";
import { useInventory } from "@/lib/mock/store";
import { DEVICE_KINDS, DEVICE_LOCKS } from "@/features/shared/options";
import { ResponsivePanel } from "@/features/shared/ResponsivePanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

export function AddDevicePanel({ open, onOpenChange }: Props) {
  const { t } = useTranslation();
  const { addDevice } = useInventory();

  const [name, setName] = useState("");
  const [kind, setKind] = useState<DeviceKind>("phone");
  const [lock, setLock] = useState<DeviceLock>("biometric");
  const [findMyEnabled, setFindMy] = useState(true);

  const reset = () => {
    setName("");
    setKind("phone");
    setLock("biometric");
    setFindMy(true);
  };

  const submit = () => {
    if (!name.trim()) return;
    addDevice({ name: name.trim(), kind, lock, findMyEnabled });
    reset();
    onOpenChange(false);
  };

  return (
    <ResponsivePanel
      open={open}
      onOpenChange={onOpenChange}
      title={t(($) => $.deviceForm.addTitle)}
    >
      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="flex flex-col gap-1.5">
          <Label>{t(($) => $.deviceForm.name)}</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t(($) => $.deviceForm.namePlaceholder)}
            autoFocus
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>{t(($) => $.deviceForm.kind)}</Label>
            <Select value={kind} onValueChange={(v) => setKind(v as DeviceKind)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEVICE_KINDS.map((k) => (
                  <SelectItem key={k} value={k}>
                    {t(($) => $.deviceKinds[k])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>{t(($) => $.deviceForm.lock)}</Label>
            <Select value={lock} onValueChange={(v) => setLock(v as DeviceLock)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEVICE_LOCKS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {t(($) => $.deviceLock[l])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border p-3">
          <Label htmlFor="findmy-switch" className="font-normal">
            {t(($) => $.deviceForm.findMy)}
          </Label>
          <Switch id="findmy-switch" checked={findMyEnabled} onCheckedChange={setFindMy} />
        </div>

        <Button type="submit" disabled={!name.trim()}>
          {t(($) => $.common.save)}
        </Button>
      </form>
    </ResponsivePanel>
  );
}
