import { and, arrayContains, desc, eq, sql } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { apps, profiles, testQuestions, tests, testSubmissions } from '@/models/Schema';

const PLATFORMS = ['ios', 'android', 'web', 'other'] as const;
export type Platform = (typeof PLATFORMS)[number];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parsePlatform(value?: string): Platform | undefined {
  return PLATFORMS.includes(value as Platform) ? (value as Platform) : undefined;
}

/** Публичная лента: открытые, не скрытые кампании (опц. фильтр по платформе). */
export async function getOpenCampaigns(platform?: Platform) {
  const conditions = [
    eq(tests.status, 'open'),
    eq(tests.isHidden, false),
    eq(apps.isHidden, false),
  ];

  if (platform) {
    conditions.push(arrayContains(tests.platforms, [platform]));
  }

  return db
    .select({
      id: tests.id,
      title: tests.title,
      status: tests.status,
      platforms: tests.platforms,
      createdAt: tests.createdAt,
      appName: apps.name,
      submissionsCount: sql<number>`(
        select count(*)::int from ${testSubmissions}
        where ${testSubmissions.testId} = ${tests.id}
          and ${testSubmissions.isHidden} = false
      )`,
    })
    .from(tests)
    .innerJoin(apps, eq(tests.appId, apps.id))
    .where(and(...conditions))
    .orderBy(desc(tests.createdAt));
}

/** Публичная страница кампании: данные кампании + приложения + разработчика + вопросы. */
export async function getPublicCampaign(id: string) {
  if (!UUID_RE.test(id)) {
    return null;
  }

  const rows = await db
    .select({
      id: tests.id,
      title: tests.title,
      scenario: tests.scenario,
      platforms: tests.platforms,
      status: tests.status,
      startsAt: tests.startsAt,
      endsAt: tests.endsAt,
      appId: apps.id,
      appName: apps.name,
      appDescription: apps.description,
      appUrl: apps.appUrl,
      developerName: profiles.displayName,
    })
    .from(tests)
    .innerJoin(apps, eq(tests.appId, apps.id))
    .innerJoin(profiles, eq(apps.developerId, profiles.id))
    .where(and(eq(tests.id, id), eq(tests.isHidden, false), eq(apps.isHidden, false)))
    .limit(1);

  const campaign = rows[0];

  if (!campaign) {
    return null;
  }

  const questions = await db
    .select({ id: testQuestions.id, prompt: testQuestions.prompt, type: testQuestions.type, options: testQuestions.options })
    .from(testQuestions)
    .where(eq(testQuestions.testId, id))
    .orderBy(testQuestions.position);

  return { ...campaign, questions };
}
