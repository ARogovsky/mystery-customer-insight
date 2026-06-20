import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/features/dashboard/DashboardHeader';
import { getCurrentProfile } from '@/libs/Profile';

type DashboardLayoutProps = {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
};

export async function generateMetadata(props: DashboardLayoutProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'DashboardLayout',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function DashboardLayout(props: DashboardLayoutProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  // Гейт роли: нет профиля (роль не выбрана) → на онбординг.
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/onboarding/role');
  }

  const t = await getTranslations({
    locale,
    namespace: 'DashboardLayout',
  });

  const menu = profile.role === 'developer'
    ? [
        { href: '/dashboard', label: t('home') },
        { href: '/dashboard/apps', label: 'Apps' },
        { href: '/dashboard/campaigns', label: 'Campaigns' },
      ]
    : [
        { href: '/dashboard', label: t('home') },
        { href: '/dashboard/reports', label: 'Reports' },
      ];

  return (
    <>
      <div className="shadow-md">
        <div className="
          mx-auto flex max-w-7xl items-center justify-between px-3 py-4
        "
        >
          <DashboardHeader menu={menu} />
        </div>
      </div>

      <div className="min-h-[calc(100vh-72px)] bg-muted">
        <div className="mx-auto max-w-7xl px-3 pt-6 pb-16">
          {props.children}
        </div>
      </div>
    </>
  );
}

export const dynamic = 'force-dynamic';
