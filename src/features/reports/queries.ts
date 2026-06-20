import { desc, eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { getCurrentProfile } from '@/libs/Profile';
import { testerRatingEvents, testerStats, tests, testSubmissions } from '@/models/Schema';

/** Отчёты текущего тестера (новые сверху) + признак «оценён разработчиком» (+1). */
export async function getMyReports() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return [];
  }

  const rows = await db
    .select({
      id: testSubmissions.id,
      testId: testSubmissions.testId,
      title: tests.title,
      createdAt: testSubmissions.createdAt,
      ratedId: testerRatingEvents.id,
    })
    .from(testSubmissions)
    .innerJoin(tests, eq(tests.id, testSubmissions.testId))
    .leftJoin(testerRatingEvents, eq(testerRatingEvents.submissionId, testSubmissions.id))
    .where(eq(testSubmissions.testerId, profile.id))
    .orderBy(desc(testSubmissions.createdAt));

  return rows.map(({ ratedId, ...r }) => ({ ...r, rated: ratedId != null }));
}

/** Агрегаты текущего тестера: рейтинг (плюсы) и число завершённых тестов. */
export async function getMyStats() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return { ratingPoints: 0, testsCompleted: 0 };
  }

  const rows = await db
    .select({
      ratingPoints: testerStats.ratingPoints,
      testsCompleted: testerStats.testsCompleted,
    })
    .from(testerStats)
    .where(eq(testerStats.profileId, profile.id))
    .limit(1);

  return {
    ratingPoints: rows[0]?.ratingPoints ?? 0,
    testsCompleted: rows[0]?.testsCompleted ?? 0,
  };
}
