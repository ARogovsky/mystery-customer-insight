import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { MarketingHeader } from '@/features/marketing/MarketingHeader';

export const metadata: Metadata = {
  title: 'How it works — Mystery Customer Insight',
  description: 'How developers post campaigns and human testers run them on real devices.',
};

const STEPS = [
  {
    title: '1. Submit an app',
    text: 'A developer submits an app for free: app link, target platforms, a test scenario, and a few simple questions.',
  },
  {
    title: '2. Test on real devices',
    text: 'Human testers browse open apps and complete the scenario on their own phones and tablets.',
  },
  {
    title: '3. Get results',
    text: 'Developers receive real-world usability feedback from actual people — answers, comments, and links.',
  },
];

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HowItWorksPage(props: PageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <>
      <MarketingHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-semibold">How it works</h1>
        <p className="mt-2 text-muted-foreground">
          Free crowdtesting for indie developers and human testers. No subscriptions, no hidden fees.
        </p>

        <ol className="mt-8 space-y-6">
          {STEPS.map(s => (
            <li key={s.title}>
              <h2 className="text-xl font-medium">{s.title}</h2>
              <p className="mt-1">{s.text}</p>
            </li>
          ))}
        </ol>

        <p className="mt-10">
          <Link href="/campaigns" className="font-medium text-blue-500">
            Browse open apps →
          </Link>
        </p>
      </main>
    </>
  );
}
