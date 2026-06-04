import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Boxes, KeyRound, Plus } from "lucide-react";
import { AddAccountPanel } from "./AddAccountPanel";
import { AddDevicePanel } from "./AddDevicePanel";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Global quick-add. Accounts are added far more often than devices, so the FAB
 * leads with account and tucks device behind the same menu.
 */
export function QuickAddFab() {
  const { t } = useTranslation();
  const [addingAccount, setAddingAccount] = useState(false);
  const [addingDevice, setAddingDevice] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            className="fixed bottom-20 right-4 z-20 size-14 rounded-full shadow-lg md:bottom-6 md:right-6"
            aria-label={t(($) => $.inventory.addAccount)}
          >
            <Plus className="size-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="mb-2">
          <DropdownMenuItem onSelect={() => setAddingAccount(true)}>
            <KeyRound className="size-4" />
            {t(($) => $.inventory.addAccount)}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setAddingDevice(true)}>
            <Boxes className="size-4" />
            {t(($) => $.inventory.addDevice)}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AddAccountPanel open={addingAccount} onOpenChange={setAddingAccount} />
      <AddDevicePanel open={addingDevice} onOpenChange={setAddingDevice} />
    </>
  );
}
