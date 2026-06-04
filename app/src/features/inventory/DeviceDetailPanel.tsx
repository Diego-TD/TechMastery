import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { useDeviceById, useInventory } from "@/lib/inventory/store";
import { DEVICE_ICON } from "@/features/shared/display";
import { ResponsivePanel } from "@/features/shared/ResponsivePanel";
import { DeviceForm } from "./DeviceForm";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type Props = {
  deviceId: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeviceDetailPanel({ deviceId, open, onOpenChange }: Props) {
  const { t } = useTranslation();
  const device = useDeviceById(deviceId);
  const { accounts, updateDevice } = useInventory();
  const [editing, setEditing] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (!next) setEditing(false);
    onOpenChange(next);
  };

  if (!device) return null;
  const Icon = DEVICE_ICON[device.kind];
  const onThisDevice = accounts.filter((a) => a.deviceIds.includes(device.id));

  return (
    <ResponsivePanel
      open={open}
      onOpenChange={handleOpenChange}
      title={editing ? t(($) => $.deviceForm.editTitle) : device.name}
      description={editing ? undefined : t(($) => $.deviceKinds[device.kind])}
    >
      {editing ? (
        <DeviceForm
          initial={device}
          onSubmit={async (input) => {
            await updateDevice(device.id, input);
            setEditing(false);
            toast.success(t(($) => $.toasts.deviceUpdated));
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-muted">
              <Icon className="size-5 text-muted-foreground" />
            </div>
          </div>

          <dl className="flex flex-col gap-3 text-sm">
            <Row label={t(($) => $.deviceForm.lock)}>
              {device.lockMethods.map((l) => t(($) => $.deviceLock[l])).join(", ")}
            </Row>
            <Row label={t(($) => $.deviceForm.findMy)}>
              {device.findMyEnabled ? t(($) => $.common.yes) : t(($) => $.common.no)}
            </Row>
          </dl>

          <Separator />
          <div>
            <div className="mb-2 text-sm font-medium">{t(($) => $.inventory.onThisDevice)}</div>
            {onThisDevice.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t(($) => $.inventory.noDevice)}</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {onThisDevice.map((a) => (
                  <span key={a.id} className="rounded-md border px-2 py-1 text-xs">
                    {a.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <Button variant="outline" className="w-fit" onClick={() => setEditing(true)}>
            <Pencil className="size-4" />
            {t(($) => $.common.edit)}
          </Button>
        </div>
      )}
    </ResponsivePanel>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}
