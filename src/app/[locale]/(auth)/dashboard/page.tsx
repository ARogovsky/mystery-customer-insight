import { getTranslations, setRequestLocale } from 'next-intl/server';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { updateCampaignStatus } from '@/features/campaigns/actions';
import { getMyCampaigns } from '@/features/campaigns/queries';
import { SubmitAppForm } from '@/features/campaigns/SubmitAppForm';
import { getMyReports, getMyStats } from '@/features/reports/queries';
import { hashId } from '@/libs/hashId';
import { createProfileWithRole, getCurrentProfile } from '@/libs/Profile';

const inputClass
  = 'w-full rounded-lg border bg-card px-3 py-2 text-sm focus:outline-2 focus:outline-primary focus:outline-offset-1';
const ghostBtn
  = 'rounded-lg border bg-card px-4 py-2 font-medium transition hover:bg-secondary';
const cardClass = 'rounded-xl border bg-card p-4 shadow-sm';

type DashboardPageProps = {
  params: Promise<{ locale: string }>;
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`
        inline-flex items-center rounded-full px-2.5 py-0.5 text-xs
        font-semibold
        ${status === 'open'
      ? `bg-success/12 text-success`
      : `bg-muted text-muted-foreground`}
      `}
    >
      {status}
    </span>
  );
}

export default async function DashboardIndexPage(props: DashboardPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations('Dashboard');
  const profile = await getCurrentProfile();

  // Онбординг роли инлайн (без редиректа — иначе зависает сразу после логина).
  if (!profile) {
    async function chooseRole(role: 'developer' | 'tester', formData: FormData) {
      'use server';

      const { auth } = await import('@clerk/nextjs/server');
      const { cookies } = await import('next/headers');

      const displayName
        = (formData.get('displayName') as string | null)?.trim() || undefined;

      await createProfileWithRole(role, displayName);

      // Конверсия qualified_lead ($100) — txn = хеш Clerk userId (без раскрытия id).
      const { userId } = await auth();
      if (userId) {
        (await cookies()).set(
          'mci_conv',
          JSON.stringify({ type: 'qualified_lead', txn: hashId(userId) }),
          { path: '/', maxAge: 120, httpOnly: false, sameSite: 'lax' },
        );
      }

      revalidatePath('/dashboard');
    }

    return (
      <div className="mx-auto max-w-md py-10">
        <div className={`
          ${cardClass}
          text-center
        `}
        >
          <h1 className="text-2xl font-semibold">{t('choose_role')}</h1>
          <p className="mt-2 text-muted-foreground">
            {t('choose_role_subtitle')}
          </p>
          <form className="mt-6 flex flex-col gap-3">
            <input
              name="displayName"
              placeholder={t('display_name')}
              className={inputClass}
            />
            <button
              type="submit"
              formAction={chooseRole.bind(null, 'developer')}
              className={ghostBtn}
            >
              {t('i_am_developer')}
            </button>
            <button
              type="submit"
              formAction={chooseRole.bind(null, 'tester')}
              className={ghostBtn}
            >
              {t('i_am_tester')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (profile.role === 'developer') {
    const apps = await getMyCampaigns();

    // Нет публикаций → сразу форма добавления (инлайн, без редиректа).
    if (apps.length === 0) {
      return (
        <div className="max-w-4xl space-y-6">
          <h1 className="text-2xl font-semibold">{t('submit_first_app')}</h1>
          <SubmitAppForm />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{t('your_apps')}</h1>
          <Link href="/dashboard/apps/new" className={ghostBtn}>
            {t('submit_an_app')}
          </Link>
        </div>

        <ul className="
          grid gap-4
          sm:grid-cols-2
        "
        >
          {apps.map(c => (
            <li
              key={c.id}
              className={`
                flex flex-col gap-3
                ${cardClass}
              `}
            >
              <div>
                <Link
                  href={`/dashboard/apps/${c.id}/submissions`}
                  className="
                    text-lg font-medium
                    hover:text-primary
                  "
                >
                  {c.title}
                </Link>
                <div className="mt-0.5 font-mono text-xs text-muted-foreground">
                  {c.appName}
                  {' · '}
                  {c.platforms.join(', ')}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={c.status} />
              </div>

              <form
                action={updateCampaignStatus.bind(null, c.id)}
                className="mt-auto flex items-center gap-2 border-t pt-3"
              >
                <select
                  name="status"
                  defaultValue={c.status}
                  className={`
                    w-auto
                    ${inputClass}
                  `}
                  aria-label={t('status_for', { title: c.title })}
                >
                  <option value="draft">draft</option>
                  <option value="open">open</option>
                  <option value="closed">closed</option>
                </select>
                <button
                  type="submit"
                  className="
                    rounded-md border bg-card px-3 py-1.5 text-sm font-medium
                    transition
                    hover:bg-secondary
                  "
                >
                  {t('update_status')}
                </button>
              </form>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const [reports, stats] = await Promise.all([getMyReports(), getMyStats()]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t('my_reports')}</h1>
        <Link href="/apps" className={ghostBtn}>
          {t('browse_apps')}
        </Link>
      </div>

      {/* Сводка рейтинга */}
      <div className="
        flex flex-wrap gap-3
        sm:gap-4
      "
      >
        <div className={`
          flex-1
          ${cardClass}
        `}
        >
          <div className="
            font-mono text-xs tracking-wider text-primary uppercase
          "
          >
            {t('rating')}
          </div>
          <div className="mt-1 font-mono text-2xl font-semibold">{stats.ratingPoints}</div>
        </div>
        <div className={`
          flex-1
          ${cardClass}
        `}
        >
          <div className="
            font-mono text-xs tracking-wider text-primary uppercase
          "
          >
            {t('tests_completed')}
          </div>
          <div className="mt-1 font-mono text-2xl font-semibold">{stats.testsCompleted}</div>
        </div>
      </div>

      {reports.length === 0
        ? <p className="text-muted-foreground">{t('no_reports')}</p>
        : (
            <ul className="space-y-3">
              {reports.map(r => (
                <li
                  key={r.id}
                  className={`
                    flex items-center justify-between
                    ${cardClass}
                  `}
                >
                  <Link
                    href={`/apps/${r.testId}`}
                    className="
                      font-medium
                      hover:text-primary
                    "
                  >
                    {r.title}
                  </Link>
                  {r.rated && (
                    <span className="
                      inline-flex items-center rounded-full bg-success/12 px-2.5
                      py-0.5 text-xs font-semibold text-success
                    "
                    >
                      {t('plus_received')}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
    </div>
  );
}
