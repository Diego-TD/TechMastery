import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { defaultNS, resources, supportedLngs } from "./i18n-resources";

// localStorage key shared with main.tsx (to pick Clerk's localization at mount).
export const LOCALE_STORAGE_KEY = "tm.lang";

await i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS,
    ns: ["app"],
    fallbackLng: "en",
    supportedLngs: [...supportedLngs],
    // No `lng` here — the detector decides (persisted choice, then browser default).
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: LOCALE_STORAGE_KEY,
    },
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    react: {
      // Resources are bundled, so init is synchronous — no Suspense needed.
      useSuspense: false,
    },
  });

export default i18n;
