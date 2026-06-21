import Script from 'next/script';

// Google-тег (GA4 G-… + связанный Google Ads AW-…) с Consent Mode v2.
// Порядок критичен: сначала consent default = denied (до gtag.js), потом загрузка тега,
// потом config. Баннер согласия делает gtag('consent','update', …).
// На проде отдаётся first-party через Cloudflare "Google tag gateway".
const GA_ID = 'G-1XCYQE2L8Z';

export function GoogleTag() {
  return (
    <>
      {/* 1) Consent Mode v2 — всё denied по умолчанию (до загрузки тега). */}
      <Script id="consent-default" strategy="beforeInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  ad_storage: 'denied',
  analytics_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  wait_for_update: 500
});
gtag('js', new Date());`}
      </Script>

      {/* 2) Сам тег (first-party через Cloudflare gateway на проде). */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />

      {/* 3) Конфиг GA4 (связанный Google Ads подтянется автоматически). */}
      <Script id="gtag-config" strategy="afterInteractive">
        {`gtag('config', '${GA_ID}');`}
      </Script>
    </>
  );
}
