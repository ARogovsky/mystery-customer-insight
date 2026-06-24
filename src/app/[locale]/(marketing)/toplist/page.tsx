import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
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
        ? <p className="mt-8 text-muted-foreground">{t('empty')}</p>
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
