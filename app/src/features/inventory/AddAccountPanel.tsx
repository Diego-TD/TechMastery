import { useTranslation } from "react-i18next";
import type { LifeArea } from "@shared/enums";
import { useInventory } from "@/lib/mock/store";
import { ResponsivePanel } from "@/features/shared/ResponsivePanel";
import { AccountForm } from "./AccountForm";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lockedLifeArea?: LifeArea;
  onAdded?: (id: string) => void;
};

export function AddAccountPanel({ open, onOpenChange, lockedLifeArea, onAdded }: Props) {
  const { t } = useTranslation();
  const { accounts, devices, addAccount } = useInventory();

  return (
    <ResponsivePanel
      open={open}
      onOpenChange={onOpenChange}
      title={t(($) => $.accountForm.addTitle)}
      description={t(($) => $.accountForm.subtitle)}
    >
      <AccountForm
        accounts={accounts}
        devices={devices}
        lockedLifeArea={lockedLifeArea}
        onSubmit={(input) => {
          const id = addAccount(input);
          onOpenChange(false);
          onAdded?.(id);
        }}
        onCancel={() => onOpenChange(false)}
      />
    </ResponsivePanel>
  );
}
