import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about Mystery Customer Insight crowdtesting.',
};

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function FaqPage(props: PageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations('Faq');

  const items = [
    { q: t('q1'), a: t('a1') },
    { q: t('q2'), a: t('a2') },
    { q: t('q3'), a: t('a3') },
    { q: t('q4'), a: t('a4') },
    { q: t('q5'), a: t('a5') },
  ];

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">{t('title')}</h1>

      <dl className="mt-8 space-y-6">
        {items.map(item => (
          <div key={item.q}>
            <dt className="text-lg font-medium">{item.q}</dt>
            <dd className="mt-1 text-muted-foreground">{item.a}</dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
