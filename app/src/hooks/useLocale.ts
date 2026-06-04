import { useTranslation } from "react-i18next";
import type { AppLocale } from "@/lib/i18n-resources";

export const SUPPORTED_LOCALES: ReadonlyArray<{
  code: AppLocale;
  label: string;
}> = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
];

/**
 * Reads and switches the active locale.
 *
 * `setLocale` reloads the page after changing the language so that
 * `ClerkProvider` re-reads its `localization` prop at mount (Clerk does not
 * support changing localization live). The detector caches the
 * choice to localStorage, so the new language survives the reload.
 */
export function useLocale() {
  const { i18n } = useTranslation();

  const locale = (i18n.resolvedLanguage ?? "en") as AppLocale;

  const setLocale = (code: AppLocale) => {
    if (code === locale) return;
    void i18n.changeLanguage(code);
    window.location.reload();
  };

  return { locale, setLocale, supported: SUPPORTED_LOCALES };
}
