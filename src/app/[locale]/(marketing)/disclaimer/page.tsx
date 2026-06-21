import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Disclaimer',
  robots: { index: true, follow: true },
};

type PageProps = { params: Promise<{ locale: string }> };

export default async function DisclaimerPage(props: PageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Disclaimer</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: June 2026</p>

      <div className="mt-8 space-y-8 leading-relaxed">
        <section>
          <h2 className="text-xl font-medium">About this project</h2>
          <p className="mt-3 text-muted-foreground">
            Mystery Customer Insight is a free, non-commercial crowdtesting platform operated by
            the non-profit organization NGO "POGOVORIMO" (EDRPOU 44818137). It connects indie
            developers with human testers. We do not charge fees and do not pay testers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium">User-generated content</h2>
          <p className="mt-3 text-muted-foreground">
            Apps, test scenarios, reports, and reviews are submitted by users. Developers
            publish their own apps (as links); testers submit reports and anonymous reviews.
            Opinions expressed belong to their authors and do not represent NGO "POGOVORIMO".
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium">No affiliation with submitted apps</h2>
          <p className="mt-3 text-muted-foreground">
            We are not affiliated with, endorsed by, or connected to the apps and brands
            submitted by developers. All trademarks, names, and logos are the property of their
            respective owners. We host links, not files.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium">Privacy of reports</h2>
          <p className="mt-3 text-muted-foreground">
            Test reports are private to the app's owner and shown without revealing the
            tester's identity. Reviews are anonymous. Do not submit confidential or personal
            data in reports or reviews.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium">No warranty</h2>
          <p className="mt-3 text-muted-foreground">
            The platform and its content are provided "as is", without warranties of any kind.
            We do not guarantee the accuracy, completeness, or reliability of any user content.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium">Contact</h2>
          <p className="mt-3 text-muted-foreground">
            <a
              href="mailto:admin@mystery-customer-insight.com"
              className="
                text-primary
                hover:underline
              "
            >
              admin@mystery-customer-insight.com
            </a>
            {' '}
            · NGO "POGOVORIMO", EDRPOU 44818137.
          </p>
        </section>
      </div>
    </article>
  );
}
