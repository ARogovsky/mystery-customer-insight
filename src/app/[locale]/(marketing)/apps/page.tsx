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
      ? `
        bg-card
        hover:bg-secondary
      `
      : `border-foreground bg-foreground text-background`}
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
            ? `border-foreground bg-foreground text-background`
            : `
              bg-card
              hover:bg-secondary
            `}
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
                <li
                  key={c.id}
                  className="
                    flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-sm
                    transition
                    hover:-translate-y-0.5 hover:shadow-md
                  "
                >
                  <Link href={`/apps/${c.id}`} className="block">
                    <div className="
                      text-lg font-medium
                      hover:text-primary
                    "
                    >
                      {c.title}
                    </div>
                    <div className="
                      mt-0.5 font-mono text-xs text-muted-foreground
                    "
                    >
                      {c.appName}
                    </div>
                  </Link>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`
                        inline-flex items-center gap-1.5 rounded-full px-2.5
                        py-0.5 text-xs font-semibold
                        ${c.status === 'open'
                  ? `bg-success/12 text-success`
                  : `bg-muted text-muted-foreground`}
                      `}
                    >
                      {c.status}
                    </span>
                    {c.platforms.map(p => (
                      <span
                        key={p}
                        className="
                          rounded-full bg-secondary px-2.5 py-0.5 text-xs
                          font-medium text-secondary-foreground
                        "
                      >
                        {p}
                      </span>
                    ))}
                  </div>

                  <div className="
                    mt-auto flex items-center justify-between border-t pt-3
                  "
                  >
                    <span className="font-mono text-xs text-muted-foreground">
                      {c.submissionsCount}
                      {' reports'}
                    </span>
                    {isTester && (
                      <Link
                        href={`/dashboard/reports/new/${c.id}`}
                        className="
                          rounded-md border px-3 py-1 text-sm font-medium
                          hover:bg-secondary
                        "
                      >
                        Submit a report
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
    </div>
  );
}
