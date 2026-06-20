import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { getOpenCampaigns, parsePlatform } from '@/features/public/queries';
import { getCurrentProfile } from '@/libs/Profile';

const PLATFORMS = ['ios', 'android', 'web', 'other'] as const;

type CampaignsFeedProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ platform?: string }>;
};

export default async function CampaignsFeedPage(props: CampaignsFeedProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const { platform: rawPlatform } = await props.searchParams;
  const platform = parsePlatform(rawPlatform);

  const [campaigns, profile] = await Promise.all([
    getOpenCampaigns(platform),
    getCurrentProfile(),
  ]);
  const isTester = profile?.role === 'tester';

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Browse apps</h1>
      <p className="mt-2 text-muted-foreground">
        Pick an app and test it on your own device.
      </p>

      <nav className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/apps"
          className={`
            rounded-full border px-3 py-1 text-sm
            ${platform
      ? ''
      : `bg-muted`}
          `}
        >
          All
        </Link>
        {PLATFORMS.map(p => (
          <Link
            key={p}
            href={`/apps?platform=${p}`}
            className={`
              rounded-full border px-3 py-1 text-sm
              ${platform === p
            ? `bg-muted`
            : ''}
            `}
          >
            {p}
          </Link>
        ))}
      </nav>

      {campaigns.length === 0
        ? <p className="mt-8 text-muted-foreground">No open apps.</p>
        : (
            <ul className="
              mt-6 grid gap-4
              sm:grid-cols-2
            "
            >
              {campaigns.map(c => (
                <li key={c.id} className="rounded-lg border p-4">
                  <Link
                    href={`/apps/${c.id}`}
                    className="
                      block
                      hover:underline
                    "
                  >
                    <div className="font-medium">{c.title}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {c.appName}
                      {' · '}
                      {c.platforms.join(', ')}
                      {' · '}
                      {c.status}
                      {' · '}
                      {c.submissionsCount}
                      {' reports'}
                    </div>
                  </Link>
                  {isTester && (
                    <Link
                      href={`/dashboard/reports/new/${c.id}`}
                      className="
                        mt-3 inline-block rounded-md border px-3 py-1 text-sm
                        font-medium
                        hover:bg-muted
                      "
                    >
                      Submit a report
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
    </div>
  );
}
