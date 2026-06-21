import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { CookieSettings } from '@/features/marketing/CookieSettings';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  robots: { index: true, follow: true },
};

type PageProps = { params: Promise<{ locale: string }> };

export default async function CookiesPage(props: PageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Cookie Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: June 2026</p>

      <div className="mt-8 space-y-8 leading-relaxed">
        <section>
          <h2 className="text-xl font-medium">What cookies we use</h2>
          <p className="mt-3 text-muted-foreground">
            Mystery Customer Insight uses two kinds of cookies and similar technologies.
          </p>

          <div className="mt-4 space-y-4">
            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-center gap-2">
                <span className="font-medium">Necessary</span>
                <span className="
                  rounded-full bg-success/12 px-2 py-0.5 text-xs font-semibold
                  text-success
                "
                >
                  always on
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Required for the site to work: authentication session (Clerk), your cookie
                choice, and the preview gate. These cannot be turned off.
              </p>
            </div>

            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-center gap-2">
                <span className="font-medium">Analytics & ads</span>
                <span className="
                  rounded-full bg-muted px-2 py-0.5 text-xs font-semibold
                  text-muted-foreground
                "
                >
                  optional
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Google Analytics (GA4) and Google Ads measurement, loaded first-party through
                Cloudflare. They help us understand traffic and campaign performance. Loaded
                only after you accept; denied by default (Google Consent Mode v2).
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-medium">Managing your choice</h2>
          <p className="mt-3 text-muted-foreground">
            You can change your decision at any time. You can also clear cookies via your
            browser settings.
          </p>
          <div className="mt-4">
            <CookieSettings />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-medium">More information</h2>
          <p className="mt-3 text-muted-foreground">
            See our
            {' '}
            <Link
              href="/privacy"
              className="
                text-primary
                hover:underline
              "
            >
              Privacy Policy
            </Link>
            {' '}
            for how we handle personal data. Questions:
            {' '}
            <a
              href="mailto:admin@mystery-customer-insight.com"
              className="
                text-primary
                hover:underline
              "
            >
              admin@mystery-customer-insight.com
            </a>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
