import { resources, defaultNS } from "../src/lib/i18n-resources";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    // Enables the type-safe selector API: t(($) => $.shell.title)
    enableSelector: true;
    resources: (typeof resources)["en"];
  }
}
