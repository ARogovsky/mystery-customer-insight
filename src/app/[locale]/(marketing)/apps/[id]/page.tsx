import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ReportForm } from '@/features/moderation/ReportForm';
import { getPublicCampaign } from '@/features/public/queries';
import { createReview } from '@/features/reviews/actions';
import { getAppReviews } from '@/features/reviews/queries';

type CampaignPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata(props: CampaignPageProps): Promise<Metadata> {
  const { id } = await props.params;
  const campaign = await getPublicCampaign(id);

  if (!campaign) {
    return { title: 'App not found' };
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

  const reviews = await getAppReviews(campaign.appId);
  const addReview = createReview.bind(null, campaign.appId);
  const { userId } = await auth();
  const isAuthenticated = !!userId;

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
                {q.type === 'choice' && (
                  <span className="text-sm text-muted-foreground">
                    {': '}
                    {((q.options as string[] | null) ?? []).join(', ')}
                  </span>
                )}
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
      </p>

      <ReportForm targetType="test" targetId={campaign.id} />

      <section className="mt-10">
        <h2 className="text-xl font-medium">Reviews</h2>

        {reviews.length === 0
          ? <p className="mt-2 text-muted-foreground">No reviews yet.</p>
          : (
              <ul className="mt-3 space-y-3">
                {reviews.map(r => (
                  <li key={r.id} className="rounded-md border p-3">
                    {r.rating != null && (
                      <div className="text-sm text-muted-foreground">
                        Rating:
                        {' '}
                        {r.rating}
                        /5
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{r.body}</p>
                    <ReportForm targetType="review" targetId={r.id} />
                  </li>
                ))}
              </ul>
            )}

        <form action={addReview} className="mt-4 flex max-w-lg flex-col gap-2">
          <textarea
            name="body"
            required
            placeholder="Leave an anonymous review"
            className="rounded-md border px-3 py-2"
          />
          <select name="rating" className="max-w-28 rounded-md border px-3 py-2">
            <option value="">Rating…</option>
            {[1, 2, 3, 4, 5].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!isAuthenticated}
            className="
              self-start rounded-md border px-4 py-2 font-medium
              hover:bg-muted
              disabled:cursor-not-allowed disabled:opacity-50
            "
          >
            Post review
          </button>
          {!isAuthenticated && (
            <p className="text-sm text-muted-foreground">
              <Link href="/sign-in" className="text-blue-500">Sign in</Link>
              {' '}
              to leave a review. Reviews stay anonymous.
            </p>
          )}
        </form>
      </section>
    </article>
  );
}
