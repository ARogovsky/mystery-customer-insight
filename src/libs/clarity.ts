// Microsoft Clarity — поведенческая аналитика (heatmaps / session recordings).
// Грузится ТОЛЬКО после согласия на аналитику (см. consent.ts → applyConsent),
// поэтому официальный inline-сниппет обёрнут в идемпотентный загрузчик.

type ClarityFn = {
  (...args: unknown[]): void;
  q?: unknown[][];
};

declare global {
  // eslint-disable-next-line ts/consistent-type-definitions
  interface Window {
    clarity?: ClarityFn;
  }
}

const CLARITY_ID = 'xtyfm57rmy';

/** Загрузить и инициализировать Microsoft Clarity (идемпотентно). */
export function loadClarity() {
  if (typeof window === 'undefined' || window.clarity) {
    return;
  }

  // Очередь-заглушка (как в официальном сниппете): накапливает вызовы,
  // пока не загрузится реальный тег, затем он их проигрывает.
  const clarity: ClarityFn = (...args: unknown[]) => {
    (clarity.q = clarity.q || []).push(args);
  };
  window.clarity = clarity;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${CLARITY_ID}`;

  const firstScript = document.getElementsByTagName('script')[0];
  if (firstScript?.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript);
  } else {
    document.head.appendChild(script);
  }
}
