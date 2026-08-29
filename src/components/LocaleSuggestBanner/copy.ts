import type {SupportedLocale} from '@site/src/utils/preferredLocale';

export type BannerCopy = {
  message: string;
  switchLabel: string;
  closeLabel: string;
};

export const BANNER_COPY: Record<SupportedLocale, BannerCopy> = {
  en: {
    message: 'This page is also available in English.',
    switchLabel: 'Switch',
    closeLabel: 'Dismiss',
  },
  ja: {
    message: 'このページは日本語でもご覧いただけます。',
    switchLabel: '切り替える',
    closeLabel: '閉じる',
  },
  es: {
    message: 'Esta página también está disponible en español.',
    switchLabel: 'Cambiar',
    closeLabel: 'Cerrar',
  },
  de: {
    message: 'Diese Seite ist auch auf Deutsch verfügbar.',
    switchLabel: 'Wechseln',
    closeLabel: 'Schließen',
  },
  'zh-Hans': {
    message: '本页提供简体中文版本。',
    switchLabel: '切换',
    closeLabel: '关闭',
  },
};
