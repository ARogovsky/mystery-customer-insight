import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { reviews } from '@/models/Schema';

/** Публичные (не скрытые) отзывы приложения, новые сверху. */
export async function getAppReviews(appId: string) {
  return db
    .select({
      id: reviews.id,
      body: reviews.body,
      rating: reviews.rating,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .where(and(eq(reviews.appId, appId), eq(reviews.isHidden, false)))
    .orderBy(desc(reviews.createdAt));
}
