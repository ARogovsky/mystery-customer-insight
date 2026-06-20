import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ReportForm } from '@/features/moderation/ReportForm';
import { getCampaignResults, getPublicCampaign } from '@/features/public/queries';

type ResultsPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function CampaignResultsPage(props: ResultsPageProps) {
  const { locale, id } = await props.params;
  setRequestLocale(locale);

  const campaign = await getPublicCampaign(id);

  if (!campaign) {
    notFound();
  }

  const results = await getCampaignResults(id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p>
        <Link href={`/campaigns/${campaign.id}`} className="text-blue-500">
          ← Back to campaign
        </Link>
      </p>

      <h1 className="mt-2 text-3xl font-semibold">
        Results —
        {' '}
        {campaign.title}
      </h1>

      {results.length === 0
        ? <p className="mt-6 text-muted-foreground">No reports yet.</p>
        : (
            <ul className="mt-6 space-y-3">
              {results.map(r => (
                <li key={r.id} className="rounded-md border p-3">
                  {r.freeText && <p className="whitespace-pre-wrap">{r.freeText}</p>}
                  {r.linkUrl && (
                    <a
                      href={r.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-500"
                    >
                      {r.linkUrl}
                    </a>
                  )}
                  <ReportForm targetType="submission" targetId={r.id} />
                </li>
              ))}
            </ul>
          )}
    </div>
  );
}
