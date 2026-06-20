'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import * as z from 'zod';
import { db } from '@/libs/DB';
import { reviews } from '@/models/Schema';

const ReviewSchema = z.object({
  appId: z.uuid(),
  body: z.string().min(1).max(2000),
  rating: z.coerce.number().int().min(1).max(5).optional(),
});

// Отзыв анонимный (без автора) и публикуется сразу, НО оставить его может только
// авторизованный пользователь — любой роли (developer или tester).
export async function createReview(appId: string, formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const parsed = ReviewSchema.safeParse({
    appId,
    body: formData.get('body'),
    rating: formData.get('rating') || undefined,
  });

  if (!parsed.success) {
    throw new Error('Invalid review');
  }

  await db.insert(reviews).values({
    appId: parsed.data.appId,
    body: parsed.data.body,
    rating: parsed.data.rating,
  });

  revalidatePath('/apps');
}
