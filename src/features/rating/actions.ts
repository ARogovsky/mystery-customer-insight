'use server';

import { eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/libs/DB';
import { getCurrentProfile } from '@/libs/Profile';
import { apps, testerRatingEvents, testerStats, tests, testSubmissions } from '@/models/Schema';

// Разработчик ставит «+1» за сабмишн. Анонимно (адресат не раскрывается в UI),
// один плюс на сабмишн; начисляется в tester_stats.
export async function rateSubmission(submissionId: string, testId: string) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== 'developer') {
    throw new Error('Forbidden');
  }

  const rows = await db
    .select({
      testerId: testSubmissions.testerId,
      developerId: apps.developerId,
    })
    .from(testSubmissions)
    .innerJoin(tests, eq(tests.id, testSubmissions.testId))
    .innerJoin(apps, eq(apps.id, tests.appId))
    .where(eq(testSubmissions.id, submissionId))
    .limit(1);

  const sub = rows[0];

  if (!sub || sub.developerId !== profile.id) {
    throw new Error('Forbidden');
  }

  await db.transaction(async (tx) => {
    const inserted = await tx
      .insert(testerRatingEvents)
      .values({ submissionId, developerId: profile.id, testerId: sub.testerId })
      .onConflictDoNothing({ target: testerRatingEvents.submissionId })
      .returning({ id: testerRatingEvents.id });

    if (inserted.length > 0) {
      await tx
        .insert(testerStats)
        .values({ profileId: sub.testerId, ratingPoints: 1 })
        .onConflictDoUpdate({
          target: testerStats.profileId,
          set: { ratingPoints: sql`${testerStats.ratingPoints} + 1` },
        });
    }
  });

  revalidatePath(`/dashboard/apps/${testId}/submissions`);
}
