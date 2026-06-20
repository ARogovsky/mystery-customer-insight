import { desc, eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { getCurrentProfile } from '@/libs/Profile';
import { testerStats, tests, testSubmissions } from '@/models/Schema';

/** Отчёты текущего тестера (новые сверху). */
export async function getMyReports() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return [];
  }

  return db
    .select({
      id: testSubmissions.id,
      testId: testSubmissions.testId,
      title: tests.title,
      createdAt: testSubmissions.createdAt,
    })
    .from(testSubmissions)
    .innerJoin(tests, eq(tests.id, testSubmissions.testId))
    .where(eq(testSubmissions.testerId, profile.id))
    .orderBy(desc(testSubmissions.createdAt));
}

/** Рейтинг текущего тестера (агрегат, без привязки к тестам). */
export async function getMyRating() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return 0;
  }

  const rows = await db
    .select({ points: testerStats.ratingPoints })
    .from(testerStats)
    .where(eq(testerStats.profileId, profile.id))
    .limit(1);

  return rows[0]?.points ?? 0;
}
