import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { SubmitAppForm } from '@/features/campaigns/SubmitAppForm';
import { getCurrentProfile } from '@/libs/Profile';

type NewCampaignPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function NewCampaignPage(props: NewCampaignPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/dashboard');
  }

  if (profile.role !== 'developer') {
    return <p className="text-muted-foreground">Only developers can submit apps.</p>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold">Submit an app</h1>
      <SubmitAppForm />
    </div>
  );
}
