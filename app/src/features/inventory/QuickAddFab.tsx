import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Boxes, KeyRound, Plus, ShieldCheck, Smartphone } from "lucide-react";
import { AddAccountPanel } from "./AddAccountPanel";
import { AddAuthenticatorAppPanel } from "./AddAuthenticatorAppPanel";
import { AddDevicePanel } from "./AddDevicePanel";
import { AddPhoneNumberPanel } from "./AddPhoneNumberPanel";
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
  const [addingAuthApp, setAddingAuthApp] = useState(false);
  const [addingPhone, setAddingPhone] = useState(false);

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
          <DropdownMenuItem onSelect={() => setAddingAuthApp(true)}>
            <ShieldCheck className="size-4" />
            {t(($) => $.inventory.addAuthenticatorApp)}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setAddingPhone(true)}>
            <Smartphone className="size-4" />
            {t(($) => $.inventory.addPhoneNumber)}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AddAccountPanel open={addingAccount} onOpenChange={setAddingAccount} />
      <AddDevicePanel open={addingDevice} onOpenChange={setAddingDevice} />
      <AddAuthenticatorAppPanel open={addingAuthApp} onOpenChange={setAddingAuthApp} />
      <AddPhoneNumberPanel open={addingPhone} onOpenChange={setAddingPhone} />
    </>
  );
}
