import { setRequestLocale } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import { getCampaignSubmissionsForOwner } from '@/features/campaigns/queries';
import { rateSubmission } from '@/features/rating/actions';
import { getCurrentProfile } from '@/libs/Profile';

type SubmissionsPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function SubmissionsPage(props: SubmissionsPageProps) {
  const { locale, id } = await props.params;
  setRequestLocale(locale);

  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/onboarding/role');
  }

  if (profile.role !== 'developer') {
    return <p className="text-muted-foreground">Only developers can view submissions.</p>;
  }

  const data = await getCampaignSubmissionsForOwner(id);

  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        Submissions —
        {' '}
        {data.title}
      </h1>

      {data.submissions.length === 0
        ? <p className="text-muted-foreground">No submissions yet.</p>
        : (
            <ul className="space-y-3">
              {data.submissions.map((s) => {
                const rate = rateSubmission.bind(null, s.id, id);

                return (
                  <li key={s.id} className="rounded-md border p-3">
                    {s.freeText && <p className="whitespace-pre-wrap">{s.freeText}</p>}
                    {s.linkUrl && (
                      <a
                        href={s.linkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-500"
                      >
                        {s.linkUrl}
                      </a>
                    )}
                    <div className="mt-2">
                      {s.ratedId
                        ? <span className="text-sm text-muted-foreground">Rated +1</span>
                        : (
                            <form action={rate}>
                              <button
                                type="submit"
                                className="
                                  rounded-md border px-3 py-1 text-sm
                                  hover:bg-muted
                                "
                              >
                                +1 to tester
                              </button>
                            </form>
                          )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
    </div>
  );
}
