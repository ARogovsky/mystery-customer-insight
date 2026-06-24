import type { LocalizationResource } from '@clerk/shared/types';
import type { LocalePrefixMode } from 'next-intl/routing';
import type { AppLocale } from '@/types/I18n';
import {
  bgBG,
  csCZ,
  enUS,
  hrHR,
  huHU,
  plPL,
  roRO,
  skSK,
  ukUA,
} from '@clerk/localizations';

/** Locale prefix strategy for next-intl routing. */
const localePrefix: LocalePrefixMode = 'as-needed';

/**
 * ВРЕМЕННАЯ заглушка «Coming Soon».
 * Когда true — middleware показывает /coming-soon на ВСЕХ роутах (кроме /health).
 * Это код-флаг (не серверная env). Для локальной разработки реальных страниц — поставь false.
 */
export const COMING_SOON: boolean = false;

const locales = [
  {
    id: 'en',
    name: 'English',
  },
  {
    id: 'uk',
    name: 'Українська',
  },
  {
    id: 'pl',
    name: 'Polski',
  },
  {
    id: 'ro',
    name: 'Română',
  },
  {
    id: 'hu',
    name: 'Magyar',
  },
  {
    id: 'cs',
    name: 'Čeština',
  },
  {
    id: 'bg',
    name: 'Български',
  },
  {
    id: 'sk',
    name: 'Slovenčina',
  },
  {
    id: 'hr',
    name: 'Hrvatski',
  },
  {
    id: 'lt',
    name: 'Lietuvių',
  },
  {
    id: 'sl',
    name: 'Slovenščina',
  },
  {
    id: 'lv',
    name: 'Latviešu',
  },
  {
    id: 'et',
    name: 'Eesti',
  },
] satisfies AppLocale[];

// FIXME: Customize this configuration for your product
/** Centralized application configuration */
export const AppConfig = {
  name: 'Mystery Customer Insight',
  i18n: {
    locales,
    defaultLocale: 'en',
    localePrefix,
  },
  email: {
    support: 'contact@nextjs-boilerplate.com',
  },
} as const;

const supportedLocales: Record<string, LocalizationResource> = {
  en: enUS,
  uk: ukUA,
  pl: plPL,
  ro: roRO,
  hu: huHU,
  cs: csCZ,
  bg: bgBG,
  sk: skSK,
  hr: hrHR,
  // lt, sl, lv, et: no Clerk localization → fall back to default (enUS).
};

export const ClerkLocalizations = {
  defaultLocale: enUS,
  supportedLocales,
};

export const AllLocales = AppConfig.i18n.locales.map(locale => locale.id);
