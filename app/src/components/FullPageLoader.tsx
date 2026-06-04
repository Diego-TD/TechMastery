import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/ui/spinner";

/** Centered, theme-aware loading screen used while session state resolves. */
export function FullPageLoader() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 bg-background text-muted-foreground">
      <Spinner className="size-6" />
      <p className="text-sm">{t(($) => $.shell.loading)}</p>
    </div>
  );
}

export default FullPageLoader;
