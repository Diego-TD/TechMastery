import type { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

/** True when an event target lives inside a Radix popover, Select, or toast. */
function fromPopover(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    Boolean(
      target.closest(
        "[data-radix-popper-content-wrapper],[data-radix-select-viewport],[data-slot='select-content'],[data-sonner-toaster]",
      ),
    )
  );
}
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
};

/**
 * One panel, two presentations: a right-side Sheet on laptop (deep work) and a
 * bottom Drawer on phone (quick, thumb-reachable). Used for both account detail
 * and the add/edit form.
 */
export function ResponsivePanel({ open, onOpenChange, title, description, children }: Props) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent
          className="bg-background"
          // A tap on an open Select/dropdown (portaled outside the drawer) must
          // NOT dismiss the drawer and lose the user's input.
          onPointerDownOutside={(e) => {
            if (fromPopover(e.target)) e.preventDefault();
          }}
          onInteractOutside={(e) => {
            if (fromPopover(e.target)) e.preventDefault();
          }}
        >
          <DrawerHeader className="text-left">
            <DrawerTitle>{title}</DrawerTitle>
            {description && <DrawerDescription>{description}</DrawerDescription>}
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-8">{children}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 pb-6">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
