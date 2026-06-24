import { getTranslations, setRequestLocale } from 'next-intl/server';
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
    redirect('/dashboard');
  }

  const t = await getTranslations('Submissions');

  if (profile.role !== 'developer') {
    return <p className="text-muted-foreground">{t('only_developers')}</p>;
  }

  const data = await getCampaignSubmissionsForOwner(id);

  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        {t('title', { title: data.title })}
      </h1>

      {data.submissions.length === 0
        ? <p className="text-muted-foreground">{t('no_submissions')}</p>
        : (
            <ul className="space-y-3">
              {data.submissions.map((s) => {
                const rate = rateSubmission.bind(null, s.id, id);

                return (
                  <li
                    key={s.id}
                    className="rounded-xl border bg-card p-4 shadow-sm"
                  >
                    {s.freeText && <p className="whitespace-pre-wrap">{s.freeText}</p>}
                    {s.linkUrl && (
                      <a
                        href={s.linkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="
                          text-sm text-primary
                          hover:underline
                        "
                      >
                        {s.linkUrl}
                      </a>
                    )}
                    <div className="mt-3 border-t pt-3">
                      {s.ratedId
                        ? (
                            <span className="
                              inline-flex items-center rounded-full
                              bg-success/12 px-2.5 py-0.5 text-xs font-semibold
                              text-success
                            "
                            >
                              {t('rated')}
                            </span>
                          )
                        : (
                            <form action={rate}>
                              <button
                                type="submit"
                                className="
                                  rounded-md border bg-card px-3 py-1.5 text-sm
                                  font-medium transition
                                  hover:bg-secondary
                                "
                              >
                                {t('plus_to_tester')}
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
