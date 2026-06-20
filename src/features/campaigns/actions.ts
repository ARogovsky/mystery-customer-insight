'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import * as z from 'zod';
import { db } from '@/libs/DB';
import { getCurrentProfile } from '@/libs/Profile';
import { apps, testQuestions, tests } from '@/models/Schema';

const PLATFORMS = ['ios', 'android', 'web', 'other'] as const;
const QUESTION_TYPES = ['text', 'rating', 'boolean'] as const;
const MAX_QUESTIONS = 5;

const CampaignSchema = z.object({
  appName: z.string().min(1).max(120),
  appUrl: z.url(),
  description: z.string().max(2000).optional(),
  platforms: z.array(z.enum(PLATFORMS)).min(1),
  title: z.string().min(1).max(160),
  scenario: z.string().min(1).max(5000),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  questions: z.array(
    z.object({ prompt: z.string().min(1), type: z.enum(QUESTION_TYPES) }),
  ),
});

export async function createCampaign(formData: FormData) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== 'developer') {
    throw new Error('Forbidden');
  }

  const questions: { prompt: string; type: FormDataEntryValue | null }[] = [];

  for (let i = 0; i < MAX_QUESTIONS; i++) {
    const prompt = (formData.get(`q_prompt_${i}`) as string | null)?.trim();

    if (prompt) {
      questions.push({ prompt, type: formData.get(`q_type_${i}`) });
    }
  }

  const parsed = CampaignSchema.safeParse({
    appName: formData.get('appName'),
    appUrl: formData.get('appUrl'),
    description: formData.get('description') || undefined,
    platforms: formData.getAll('platforms'),
    title: formData.get('title'),
    scenario: formData.get('scenario'),
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
        status: 'open',
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
        })),
      );
    }
  });

  revalidatePath('/dashboard/campaigns');
  redirect('/dashboard/campaigns');
}
