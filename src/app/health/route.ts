import { sql } from 'drizzle-orm';
import { db } from '@/libs/DB';

// Публичный health-check (без Clerk, без локали — исключён в middleware matcher).
// Лёгкий `select 1`: проверяет живость БД и служит keep-alive для Supabase free tier.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await db.execute(sql`select 1`);

    return Response.json({ ok: true }, { status: 200 });
  } catch {
    return Response.json({ ok: false }, { status: 503 });
  }
}
