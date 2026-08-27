import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How it works',
  description: 'How developers submit apps and human testers run them on real devices.',
  alternates: { canonical: '/how-it-works' },
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

      <figure className="mt-8 rounded-xl border bg-card p-6 shadow-sm">
        <figcaption className="flex flex-wrap items-center gap-2">
          <span className="
            rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold
            text-secondary-foreground
          "
          >
            Sample report
          </span>
          <span className="text-sm text-muted-foreground">
            Example of a report a developer receives
          </span>
        </figcaption>

        <p className="mt-4 font-mono text-xs text-muted-foreground">
          A to-do app · tested on a phone
        </p>

        <dl className="mt-3 space-y-3 text-sm">
          <div>
            <dt className="font-medium">
              Could you add your first task without help?
            </dt>
            <dd className="mt-0.5 text-muted-foreground">
              Yes — the add button was obvious, first task added in a few seconds.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Did anything confuse you?</dt>
            <dd className="mt-0.5 text-muted-foreground">
              The due-date picker opened behind the keyboard, so I could not see
              the day I was choosing.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Would you use it again?</dt>
            <dd className="mt-0.5 text-muted-foreground">
              Probably, for simple lists.
            </dd>
          </div>
        </dl>

        <p className="mt-4 border-t pt-3 text-sm">
          <span className="font-medium">Tester comment:</span>
          {' '}
          <span className="text-muted-foreground">
            Smooth overall. The empty first screen could suggest adding a task,
            so it feels less blank when you open the app.
          </span>
        </p>
      </figure>

      <p className="mt-10">
        <Link href="/apps" className="font-medium text-blue-500">
          {t('browse_open')}
        </Link>
      </p>
    </main>
  );
}
