import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'About' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
    alternates: { canonical: '/about' },
  };
}

export default async function AboutPage(props: PageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'About' });
  const principles = t.raw('principles') as { title: string; text: string }[];

  return (
    <main>
      <section className="relative overflow-hidden border-b">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(900px 380px at 82% -12%, rgba(255,176,32,0.20), transparent 60%), radial-gradient(700px 500px at 8% 120%, rgba(76,63,207,0.10), transparent 60%)',
          }}
        />
        <div className="relative mx-auto max-w-3xl px-4 py-24 text-center">
          <p className="
            mb-4 font-mono text-xs tracking-[0.14em] text-primary uppercase
          "
          >
            {t('eyebrow')}
          </p>
          <h1 className="
            text-4xl font-semibold tracking-tight
            sm:text-5xl
          "
          >
            {t('hero_title_before')}
            {' '}
            <span className="
              bg-accent/25 box-decoration-clone px-1 text-primary
            "
            >
              {t('hero_title_highlight')}
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            {t('hero_subtitle')}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14">
        <h2 className="text-2xl font-semibold tracking-tight">{t('why_title')}</h2>
        <div className="mt-4 space-y-4 text-muted-foreground">
          <p>{t('why_p1')}</p>
          <p>{t('why_p2')}</p>
          <p>{t('why_p3')}</p>
        </div>
      </section>

      <section className="border-t bg-card/40">
        <div className="mx-auto max-w-4xl px-4 py-14">
          <h2 className="text-2xl font-semibold tracking-tight">
            {t('principles_title')}
          </h2>
          <div className="
            mt-8 grid gap-6
            sm:grid-cols-2
          "
          >
            {principles.map(p => (
              <div
                key={p.title}
                className="rounded-xl border bg-card p-6 shadow-sm"
              >
                <h3 className="text-lg font-medium">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto max-w-4xl px-4 py-14">
          <h2 className="text-2xl font-semibold tracking-tight">
            Free alternative to paid user testing platforms
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            If you are comparing us with UserTesting, TryMyUI, Userfeel, Testapic,
            Userbrain or Maze, here is the difference in plain terms. These are
            differences of model, not claims about quality.
          </p>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-3 pr-4 font-medium text-muted-foreground">
                    &nbsp;
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Paid user testing platforms
                  </th>
                  <th className="px-4 py-3 font-medium text-primary">
                    Mystery Customer Insight
                  </th>
                </tr>
              </thead>
              <tbody className="align-top">
                <tr className="border-b">
                  <th scope="row" className="py-3 pr-4 font-medium">
                    Model
                  </th>
                  <td className="px-4 py-3 text-muted-foreground">
                    A paid testing panel on a subscription or per-test plan
                  </td>
                  <td className="px-4 py-3">
                    A free platform run by a non-profit NGO
                  </td>
                </tr>
                <tr className="border-b">
                  <th scope="row" className="py-3 pr-4 font-medium">
                    Price
                  </th>
                  <td className="px-4 py-3 text-muted-foreground">
                    Subscriptions, per-tester fees, or paywalled reports
                  </td>
                  <td className="px-4 py-3">
                    Free — no subscriptions, no per-tester fees
                  </td>
                </tr>
                <tr className="border-b">
                  <th scope="row" className="py-3 pr-4 font-medium">
                    Who tests
                  </th>
                  <td className="px-4 py-3 text-muted-foreground">
                    A paid, recruited testing panel or commercial testing panels
                  </td>
                  <td className="px-4 py-3">
                    Real people running your app on their own devices
                  </td>
                </tr>
                <tr className="border-b">
                  <th scope="row" className="py-3 pr-4 font-medium">
                    Who operates it
                  </th>
                  <td className="px-4 py-3 text-muted-foreground">
                    A commercial company
                  </td>
                  <td className="px-4 py-3">
                    The non-profit NGO “POGOVORIMO” (EDRPOU 44818137)
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="py-3 pr-4 font-medium">
                    Report access
                  </th>
                  <td className="px-4 py-3 text-muted-foreground">
                    Results kept behind a paywall
                  </td>
                  <td className="px-4 py-3">
                    Read every report for free
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-8 space-y-3 text-sm text-muted-foreground">
            <p>
              <b className="text-foreground">UserTesting</b>
              {' '}
              is a commercial platform sold on paid subscription plans.
            </p>
            <p>
              <b className="text-foreground">TryMyUI</b>
              {' '}
              sells user testing through paid plans and per-test pricing.
            </p>
            <p>
              <b className="text-foreground">Userfeel</b>
              {' '}
              charges a fee for each tester you order.
            </p>
            <p>
              <b className="text-foreground">Testapic</b>
              {' '}
              is a commercial user testing service billed on paid plans.
            </p>
            <p>
              <b className="text-foreground">Userbrain</b>
              {' '}
              is subscription-based, billed per tester or test.
            </p>
            <p>
              <b className="text-foreground">Maze</b>
              {' '}
              offers its testing features on paid subscription tiers.
            </p>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Trademarks belong to their respective owners. Mystery Customer Insight
            is not affiliated with these services.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">{t('cta_title')}</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          {t('cta_subtitle')}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/apps"
            className="
              rounded-lg bg-primary px-5 py-2.5 font-medium
              text-primary-foreground shadow-sm transition
              hover:opacity-90
            "
          >
            {t('cta_browse')}
          </Link>
          <Link
            href="/sign-up"
            className="
              rounded-lg border bg-card px-5 py-2.5 font-medium
              hover:bg-secondary
            "
          >
            {t('cta_tester')}
          </Link>
          <Link
            href="/how-it-works"
            className="
              rounded-lg border bg-card px-5 py-2.5 font-medium
              hover:bg-secondary
            "
          >
            {t('cta_how')}
          </Link>
        </div>
      </section>
    </main>
  );
}
