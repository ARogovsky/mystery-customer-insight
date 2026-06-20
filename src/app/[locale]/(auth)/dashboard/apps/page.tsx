import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { createApp } from '@/features/apps/actions';
import { getMyApps } from '@/features/apps/queries';
import { getCurrentProfile } from '@/libs/Profile';

const PLATFORMS = ['ios', 'android', 'web', 'other'] as const;

type AppsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AppsPage(props: AppsPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/onboarding/role');
  }

  if (profile.role !== 'developer') {
    return <p className="text-muted-foreground">Only developers can manage apps.</p>;
  }

  const myApps = await getMyApps();

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-semibold">Your apps</h1>

        {myApps.length === 0
          ? <p className="mt-2 text-muted-foreground">No apps yet.</p>
          : (
              <ul className="mt-4 space-y-2">
                {myApps.map(app => (
                  <li key={app.id} className="rounded-md border p-3">
                    <div className="font-medium">{app.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {app.platforms.join(', ')}
                    </div>
                    <a
                      href={app.appUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-500"
                    >
                      {app.appUrl}
                    </a>
                  </li>
                ))}
              </ul>
            )}
      </section>

      <section>
        <h2 className="text-lg font-medium">Add an app</h2>

        <form action={createApp} className="mt-3 flex max-w-lg flex-col gap-3">
          <input
            name="name"
            required
            placeholder="App name"
            className="rounded-md border px-3 py-2"
          />
          <textarea
            name="description"
            placeholder="Description (optional)"
            className="rounded-md border px-3 py-2"
          />
          <input
            name="appUrl"
            type="url"
            required
            placeholder="https://… store or web link"
            className="rounded-md border px-3 py-2"
          />

          <fieldset className="flex flex-wrap gap-3">
            <legend className="text-sm text-muted-foreground">Platforms</legend>
            {PLATFORMS.map(p => (
              <label key={p} className="flex items-center gap-1 text-sm">
                <input type="checkbox" name="platforms" value={p} />
                {' '}
                {p}
              </label>
            ))}
          </fieldset>

          <button
            type="submit"
            className="
              rounded-md border px-4 py-2 font-medium
              hover:bg-muted
            "
          >
            Create app
          </button>
        </form>
      </section>
    </div>
  );
}
