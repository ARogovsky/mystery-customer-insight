import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublicCampaign } from '@/features/public/queries';

type CampaignPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata(props: CampaignPageProps): Promise<Metadata> {
  const { id } = await props.params;
  const campaign = await getPublicCampaign(id);

  if (!campaign) {
    return { title: 'Campaign not found' };
  }

  return {
    title: `${campaign.title} — ${campaign.appName}`,
    description: campaign.scenario.slice(0, 160),
  };
}

export default async function CampaignPage(props: CampaignPageProps) {
  const { locale, id } = await props.params;
  setRequestLocale(locale);

  const campaign = await getPublicCampaign(id);

  if (!campaign) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <header>
        <h1 className="text-3xl font-semibold">{campaign.title}</h1>
        <p className="mt-1 text-muted-foreground">
          {campaign.appName}
          {' · '}
          {campaign.platforms.join(', ')}
          {' · '}
          {campaign.status}
          {campaign.developerName ? ` · by ${campaign.developerName}` : ''}
        </p>
      </header>

      {campaign.appDescription && (
        <p className="mt-4">{campaign.appDescription}</p>
      )}

      <p className="mt-4">
        <a
          href={campaign.appUrl}
          target="_blank"
          rel="noreferrer"
          className="text-blue-500"
        >
          Open the app
        </a>
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-medium">Test scenario</h2>
        <p className="mt-2 whitespace-pre-wrap">{campaign.scenario}</p>
      </section>

      {campaign.questions.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-medium">You will be asked</h2>
          <ul className="mt-2 list-disc pl-5">
            {campaign.questions.map(q => (
              <li key={q.id}>
                {q.prompt}
                {' '}
                <span className="text-sm text-muted-foreground">
                  (
                  {q.type}
                  )
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-8 flex gap-4">
        <Link
          href={`/dashboard/reports/new/${campaign.id}`}
          className="text-blue-500"
        >
          Submit a report
        </Link>
        <Link
          href={`/campaigns/${campaign.id}/results`}
          className="text-blue-500"
        >
          View results
        </Link>
      </p>
    </article>
  );
}
