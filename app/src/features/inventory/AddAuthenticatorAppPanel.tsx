import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useInventory } from "@/lib/inventory/store";
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

const NONE = "__none__";

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

export function AddAuthenticatorAppPanel({ open, onOpenChange }: Props) {
  const { t } = useTranslation();
  const { devices, addAuthenticatorApp } = useInventory();
  const [name, setName] = useState("");
  const [deviceId, setDeviceId] = useState(NONE);

  const submit = async () => {
    if (!name.trim()) return;
    await addAuthenticatorApp({
      name: name.trim(),
      deviceId: deviceId === NONE ? undefined : deviceId,
    });
    setName("");
    setDeviceId(NONE);
    onOpenChange(false);
    toast.success(t(($) => $.toasts.authAppAdded));
  };

  return (
    <ResponsivePanel
      open={open}
      onOpenChange={onOpenChange}
      title={t(($) => $.inventory.addAuthenticatorApp)}
    >
      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <div className="flex flex-col gap-1.5">
          <Label>
            {t(($) => $.inventory.authApp)} <span className="text-destructive">*</span>
          </Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t(($) => $.accountForm.newAuthAppPlaceholder)}
            autoFocus
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>{t(($) => $.inventory.runsOnDevice)}</Label>
          <Select value={deviceId} onValueChange={setDeviceId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>{t(($) => $.inventory.noDevice)}</SelectItem>
              {devices.map((device) => (
                <SelectItem key={device.id} value={device.id}>
                  {device.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1" disabled={!name.trim()}>
            {t(($) => $.common.save)}
          </Button>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t(($) => $.common.cancel)}
          </Button>
        </div>
      </form>
    </ResponsivePanel>
  );
}
