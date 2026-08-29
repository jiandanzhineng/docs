export const SUPPORTED_LOCALES = ['zh-Hans', 'en', 'ja', 'es', 'de'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export function mapBrowserLangToLocale(tag: string): SupportedLocale | null {
  const lower = String(tag || '')
    .toLowerCase()
    .replace(/_/g, '-');
  if (lower === 'zh' || lower.startsWith('zh-')) {
    return 'zh-Hans';
  }
  if (lower === 'ja' || lower.startsWith('ja-')) {
    return 'ja';
  }
  if (lower === 'es' || lower.startsWith('es-')) {
    return 'es';
  }
  if (lower === 'de' || lower.startsWith('de-')) {
    return 'de';
  }
  if (lower === 'en' || lower.startsWith('en-')) {
    return 'en';
  }
  return null;
}

export function getPreferredLocale(
  languages: readonly string[],
): SupportedLocale {
  for (const lang of languages) {
    const mapped = mapBrowserLangToLocale(lang);
    if (mapped) {
      return mapped;
    }
  }
  return languages.length > 0 ? 'en' : 'zh-Hans';
}

export function getBrowserLanguages(): string[] {
  if (typeof navigator === 'undefined') {
    return [];
  }
  if (navigator.languages && navigator.languages.length > 0) {
    return Array.from(navigator.languages);
  }
  return navigator.language ? [navigator.language] : [];
}
