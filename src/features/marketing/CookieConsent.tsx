'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { applyConsent, readConsent, saveConsent } from '@/libs/consent';

// Простой баннер согласия (Consent Mode v2). По умолчанию всё denied (в GoogleTag);
// здесь пользователь принимает/отклоняет аналитику и рекламу.
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const choice = readConsent();

    if (choice === null) {
      setVisible(true);
    } else {
      // Применяем ранее сохранённый выбор к Consent Mode.
      applyConsent(choice);
    }
  }, []);

  if (!visible) {
    return null;
  }

  const decide = (analytics: boolean) => {
    saveConsent(analytics);
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <div className="
        mx-auto flex max-w-3xl flex-col gap-3 rounded-xl border bg-card p-4
        shadow-lg
        sm:flex-row sm:items-center sm:justify-between
      "
      >
        <p className="text-sm text-muted-foreground">
          We use cookies for analytics and ads measurement to improve the site.
          You can accept or decline.
          {' '}
          <Link
            href="/cookies"
            className="
              text-primary
              hover:underline
            "
          >
            Cookie Policy
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => decide(false)}
            className="
              rounded-lg border bg-card px-4 py-2 text-sm font-medium transition
              hover:bg-secondary
            "
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => decide(true)}
            className="
              rounded-lg bg-primary px-4 py-2 text-sm font-medium
              text-primary-foreground transition
              hover:opacity-90
            "
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
