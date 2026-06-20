import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { createProfileWithRole, getCurrentProfile } from '@/libs/Profile';

type RoleOnboardingProps = {
  params: Promise<{ locale: string }>;
};

export default async function RoleOnboardingPage(props: RoleOnboardingProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  // Роль уже выбрана → профиль есть → на дашборд.
  const profile = await getCurrentProfile();

  if (profile) {
    redirect('/dashboard');
  }

  async function chooseRole(role: 'developer' | 'tester') {
    'use server';

    await createProfileWithRole(role);
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold">Choose your role</h1>
        <p className="mt-2 text-muted-foreground">
          How will you use Mystery Customer Insight?
        </p>

        <form className="mt-6 flex flex-col gap-3">
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
    </div>
  );
}
