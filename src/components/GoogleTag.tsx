import Script from 'next/script';

// Базовый Google-тег (GA4). Грузится программно на всех страницах.
// На проде отдаётся first-party через Cloudflare "Google tag gateway".
// ВРЕМЕННО без Consent Mode/баннера — это шаг проверки, что тег тянется.
// Следующим шагом добавим Consent Mode v2 + simple-баннер + конверсии.
const GA_ID = 'G-1XCYQE2L8Z';

export function GoogleTag() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>
    </>
  );
}
