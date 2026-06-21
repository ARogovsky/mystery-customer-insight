import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — Mystery Customer Insight',
  robots: { index: true, follow: true },
};

type PageProps = { params: Promise<{ locale: string }> };

export default async function PrivacyPage(props: PageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: June 2026</p>

      <div className="mt-8 space-y-8 leading-relaxed">
        <section>
          <h2 className="text-xl font-medium">Who we are</h2>
          <p className="mt-3 text-muted-foreground">
            Mystery Customer Insight is a free crowdtesting platform that connects indie
            developers with human testers. It is a non-commercial project operated by the
            non-profit organization GROMADSKA ORGANIZATSIYA "POGOVORIMO" (NGO "POGOVORIMO"),
            registered in Ukraine, EDRPOU code 44818137. There are no subscriptions, payments,
            or hidden fees.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium">Information we collect</h2>
          <ul className="mt-3 list-disc space-y-1 pl-6 text-muted-foreground">
            <li>
              <b className="text-foreground">Account data</b>
              {' '}
              — handled by our authentication provider Clerk (email, and a display name you
              optionally provide). We store a profile record with your chosen role
              (developer or tester).
            </li>
            <li>
              <b className="text-foreground">Content you submit</b>
              {' '}
              — apps and test scenarios (developers), test reports and reviews (testers).
              App links are provided as URLs; we do not host file uploads.
            </li>
            <li>
              <b className="text-foreground">Usage & analytics</b>
              {' '}
              — pages visited, device and browser info, and approximate location, collected
              via Google Analytics / Google Ads measurement, only after you consent.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-medium">How your data is shown</h2>
          <ul className="mt-3 list-disc space-y-1 pl-6 text-muted-foreground">
            <li>App and developer information is public.</li>
            <li>
              <b className="text-foreground">Test reports are private</b>
              {' '}
              — visible only to the developer who owns the app, and shown without revealing
              the tester's identity.
            </li>
            <li>Reviews are anonymous and published without an author.</li>
            <li>
              Tester ratings are an aggregate value and are not linked to specific tests or
              testers in public views.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-medium">How we use your data</h2>
          <ul className="mt-3 list-disc space-y-1 pl-6 text-muted-foreground">
            <li>To provide and maintain the platform.</li>
            <li>To match developers' apps with testers and show results.</li>
            <li>To analyze usage and improve the product (with consent).</li>
            <li>To prevent fraud, spam, and abuse (including the Report mechanism).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-medium">Third-party services</h2>
          <p className="mt-3 text-muted-foreground">
            We rely on Clerk (authentication), Supabase (database hosting), and Google
            Analytics / Google Ads (measurement, loaded first-party via Cloudflare and gated
            by your consent). Each processes data under its own privacy policy. We do not sell
            your personal information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium">Cookies & consent</h2>
          <p className="mt-3 text-muted-foreground">
            Analytics and ads measurement load only after you accept via our cookie banner.
            See the
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
            {' '}
            for details and to change your choice at any time.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium">Your rights</h2>
          <p className="mt-3 text-muted-foreground">
            You can access, correct, export, or delete your data, object to processing, and
            withdraw consent at any time. Contact us to exercise these rights.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium">Retention, security & children</h2>
          <p className="mt-3 text-muted-foreground">
            We keep data only as long as needed to provide the service; on account deletion we
            delete or anonymize your personal data. We apply reasonable technical measures to
            protect it, though no method is 100% secure. The service is not intended for
            children under 13.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium">Contact</h2>
          <p className="mt-3 text-muted-foreground">
            Questions or requests:
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
            . NGO "POGOVORIMO", EDRPOU 44818137.
          </p>
        </section>
      </div>
    </article>
  );
}
