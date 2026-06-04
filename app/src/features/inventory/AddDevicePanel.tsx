import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useInventory } from "@/lib/mock/store";
import { ResponsivePanel } from "@/features/shared/ResponsivePanel";
import { DeviceForm } from "./DeviceForm";

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

export function AddDevicePanel({ open, onOpenChange }: Props) {
  const { t } = useTranslation();
  const { addDevice } = useInventory();

  return (
    <ResponsivePanel open={open} onOpenChange={onOpenChange} title={t(($) => $.deviceForm.addTitle)}>
      <DeviceForm
        onSubmit={async (input) => {
          await addDevice(input);
          onOpenChange(false);
          toast.success(t(($) => $.toasts.deviceAdded));
        }}
        onCancel={() => onOpenChange(false)}
      />
    </ResponsivePanel>
  );
}
