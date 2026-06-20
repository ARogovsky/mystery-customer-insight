'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import * as z from 'zod';
import { db } from '@/libs/DB';
import { getCurrentProfile } from '@/libs/Profile';
import { apps, testQuestions, tests } from '@/models/Schema';

const PLATFORMS = ['ios', 'android', 'web', 'other'] as const;
const QUESTION_TYPES = ['text', 'rating', 'boolean', 'choice'] as const;
const TEST_STATUSES = ['draft', 'open', 'closed'] as const;
const MAX_QUESTIONS = 5;

const CampaignSchema = z.object({
  appName: z.string().min(1).max(120),
  appUrl: z.url(),
  description: z.string().max(2000).optional(),
  platforms: z.array(z.enum(PLATFORMS)).min(1),
  title: z.string().min(1).max(160),
  scenario: z.string().min(1).max(5000),
  status: z.enum(TEST_STATUSES).default('open'),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  questions: z.array(
    z
      .object({
        prompt: z.string().min(1),
        type: z.enum(QUESTION_TYPES),
        options: z.array(z.string().min(1)).optional(),
      })
      // choice требует минимум 2 варианта
      .refine(q => q.type !== 'choice' || (q.options?.length ?? 0) >= 2, {
        message: 'choice requires at least 2 options',
      }),
  ),
});

export async function createCampaign(formData: FormData) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== 'developer') {
    throw new Error('Forbidden');
  }

  const questions: {
    prompt: string;
    type: FormDataEntryValue | null;
    options?: string[];
  }[] = [];

  for (let i = 0; i < MAX_QUESTIONS; i++) {
    const prompt = (formData.get(`q_prompt_${i}`) as string | null)?.trim();

    if (prompt) {
      const rawOptions = (formData.get(`q_options_${i}`) as string | null) ?? '';
      const options = rawOptions
        .split(',')
        .map(o => o.trim())
        .filter(Boolean);

      questions.push({
        prompt,
        type: formData.get(`q_type_${i}`),
        ...(options.length > 0 ? { options } : {}),
      });
    }
  }

  const parsed = CampaignSchema.safeParse({
    appName: formData.get('appName'),
    appUrl: formData.get('appUrl'),
    description: formData.get('description') || undefined,
    platforms: formData.getAll('platforms'),
    title: formData.get('title'),
    scenario: formData.get('scenario'),
    status: formData.get('status') || undefined,
    startsAt: formData.get('startsAt') || undefined,
    endsAt: formData.get('endsAt') || undefined,
    questions,
  });

  if (!parsed.success) {
    throw new Error('Invalid input');
  }

  const data = parsed.data;

  await db.transaction(async (tx) => {
    const appRows = await tx
      .insert(apps)
      .values({
        developerId: profile.id,
        name: data.appName,
        description: data.description,
        appUrl: data.appUrl,
        platforms: data.platforms,
      })
      .returning({ id: apps.id });

    const app = appRows[0];

    if (!app) {
      throw new Error('Failed to create app');
    }

    const testRows = await tx
      .insert(tests)
      .values({
        appId: app.id,
        title: data.title,
        scenario: data.scenario,
        platforms: data.platforms,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        status: data.status,
      })
      .returning({ id: tests.id });

    const test = testRows[0];

    if (!test) {
      throw new Error('Failed to create campaign');
    }

    if (data.questions.length > 0) {
      await tx.insert(testQuestions).values(
        data.questions.map((q, idx) => ({
          testId: test.id,
          position: idx,
          prompt: q.prompt,
          type: q.type,
          options: q.options ?? null,
        })),
      );
    }
  });

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

/** Смена статуса кампании владельцем (draft/open/closed). */
export async function updateCampaignStatus(testId: string, formData: FormData) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== 'developer') {
    throw new Error('Forbidden');
  }

  const status = z.enum(TEST_STATUSES).parse(formData.get('status'));

  // Меняем статус только если кампания принадлежит текущему разработчику.
  const owned = await db
    .select({ id: tests.id })
    .from(tests)
    .innerJoin(apps, eq(apps.id, tests.appId))
    .where(and(eq(tests.id, testId), eq(apps.developerId, profile.id)))
    .limit(1);

  if (!owned[0]) {
    throw new Error('Forbidden');
  }

  await db.update(tests).set({ status }).where(eq(tests.id, testId));

  revalidatePath('/dashboard');
  revalidatePath('/apps');
}
