import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getMyReports } from '@/features/reports/queries';
import { getCurrentProfile } from '@/libs/Profile';

type ReportsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ReportsPage(props: ReportsPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/onboarding/role');
  }

  if (profile.role !== 'tester') {
    return <p className="text-muted-foreground">Only testers have reports.</p>;
  }

  const reports = await getMyReports();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My reports</h1>
        <Link
          href="/campaigns"
          className="
            rounded-md border px-4 py-2 font-medium
            hover:bg-muted
          "
        >
          Browse campaigns
        </Link>
      </div>

      {reports.length === 0
        ? <p className="text-muted-foreground">No reports yet.</p>
        : (
            <ul className="space-y-2">
              {reports.map(r => (
                <li key={r.id} className="rounded-md border p-3">
                  <Link
                    href={`/campaigns/${r.testId}`}
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
