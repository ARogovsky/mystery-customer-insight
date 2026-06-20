import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { getCurrentProfile } from '@/libs/Profile';
import { apps, testerRatingEvents, tests, testSubmissions } from '@/models/Schema';

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

/** Сабмишны кампании для её владельца (тестеры обезличены). null — если не владелец. */
export async function getCampaignSubmissionsForOwner(testId: string) {
  const profile = await getCurrentProfile();

  if (!profile) {
    return null;
  }

  const owned = await db
    .select({ id: tests.id, title: tests.title })
    .from(tests)
    .innerJoin(apps, eq(apps.id, tests.appId))
    .where(and(eq(tests.id, testId), eq(apps.developerId, profile.id)))
    .limit(1);

  const campaign = owned[0];

  if (!campaign) {
    return null;
  }

  const submissions = await db
    .select({
      id: testSubmissions.id,
      freeText: testSubmissions.freeText,
      linkUrl: testSubmissions.linkUrl,
      createdAt: testSubmissions.createdAt,
      ratedId: testerRatingEvents.id,
    })
    .from(testSubmissions)
    .leftJoin(testerRatingEvents, eq(testerRatingEvents.submissionId, testSubmissions.id))
    .where(eq(testSubmissions.testId, testId))
    .orderBy(desc(testSubmissions.createdAt));

  return { title: campaign.title, submissions };
}
