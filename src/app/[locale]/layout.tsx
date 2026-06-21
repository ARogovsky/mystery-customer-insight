import type { Metadata, Viewport } from 'next';
import { auth } from '@clerk/nextjs/server';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import { notFound } from 'next/navigation';
import { ConversionTracker } from '@/components/ConversionTracker';
import { GoogleTag } from '@/components/GoogleTag';
import { CookieConsent } from '@/features/marketing/CookieConsent';
import { routing } from '@/libs/I18nRouting';
import { getBaseUrl } from '@/utils/Helpers';
import '@/styles/global.css';

const SITE_NAME = 'Mystery Customer Insight';
const SITE_DESCRIPTION
  = 'A free crowdtesting platform connecting indie developers with human testers. Real-device testing by real people. No subscriptions, no hidden fees.';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: `${SITE_NAME} — free crowdtesting for indie apps`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: `${SITE_NAME} — free crowdtesting for indie apps`,
    description: SITE_DESCRIPTION,
    url: '/',
    locale: 'en_US',
    images: [
      { url: '/og-image.png', width: 1200, height: 800, alt: SITE_NAME },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — free crowdtesting for indie apps`,
    description: SITE_DESCRIPTION,
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const { userId } = await auth();
  const baseUrl = getBaseUrl();
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': SITE_NAME,
      'url': baseUrl,
      'logo': `${baseUrl}/android-chrome-512x512.png`,
      'description': SITE_DESCRIPTION,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': SITE_NAME,
      'url': baseUrl,
    },
  ];

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`
          ${inter.variable}
          ${spaceGrotesk.variable}
          ${jetbrainsMono.variable}
        `}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <NextIntlClientProvider>
          {props.children}
        </NextIntlClientProvider>
        <CookieConsent />
        <ConversionTracker isSignedIn={!!userId} />
        <GoogleTag />
      </body>
    </html>
  );
}
