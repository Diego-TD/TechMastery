export const languages = {
  en: "English",
  es: "Español",
} as const;

export const defaultLang = "en";
export const showDefaultLang = false;

export type Lang = keyof typeof languages;

export function isLang(value: string | undefined): value is Lang {
  return value === "en" || value === "es";
}
