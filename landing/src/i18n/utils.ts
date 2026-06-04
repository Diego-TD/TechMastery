import { defaultLang, isLang, type Lang } from "./ui";

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split("/");
  return isLang(lang) ? lang : defaultLang;
}

export function pathForLang(lang: Lang): string {
  return lang === defaultLang ? "/" : `/${lang}/`;
}
