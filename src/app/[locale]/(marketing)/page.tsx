import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Mystery Customer Insight — free crowdtesting for indie apps',
  description:
    'Indie developers submit apps for testing. Human testers run them on real devices and report back. No subscriptions, no hidden fees.',
};

const STEPS = [
  {
    title: 'Submit an app',
    text: 'Add your app link, target platforms, a test scenario, and a few questions. It is free.',
  },
  {
    title: 'Real people test it',
    text: 'Human testers complete your scenario on their own phones and tablets.',
  },
  {
    title: 'Get honest results',
    text: 'Read real-world answers, comments, and links from actual users.',
  },
];

type IndexProps = {
  params: Promise<{ locale: string }>;
};

export default async function Index(props: IndexProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <main>
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="
          text-4xl font-semibold tracking-tight
          sm:text-5xl
        "
        >
          Real-device testing by real people
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          A free crowdtesting portal connecting indie developers with human testers.
          No subscriptions, no hidden fees.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/apps"
            className="
              rounded-md border bg-foreground px-5 py-2.5 font-medium
              text-background
            "
          >
            Browse apps
          </Link>
          <Link
            href="/sign-up"
            className="
              rounded-md border px-5 py-2.5 font-medium
              hover:bg-muted
            "
          >
            Become a tester
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-20">
        <div className="
          grid gap-6
          sm:grid-cols-3
        "
        >
          {STEPS.map((s, i) => (
            <div key={s.title} className="rounded-lg border p-5">
              <div className="text-sm text-muted-foreground">
                Step
                {' '}
                {i + 1}
              </div>
              <h2 className="mt-1 text-lg font-medium">{s.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center">
          <Link href="/how-it-works" className="font-medium text-blue-500">
            Learn how it works →
          </Link>
        </p>
      </section>
    </main>
  );
}
