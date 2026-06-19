import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Node/Vercel-рантайм. Подключение к Supabase по SESSION POOLER (IPv4, порт 5432) из DATABASE_URL.
// Session-режим поддерживает prepared statements → драйвер не трогаем (prepare оставляем по умолчанию).
// На serverless держим клиент на module scope, чтобы переиспользовать между инвокациями
// в рамках одного тёплого инстанса.
const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString, {
  // на serverless разумно ограничить пул на инстанс
  max: 1,
});

export const db = drizzle(client, { schema });
export { schema };

// Апгрейд при упоре в лимит соединений free-tier:
// рантайм → transaction pooler (6543) с { prepare: false },
// миграции/билд → оставить session pooler (5432) через отдельный DATABASE_URL.
