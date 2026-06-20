'use server';

import { and, count, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import * as z from 'zod';
import { db } from '@/libs/DB';
import { apps, reports, reviews, tests, testSubmissions } from '@/models/Schema';

const TARGETS = ['app', 'test', 'submission', 'review'] as const;
const THRESHOLD = 3;

const ReportSchema = z.object({
  targetType: z.enum(TARGETS),
  targetId: z.uuid(),
  reason: z.string().min(1),
  details: z.string().min(1).max(2000),
  email: z.email().optional(),
});

export async function createReport(
  targetType: string,
  targetId: string,
  formData: FormData,
) {
  const parsed = ReportSchema.safeParse({
    targetType,
    targetId,
    reason: formData.get('reason'),
    details: formData.get('details'),
    email: formData.get('email') || undefined,
  });

  if (!parsed.success) {
    throw new Error('Invalid report');
  }

  const data = parsed.data;

  await db.transaction(async (tx) => {
    await tx.insert(reports).values({
      targetType: data.targetType,
      targetId: data.targetId,
      reason: data.reason,
      details: data.details,
      reporterEmail: data.email ?? null,
    });

    const rows = await tx
      .select({ c: count() })
      .from(reports)
      .where(and(eq(reports.targetType, data.targetType), eq(reports.targetId, data.targetId)));

    const total = rows[0]?.c ?? 0;
    const set: { isHidden?: boolean; reportCount: number }
      = total >= THRESHOLD ? { isHidden: true, reportCount: total } : { reportCount: total };

    switch (data.targetType) {
      case 'app':
        await tx.update(apps).set(set).where(eq(apps.id, data.targetId));
        break;
      case 'test':
        await tx.update(tests).set(set).where(eq(tests.id, data.targetId));
        break;
      case 'submission':
        await tx.update(testSubmissions).set(set).where(eq(testSubmissions.id, data.targetId));
        break;
      case 'review':
        await tx.update(reviews).set(set).where(eq(reviews.id, data.targetId));
        break;
    }
  });

  revalidatePath('/apps');
}
