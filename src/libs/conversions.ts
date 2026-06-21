// Слой конверсий (provider-agnostic, дефолт — Google tag / gtag).
// Значения — прокси-стоимости для оптимизации рекламы. transaction_id — для дедупликации.
// Когда заведёшь conversion actions в Google Ads, добавь label в adSendTo: 'AW-16555543061/LABEL'.

export type ConversionType
  = | 'page_view_anon'
    | 'qualified_lead'
    | 'app_published'
    | 'report_submitted';

const CURRENCY = 'USD';

const CONVERSIONS: Record<
  ConversionType,
  { event: string; value: number; adSendTo?: string }
> = {
  page_view_anon: { event: 'page_view_anon', value: 1 },
  qualified_lead: { event: 'qualified_lead', value: 100 },
  app_published: { event: 'app_published', value: 1000 },
  report_submitted: { event: 'report_submitted', value: 1000 },
};

/** Отправить конверсию через gtag (если он загружен и согласие позволяет). */
export function fireConversion(
  type: ConversionType,
  opts?: { transactionId?: string },
) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }

  const conversion = CONVERSIONS[type];
  const params: Record<string, unknown> = {
    value: conversion.value,
    currency: CURRENCY,
  };

  if (opts?.transactionId) {
    params.transaction_id = opts.transactionId;
  }

  if (conversion.adSendTo) {
    params.send_to = conversion.adSendTo;
  }

  window.gtag('event', conversion.event, params);
}
