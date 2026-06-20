import { desc, eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { getCurrentProfile } from '@/libs/Profile';
import { tests, testSubmissions } from '@/models/Schema';

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
