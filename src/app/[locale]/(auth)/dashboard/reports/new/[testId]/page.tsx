import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import { getPublicCampaign } from '@/features/public/queries';
import { createSubmission } from '@/features/reports/actions';
import { getCurrentProfile } from '@/libs/Profile';

const inputClass
  = 'w-full rounded-lg border bg-card px-3 py-2 text-sm focus:outline-2 focus:outline-primary focus:outline-offset-1';
const RATINGS = [1, 2, 3, 4, 5];

type NewReportPageProps = {
  params: Promise<{ locale: string; testId: string }>;
};

export default async function NewReportPage(props: NewReportPageProps) {
  const { locale, testId } = await props.params;
  setRequestLocale(locale);

  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/dashboard');
  }

  const t = await getTranslations('NewReport');

  if (profile.role !== 'tester') {
    return <p className="text-muted-foreground">{t('only_testers')}</p>;
  }

  const campaign = await getPublicCampaign(testId);

  if (!campaign) {
    notFound();
  }

  const submit = createSubmission.bind(null, testId);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="mt-1 font-mono text-sm text-muted-foreground">
          {campaign.title}
          {' · '}
          {campaign.appName}
        </p>
      </div>

      <form
        action={submit}
        className="flex flex-col gap-5 rounded-xl border bg-card p-6 shadow-sm"
      >
        {campaign.questions.length > 0 && (
          <fieldset className="flex flex-col gap-4">
            <legend className="font-medium">{t('questions')}</legend>
            {campaign.questions.map(q => (
              <label key={q.id} className="flex flex-col gap-1 text-sm">
                {q.prompt}
                {q.type === 'text' && (
                  <textarea name={`a_${q.id}`} className={inputClass} />
                )}
                {q.type === 'rating' && (
                  <select name={`a_${q.id}`} className={inputClass}>
                    <option value="">—</option>
                    {RATINGS.map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                )}
                {q.type === 'boolean' && (
                  <select name={`a_${q.id}`} className={inputClass}>
                    <option value="">—</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                )}
                {q.type === 'choice' && (
                  <select name={`a_${q.id}`} className={inputClass}>
                    <option value="">—</option>
                    {((q.options as string[] | null) ?? []).map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}
              </label>
            ))}
          </fieldset>
        )}

        <label className="flex flex-col gap-1 text-sm">
          {t('overall_comments')}
          <textarea name="freeText" rows={4} className={inputClass} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          {t('attachment_link')}
          <input
            name="linkUrl"
            type="url"
            placeholder={t('attachment_placeholder')}
            className={inputClass}
          />
        </label>

        <button
          type="submit"
          className="
            self-start rounded-lg bg-primary px-5 py-2.5 font-medium
            text-primary-foreground shadow-sm transition
            hover:opacity-90
          "
        >
          {t('submit_report')}
        </button>
      </form>
    </div>
  );
}
