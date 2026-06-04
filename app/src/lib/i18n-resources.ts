import en from "@locales/en/app.json";
import es from "@locales/es/app.json";

// One broad namespace per language keeps all keys in a single JSON file.
export const defaultNS = "app" as const;

export const resources = {
  en: { app: en },
  es: { app: es },
} as const;

export const supportedLngs = ["en", "es"] as const;
export type AppLocale = (typeof supportedLngs)[number];
