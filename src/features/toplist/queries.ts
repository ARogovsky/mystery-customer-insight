import { desc, eq, gt } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { profiles, testerStats } from '@/models/Schema';

/** Топ тестеров по рейтингу (только с рейтингом > 0). */
export async function getTopTesters() {
  return db
    .select({
      id: profiles.id,
      points: testerStats.ratingPoints,
      testsCompleted: testerStats.testsCompleted,
      name: profiles.displayName,
    })
    .from(testerStats)
    .innerJoin(profiles, eq(profiles.id, testerStats.profileId))
    .where(gt(testerStats.ratingPoints, 0))
    .orderBy(desc(testerStats.ratingPoints))
    .limit(20);
}
