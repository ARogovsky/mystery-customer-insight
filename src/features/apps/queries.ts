import { desc, eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { getCurrentProfile } from '@/libs/Profile';
import { apps } from '@/models/Schema';

/** Приложения текущего разработчика (новые сверху). */
export async function getMyApps() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return [];
  }

  return db
    .select()
    .from(apps)
    .where(eq(apps.developerId, profile.id))
    .orderBy(desc(apps.createdAt));
}
