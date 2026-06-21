import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: {
    absolute: 'Mystery Customer Insight — free crowdtesting for indie apps',
  },
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
            Crowdtesting · real devices · real people
          </p>
          <h1 className="
            text-4xl font-semibold tracking-tight
            sm:text-5xl
          "
          >
            Real-device testing by
            {' '}
            <span className="
              bg-accent/25 box-decoration-clone px-1 text-primary
            "
            >
              real people
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            A free crowdtesting portal connecting indie developers with human testers.
            No subscriptions, no hidden fees.
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
              Browse apps
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
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12">
        <Image
          src="/landscape.svg"
          alt="How Mystery Customer Insight works"
          width={2475}
          height={1650}
          unoptimized
          priority
          className="h-auto w-full rounded-2xl border shadow-sm"
        />
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-20">
        <div className="
          grid gap-6
          sm:grid-cols-3
        "
        >
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              className="rounded-xl border bg-card p-6 shadow-sm"
            >
              <div className="
                font-mono text-xs tracking-wider text-primary uppercase
              "
              >
                Step
                {' '}
                {i + 1}
              </div>
              <h2 className="mt-2 text-lg font-medium">{s.title}</h2>
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
