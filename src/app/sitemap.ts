import type { MetadataRoute } from 'next';
import { getOpenCampaigns } from '@/features/public/queries';
import { routing } from '@/libs/I18nRouting';
import { getBaseUrl, getI18nPath } from '@/utils/Helpers';

// Статичные публичные маршруты + динамические страницы открытых кампаний.
const STATIC_ROUTES = [
  '',
  '/apps',
  '/how-it-works',
  '/toplist',
  '/faq',
  '/privacy',
  '/cookies',
  '/disclaimer',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  let appRoutes: string[] = [];
  try {
    const campaigns = await getOpenCampaigns();
    appRoutes = campaigns.map(c => `/apps/${c.id}`);
  } catch {
    // БД недоступна при сборке — sitemap всё равно отдаст статичные маршруты.
    appRoutes = [];
  }

  const routes = [...STATIC_ROUTES, ...appRoutes];

  return routes.map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    alternates: {
      languages: Object.fromEntries(
        routing.locales
          .filter(locale => locale !== routing.defaultLocale)
          .map(locale => [locale, `${baseUrl}${getI18nPath(route, locale)}`]),
      ),
    },
  }));
}
