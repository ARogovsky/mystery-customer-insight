'use client';

import type { ConversionType } from '@/libs/conversions';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { fireConversion } from '@/libs/conversions';

const CONV_COOKIE = 'mci_conv';

// Конверсии от серверных действий передаются через короткоживущую cookie (не через URL,
// чтобы не ломать редиректы/тесты). Здесь читаем её, шлём конверсию и стираем.
function readConvCookie(): { type: ConversionType; txn?: string } | null {
  const match = document.cookie
    .split('; ')
    .find(c => c.startsWith(`${CONV_COOKIE}=`));

  if (!match) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(match.slice(CONV_COOKIE.length + 1)));
  } catch {
    return null;
  }
}

function clearConvCookie() {
  document.cookie = `${CONV_COOKIE}=; Max-Age=0; path=/`;
}

export function ConversionTracker({ isSignedIn }: { isSignedIn: boolean }) {
  const pathname = usePathname();

  // Конверсии действий (lead / app_published / report_submitted) — через cookie.
  // Без deps: срабатывает после каждого коммита (в т.ч. после revalidate/redirect),
  // cookie стираем после отправки, поэтому дубля не будет.
  useEffect(() => {
    const data = readConvCookie();

    if (data?.type) {
      fireConversion(data.type, { transactionId: data.txn });
      clearConvCookie();
    }
  });

  // page_view_anon ($1) — только для НЕзалогиненных, на каждом переходе.
  useEffect(() => {
    if (!isSignedIn) {
      fireConversion('page_view_anon');
    }
  }, [pathname, isSignedIn]);

  return null;
}
