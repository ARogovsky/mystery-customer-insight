import { desc, eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { getCurrentProfile } from '@/libs/Profile';
import { apps, tests } from '@/models/Schema';

/** Кампании текущего разработчика (через его приложения), новые сверху. */
export async function getMyCampaigns() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return [];
  }

  return db
    .select({
      id: tests.id,
      title: tests.title,
      status: tests.status,
      platforms: tests.platforms,
      createdAt: tests.createdAt,
      appName: apps.name,
    })
    .from(tests)
    .innerJoin(apps, eq(tests.appId, apps.id))
    .where(eq(apps.developerId, profile.id))
    .orderBy(desc(tests.createdAt));
}
