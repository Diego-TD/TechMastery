import { UserButton } from "@clerk/clerk-react";
import { Boxes, FlaskConical, Gauge, LayoutDashboard, Network } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet } from "react-router";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { QuickAddFab } from "@/features/inventory/QuickAddFab";
import { cn } from "@/lib/utils";

type TFunc = ReturnType<typeof useTranslation>["t"];

type NavItem = {
  to: string;
  end?: boolean;
  Icon: typeof LayoutDashboard;
  label: (t: TFunc) => string;
};

const NAV_ITEMS: ReadonlyArray<NavItem> = [
  {
    to: "/app",
    end: true,
    Icon: LayoutDashboard,
    label: (t) => t(($) => $.nav.overview),
  },
  { to: "/app/map", Icon: Network, label: (t) => t(($) => $.nav.map) },
  { to: "/app/inventory", Icon: Boxes, label: (t) => t(($) => $.nav.inventory) },
  {
    to: "/app/readiness",
    Icon: Gauge,
    label: (t) => t(($) => $.nav.readiness),
  },
  {
    to: "/app/simulations",
    Icon: FlaskConical,
    label: (t) => t(($) => $.nav.simulations),
  },
];

/** Shared shell for the authenticated app section with responsive navigation. */
export function AppLayout() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <NavLink to="/app" className="font-serif text-lg font-semibold">
          {t(($) => $.shell.title)}
        </NavLink>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map(({ to, end, Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )
              }
            >
              <Icon className="size-4" />
              {label(t)}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher variant="compact" />
          <ThemeToggle variant="compact" />
          <UserButton />
        </div>
      </header>

      <main className="flex flex-1 flex-col px-4 py-6 pb-24 md:pb-6">
        <Outlet />
      </main>

      <QuickAddFab />

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-10 flex items-stretch border-t bg-background/95 backdrop-blur md:hidden">
        {NAV_ITEMS.map(({ to, end, Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )
            }
          >
            <Icon className="size-5" />
            {label(t)}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default AppLayout;
