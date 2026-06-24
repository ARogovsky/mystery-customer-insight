import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How it works',
  description: 'How developers submit apps and human testers run them on real devices.',
};

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HowItWorksPage(props: PageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations('HowItWorks');

  const steps = [
    { title: t('step1_title'), text: t('step1_text') },
    { title: t('step2_title'), text: t('step2_text') },
    { title: t('step3_title'), text: t('step3_text') },
  ];

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">{t('title')}</h1>
      <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>

      <ol className="mt-8 space-y-6">
        {steps.map(s => (
          <li key={s.title}>
            <h2 className="text-xl font-medium">{s.title}</h2>
            <p className="mt-1">{s.text}</p>
          </li>
        ))}
      </ol>

      <p className="mt-10">
        <Link href="/apps" className="font-medium text-blue-500">
          {t('browse_open')}
        </Link>
      </p>
    </main>
  );
}
