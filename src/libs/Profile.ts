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

/**
 * Создаёт профиль для текущего пользователя с выбранной ролью (идемпотентно).
 * Если профиль уже есть и передан displayName — обновляет имя (роль не трогаем).
 */
export async function createProfileWithRole(role: UserRole, displayName?: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const insert = db
    .insert(profiles)
    .values({ clerkUserId: userId, role, displayName: displayName ?? null });

  if (displayName) {
    await insert.onConflictDoUpdate({
      target: profiles.clerkUserId,
      set: { displayName },
    });
  } else {
    await insert.onConflictDoNothing({ target: profiles.clerkUserId });
  }
}
