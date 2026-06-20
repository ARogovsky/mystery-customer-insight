import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { profiles } from '@/models/Schema';

type UserRole = 'developer' | 'tester';

/** Профиль текущего пользователя Clerk или null, если он ещё не выбрал роль. */
export async function getCurrentProfile() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const rows = await db
    .select()
    .from(profiles)
    .where(eq(profiles.clerkUserId, userId))
    .limit(1);

  return rows[0] ?? null;
}

/** Создаёт профиль для текущего пользователя с выбранной ролью (идемпотентно). */
export async function createProfileWithRole(role: UserRole) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  await db
    .insert(profiles)
    .values({ clerkUserId: userId, role })
    .onConflictDoNothing({ target: profiles.clerkUserId });
}
