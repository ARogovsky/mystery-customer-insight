import { setRequestLocale } from 'next-intl/server';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { updateCampaignStatus } from '@/features/campaigns/actions';
import { getMyCampaigns } from '@/features/campaigns/queries';
import { SubmitAppForm } from '@/features/campaigns/SubmitAppForm';
import { getMyReports, getMyStats } from '@/features/reports/queries';
import { createProfileWithRole, getCurrentProfile } from '@/libs/Profile';

type DashboardPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardIndexPage(props: DashboardPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const profile = await getCurrentProfile();

  // Онбординг роли инлайн (без редиректа — иначе зависает сразу после логина).
  if (!profile) {
    async function chooseRole(role: 'developer' | 'tester', formData: FormData) {
      'use server';

      const displayName
        = (formData.get('displayName') as string | null)?.trim() || undefined;

      await createProfileWithRole(role, displayName);
      revalidatePath('/dashboard');
    }

    return (
      <div className="mx-auto max-w-md py-10 text-center">
        <h1 className="text-2xl font-semibold">Choose your role</h1>
        <p className="mt-2 text-muted-foreground">
          How will you use Mystery Customer Insight?
        </p>
        <form className="mt-6 flex flex-col gap-3">
          <input
            name="displayName"
            placeholder="Display name (optional)"
            className="rounded-md border px-3 py-2"
          />
          <button
            type="submit"
            formAction={chooseRole.bind(null, 'developer')}
            className="
              rounded-md border px-4 py-3 font-medium
              hover:bg-muted
            "
          >
            I am a developer
          </button>
          <button
            type="submit"
            formAction={chooseRole.bind(null, 'tester')}
            className="
              rounded-md border px-4 py-3 font-medium
              hover:bg-muted
            "
          >
            I am a tester
          </button>
        </form>
      </div>
    );
  }

  if (profile.role === 'developer') {
    const apps = await getMyCampaigns();

    // Нет публикаций → сразу форма добавления (инлайн, без редиректа).
    if (apps.length === 0) {
      return (
        <div className="max-w-2xl space-y-6">
          <h1 className="text-2xl font-semibold">Submit your first app</h1>
          <SubmitAppForm />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Your apps</h1>
          <Link
            href="/dashboard/apps/new"
            className="
              rounded-md border px-4 py-2 font-medium
              hover:bg-muted
            "
          >
            Submit an app
          </Link>
        </div>

        <ul className="space-y-2">
          {apps.map(c => (
            <li key={c.id} className="rounded-md border p-3">
              <Link
                href={`/dashboard/apps/${c.id}/submissions`}
                className="font-medium text-blue-500"
              >
                {c.title}
              </Link>
              <div className="text-sm text-muted-foreground">
                {c.appName}
                {' · '}
                {c.platforms.join(', ')}
                {' · '}
                {c.status}
              </div>
              <form
                action={updateCampaignStatus.bind(null, c.id)}
                className="mt-2 flex items-center gap-2"
              >
                <select
                  name="status"
                  defaultValue={c.status}
                  className="rounded-md border px-2 py-1 text-sm"
                  aria-label={`Status for ${c.title}`}
                >
                  <option value="draft">draft</option>
                  <option value="open">open</option>
                  <option value="closed">closed</option>
                </select>
                <button
                  type="submit"
                  className="
                    rounded-md border px-3 py-1 text-sm
                    hover:bg-muted
                  "
                >
                  Update status
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
        <div>
          <h1 className="text-2xl font-semibold">My reports</h1>
          <p className="text-sm text-muted-foreground">
            Rating:
            {' '}
            {stats.ratingPoints}
            {' · '}
            Tests completed:
            {' '}
            {stats.testsCompleted}
          </p>
        </div>
        <Link
          href="/apps"
          className="
            rounded-md border px-4 py-2 font-medium
            hover:bg-muted
          "
        >
          Browse apps
        </Link>
      </div>

      {reports.length === 0
        ? <p className="text-muted-foreground">No reports yet.</p>
        : (
            <ul className="space-y-2">
              {reports.map(r => (
                <li key={r.id} className="rounded-md border p-3">
                  <Link
                    href={`/apps/${r.testId}`}
                    className="font-medium text-blue-500"
                  >
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
    </div>
  );
}
