'use server';

import { and, eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import * as z from 'zod';
import { db } from '@/libs/DB';
import { hashId } from '@/libs/hashId';
import { getCurrentProfile } from '@/libs/Profile';
import { submissionAnswers, testerStats, testQuestions, tests, testSubmissions } from '@/models/Schema';

type AnswerRow = {
  submissionId: string;
  questionId: string;
  answerText: string | null;
  answerValue: unknown;
};

export async function createSubmission(testId: string, formData: FormData) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== 'tester') {
    throw new Error('Forbidden');
  }

  const testRows = await db
    .select({ id: tests.id })
    .from(tests)
    .where(and(eq(tests.id, testId), eq(tests.isHidden, false)))
    .limit(1);

  if (!testRows[0]) {
    throw new Error('Campaign not found');
  }

  const questions = await db
    .select({ id: testQuestions.id, type: testQuestions.type })
    .from(testQuestions)
    .where(eq(testQuestions.testId, testId));

  const freeText = (formData.get('freeText') as string | null)?.trim() || null;
  const linkUrl = (formData.get('linkUrl') as string | null)?.trim() || null;

  if (linkUrl && !z.url().safeParse(linkUrl).success) {
    throw new Error('Invalid link');
  }

  let createdSubmissionId: string | undefined;

  await db.transaction(async (tx) => {
    const subRows = await tx
      .insert(testSubmissions)
      .values({ testId, testerId: profile.id, freeText, linkUrl })
      .returning({ id: testSubmissions.id });

    const submission = subRows[0];

    if (!submission) {
      throw new Error('Failed to create submission');
    }

    createdSubmissionId = submission.id;

    const answers: AnswerRow[] = [];

    for (const q of questions) {
      const raw = formData.get(`a_${q.id}`);

      if (raw === null || raw === '') {
        continue;
      }

      if (q.type === 'text') {
        answers.push({ submissionId: submission.id, questionId: q.id, answerText: String(raw).trim(), answerValue: null });
      } else {
        const value = q.type === 'rating' ? Number(raw) : q.type === 'boolean' ? raw === 'true' : raw;
        answers.push({ submissionId: submission.id, questionId: q.id, answerText: null, answerValue: value });
      }
    }

    if (answers.length > 0) {
      await tx.insert(submissionAnswers).values(answers);
    }

    // Учёт завершённого теста в агрегате тестера.
    await tx
      .insert(testerStats)
      .values({ profileId: profile.id, testsCompleted: 1 })
      .onConflictDoUpdate({
        target: testerStats.profileId,
        set: { testsCompleted: sql`${testerStats.testsCompleted} + 1` },
      });
  });

  // Конверсия report_submitted ($1000) — сигнал клиенту через cookie.
  if (createdSubmissionId) {
    (await cookies()).set(
      'mci_conv',
      JSON.stringify({
        type: 'report_submitted',
        txn: hashId(createdSubmissionId, profile.id),
      }),
      { path: '/', maxAge: 120, httpOnly: false, sameSite: 'lax' },
    );
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}
