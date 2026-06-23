import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about Mystery Customer Insight crowdtesting.',
};

const FAQ_ITEMS = [
  {
    q: 'Is it really free?',
    a: 'Yes. Submitting apps and testing them is free. No subscriptions, no hidden fees.',
  },
  {
    q: 'How do testers get the app?',
    a: 'Developers share a link (App Store, Google Play, TestFlight, or web). We do not host file uploads.',
  },
  {
    q: 'Who can submit reports?',
    a: 'Signed-in testers complete an app test scenario on their own device and submit answers plus comments.',
  },
  {
    q: 'How is tester quality recognized?',
    a: 'Developers can give a tester a +1 for a helpful report. Ratings build up a tester reputation over time.',
  },
  {
    q: 'How is abusive content handled?',
    a: 'Any app, result, or review can be reported. Content is hidden automatically after enough reports.',
  },
];

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function FaqPage(props: PageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">FAQ</h1>

      <dl className="mt-8 space-y-6">
        {FAQ_ITEMS.map(item => (
          <div key={item.q}>
            <dt className="text-lg font-medium">{item.q}</dt>
            <dd className="mt-1 text-muted-foreground">{item.a}</dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
