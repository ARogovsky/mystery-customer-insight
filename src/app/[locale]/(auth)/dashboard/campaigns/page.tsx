import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getMyCampaigns } from '@/features/campaigns/queries';
import { getCurrentProfile } from '@/libs/Profile';

type CampaignsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function CampaignsPage(props: CampaignsPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/onboarding/role');
  }

  if (profile.role !== 'developer') {
    return <p className="text-muted-foreground">Only developers can manage campaigns.</p>;
  }

  const campaigns = await getMyCampaigns();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your campaigns</h1>
        <Link
          href="/dashboard/campaigns/new"
          className="
            rounded-md border px-4 py-2 font-medium
            hover:bg-muted
          "
        >
          Post a campaign
        </Link>
      </div>

      {campaigns.length === 0
        ? <p className="text-muted-foreground">No campaigns yet.</p>
        : (
            <ul className="space-y-2">
              {campaigns.map(c => (
                <li key={c.id} className="rounded-md border p-3">
                  <Link
                    href={`/dashboard/campaigns/${c.id}/submissions`}
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
                </li>
              ))}
            </ul>
          )}
    </div>
  );
}
