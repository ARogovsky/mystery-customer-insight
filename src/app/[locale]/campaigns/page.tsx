import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { getOpenCampaigns, parsePlatform } from '@/features/public/queries';

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

  const campaigns = await getOpenCampaigns(platform);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Browse campaigns</h1>
      <p className="mt-2 text-muted-foreground">
        Pick a campaign and test it on your own device.
      </p>

      <nav className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/campaigns"
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
            href={`/campaigns?platform=${p}`}
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
        ? <p className="mt-8 text-muted-foreground">No open campaigns.</p>
        : (
            <ul className="
              mt-6 grid gap-4
              sm:grid-cols-2
            "
            >
              {campaigns.map(c => (
                <li key={c.id}>
                  <Link
                    href={`/campaigns/${c.id}`}
                    className="
                      block rounded-lg border p-4
                      hover:bg-muted
                    "
                  >
                    <div className="font-medium">{c.title}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {c.appName}
                      {' · '}
                      {c.platforms.join(', ')}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
    </div>
  );
}
