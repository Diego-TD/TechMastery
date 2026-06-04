import { useState, type ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { PortalContainerContext } from "./PortalContainer";
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
 * bottom Drawer on phone (quick, thumb-reachable). On mobile the drawer node is
 * exposed as the portal container so Select/dropdown content renders *inside*
 * the drawer — a tap on it no longer dismisses the sheet and loses input.
 */
export function ResponsivePanel({ open, onOpenChange, title, description, children }: Props) {
  const isMobile = useIsMobile();
  const [drawerEl, setDrawerEl] = useState<HTMLElement | null>(null);

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="bg-background">
          {/*
           * Plain wrapper div as the portal container (a ref on the shadcn
           * DrawerContent isn't guaranteed to reach a DOM node). Select/dropdown
           * content portals in here, so it's a real DOM child of the drawer and
           * a tap on it never reads as "outside" → the sheet stays open.
           */}
          <div ref={setDrawerEl} className="flex min-h-0 flex-1 flex-col">
            <PortalContainerContext.Provider value={drawerEl}>
              <DrawerHeader className="text-left">
                <DrawerTitle>{title}</DrawerTitle>
                {description && <DrawerDescription>{description}</DrawerDescription>}
              </DrawerHeader>
              <div className="overflow-y-auto px-4 pb-8">{children}</div>
            </PortalContainerContext.Provider>
          </div>
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
