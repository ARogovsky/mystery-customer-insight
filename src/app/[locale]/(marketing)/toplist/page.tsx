import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { getTopTesters } from '@/features/toplist/queries';

export const metadata: Metadata = {
  title: 'Toplist',
  description: 'Top human testers by reputation.',
};

// Тулист берёт данные из БД: ISR раз в час — быстро (статика) и не устаревает надолго.
export const revalidate = 3600;

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ToplistPage(props: PageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations('Toplist');

  const testers = await getTopTesters();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">{t('title')}</h1>
      <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>

      {testers.length === 0
        ? (
            <div className="
              mt-10 rounded-xl border bg-card p-8 text-center shadow-sm
            "
            >
              <h2 className="text-xl font-medium">No ranked testers yet</h2>
              <p className="mx-auto mt-2 max-w-md text-muted-foreground">
                The ranking fills up as testers submit reports and developers
                rate them. Be the first — from either side.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href="/dashboard/apps/new"
                  className="
                    rounded-lg bg-primary px-5 py-2.5 font-medium
                    text-primary-foreground shadow-sm transition
                    hover:opacity-90
                  "
                >
                  Submit an app
                </Link>
                <Link
                  href="/sign-up"
                  className="
                    rounded-lg border bg-card px-5 py-2.5 font-medium
                    hover:bg-secondary
                  "
                >
                  Become a tester
                </Link>
              </div>
            </div>
          )
        : (
            <ol className="mt-6 space-y-2">
              {testers.map((tester, i) => (
                <li
                  key={tester.id}
                  className="
                    flex items-center justify-between rounded-md border p-3
                  "
                >
                  <span>
                    <span className="text-muted-foreground">
                      #
                      {i + 1}
                    </span>
                    {' '}
                    {tester.name ?? t('tester')}
                  </span>
                  <span className="text-sm font-medium">
                    {tester.points}
                    {' '}
                    {t('points')}
                  </span>
                </li>
              ))}
            </ol>
          )}
    </main>
  );
}
