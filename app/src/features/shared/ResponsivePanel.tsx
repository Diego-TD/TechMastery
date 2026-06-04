import { useRef, type ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
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

const MENU_CONTENT_SELECTOR =
  "[data-radix-popper-content-wrapper],[data-radix-select-viewport],[data-slot='select-content'],[data-slot='dropdown-menu-content']";
const FLOATING_CONTENT_SELECTOR = `${MENU_CONTENT_SELECTOR},[data-sonner-toaster]`;
const SELECT_OPEN_SELECTOR = "[data-tm-select-open]";

/** True when an event target lives inside a Radix popover, Select, or toast. */
function fromFloatingContent(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest(FLOATING_CONTENT_SELECTOR));
}

function openFloatingContentInsideDrawer(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    Boolean(target.closest("[data-slot='drawer-content']")) &&
    Boolean(document.querySelector(MENU_CONTENT_SELECTOR))
  );
}

function selectDismissalInProgress(): boolean {
  return typeof document !== "undefined" && Boolean(document.querySelector(SELECT_OPEN_SELECTOR));
}

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
  const ignoreNextDrawerCloseRef = useRef(false);

  if (isMobile) {
    return (
      <Drawer
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && (ignoreNextDrawerCloseRef.current || selectDismissalInProgress())) {
            ignoreNextDrawerCloseRef.current = false;
            return;
          }
          onOpenChange(nextOpen);
        }}
      >
        <DrawerContent
          className="bg-background"
          // A tap on an open Select/dropdown (portaled outside the drawer) must
          // NOT dismiss the drawer and lose the user's input.
          onPointerDownCapture={(e) => {
            if (openFloatingContentInsideDrawer(e.target)) {
              ignoreNextDrawerCloseRef.current = true;
            }
          }}
          onPointerDownOutside={(e) => {
            if (fromFloatingContent(e.target) || openFloatingContentInsideDrawer(e.target)) e.preventDefault();
          }}
          onInteractOutside={(e) => {
            if (fromFloatingContent(e.target) || openFloatingContentInsideDrawer(e.target)) e.preventDefault();
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
