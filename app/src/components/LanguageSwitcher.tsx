import { Check, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocale } from "@/hooks/useLocale";

type LanguageSwitcherProps = {
  /** "full" shows the language label; "compact" is an icon-only square button. */
  variant?: "full" | "compact";
  className?: string;
};

export function LanguageSwitcher({
  variant = "full",
  className,
}: LanguageSwitcherProps) {
  const { locale, setLocale, supported } = useLocale();
  const current = supported.find((l) => l.code === locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "compact" ? (
          <Button
            variant="outline"
            size="icon"
            aria-label="Change language"
            className={className}
          >
            <Languages className="size-4" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" className={className}>
            <Languages className="size-4" />
            {current?.label ?? locale}
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {supported.map(({ code, label }) => (
          <DropdownMenuItem key={code} onSelect={() => setLocale(code)}>
            {label}
            {code === locale && <Check className="ml-auto size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LanguageSwitcher;
