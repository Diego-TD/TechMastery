import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";

type Theme = "light" | "dark" | "system";

const THEME_OPTIONS: ReadonlyArray<{ value: Theme; Icon: typeof Sun }> = [
  { value: "light", Icon: Sun },
  { value: "dark", Icon: Moon },
  { value: "system", Icon: Monitor },
];

type ThemeToggleProps = {
  /** "full" shows the active theme label; "compact" is an icon-only square button. */
  variant?: "full" | "compact";
  className?: string;
};

export function ThemeToggle({
  variant = "full",
  className,
}: ThemeToggleProps) {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const active = THEME_OPTIONS.find((o) => o.value === theme) ?? THEME_OPTIONS[0];
  const ActiveIcon = active.Icon;
  const themeLabel = (value: Theme) => t(($) => $.theme[value]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "compact" ? (
          <Button
            variant="outline"
            size="icon"
            aria-label={t(($) => $.theme.label)}
            className={className}
          >
            <ActiveIcon className="size-4" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" className={className}>
            <ActiveIcon className="size-4" />
            {themeLabel(active.value)}
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {THEME_OPTIONS.map(({ value, Icon }) => (
          <DropdownMenuItem key={value} onSelect={() => setTheme(value)}>
            <Icon className="size-4" />
            {themeLabel(value)}
            {value === theme && <Check className="ml-auto size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ThemeToggle;
