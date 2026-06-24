'use client';

import { useTranslations } from 'next-intl';
import { clearConsent } from '@/libs/consent';

// Кнопка «изменить выбор cookie»: сбрасывает сохранённое согласие и перезагружает —
// баннер появится снова.
export function CookieSettings() {
  const t = useTranslations('CookieConsent');

  return (
    <button
      type="button"
      onClick={() => {
        clearConsent();
        window.location.reload();
      }}
      className="
        rounded-lg border bg-card px-4 py-2 text-sm font-medium transition
        hover:bg-secondary
      "
    >
      {t('change')}
    </button>
  );
}
