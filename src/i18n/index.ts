import { zh } from './zh';
import { en } from './en';
import type { SupportedLang } from '../config/site';

export const translations = { zh, en } as const;

/** Returns a translation function for the given language */
export function useTranslations(lang: SupportedLang) {
  return translations[lang];
}

/** Detects language from URL pathname */
export function getLangFromUrl(url: URL): SupportedLang {
  const [, firstSegment] = url.pathname.split('/');
  if (firstSegment === 'en') return 'en';
  return 'zh';
}

/** Returns the localized path for a given href */
export function localePath(href: string, lang: SupportedLang): string {
  if (lang === 'zh') return href;
  if (href === '/') return '/en';
  return `/en${href}`;
}

/** Returns the alternate-language URL for the current page */
export function getAlternateLangUrl(url: URL, targetLang: SupportedLang): string {
  const currentLang = getLangFromUrl(url);
  if (currentLang === targetLang) return url.pathname;

  if (targetLang === 'zh') {
    return url.pathname.replace(/^\/en/, '') || '/';
  }
  return `/en${url.pathname}`;
}
