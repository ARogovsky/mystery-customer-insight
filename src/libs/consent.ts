// Хранение согласия на аналитику/рекламу + проброс в Google Consent Mode v2.
// Используется баннером (CookieConsent) и страницей Cookie.

declare global {
  // eslint-disable-next-line vars-on-top
  var gtag: ((...args: unknown[]) => void) | undefined;
  // eslint-disable-next-line ts/consistent-type-definitions
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const CONSENT_KEY = 'mci-consent';
const CONSENT_VERSION = '1';

type StoredConsent = {
  analytics: boolean;
  version: string;
  timestamp: number;
};

/** Текущее согласие: true/false, либо null если выбор ещё не сделан (или версия устарела). */
export function readConsent(): boolean | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(CONSENT_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as StoredConsent;

    if (parsed.version !== CONSENT_VERSION) {
      return null;
    }

    return parsed.analytics;
  } catch {
    return null;
  }
}

/** Прокинуть согласие в Google Consent Mode (аналитика + реклама вместе). */
export function applyConsent(analytics: boolean) {
  const value = analytics ? 'granted' : 'denied';

  window.gtag?.('consent', 'update', {
    analytics_storage: value,
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
  });
}

/** Сохранить выбор и применить его. */
export function saveConsent(analytics: boolean) {
  const data: StoredConsent = {
    analytics,
    version: CONSENT_VERSION,
    timestamp: Date.now(),
  };

  window.localStorage.setItem(CONSENT_KEY, JSON.stringify(data));
  applyConsent(analytics);
}

/** Сбросить выбор (чтобы заново показать баннер). */
export function clearConsent() {
  window.localStorage.removeItem(CONSENT_KEY);
}
