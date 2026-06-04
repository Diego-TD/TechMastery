import { createContext, useContext } from "react";

/**
 * The DOM node that popovers (Select, DropdownMenu) should portal into.
 *
 * When a panel is shown as a bottom Drawer on mobile, Radix would otherwise
 * portal Select content to <body> — *outside* the drawer — so tapping it reads
 * as an outside-interaction and dismisses the drawer (losing the user's input).
 * Pointing the portal at the drawer's own node keeps every tap "inside".
 */
export const PortalContainerContext = createContext<HTMLElement | null>(null);

export const usePortalContainer = () => useContext(PortalContainerContext);
