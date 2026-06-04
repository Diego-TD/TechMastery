import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useInventory } from "@/lib/inventory/store";
import { ResponsivePanel } from "@/features/shared/ResponsivePanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

export function AddPhoneNumberPanel({ open, onOpenChange }: Props) {
  const { t } = useTranslation();
  const { addPhoneNumber } = useInventory();
  const [label, setLabel] = useState("");

  const submit = async () => {
    if (!label.trim()) return;
    await addPhoneNumber({ label: label.trim() });
    setLabel("");
    onOpenChange(false);
    toast.success(t(($) => $.toasts.phoneAdded));
  };

  return (
    <ResponsivePanel
      open={open}
      onOpenChange={onOpenChange}
      title={t(($) => $.inventory.addPhoneNumber)}
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
            {t(($) => $.inventory.phoneNumber)} <span className="text-destructive">*</span>
          </Label>
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={t(($) => $.accountForm.newPhonePlaceholder)}
            inputMode="tel"
            autoFocus
            required
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1" disabled={!label.trim()}>
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
