import { createHash } from 'node:crypto';

// Хеш для transaction_id конверсий: не раскрываем Google сырые id (Clerk userId и т.п.),
// но сохраняем уникальность для дедупликации. Серверная утилита.
export function hashId(...parts: (string | number)[]): string {
  return createHash('sha256').update(parts.join(':')).digest('hex').slice(0, 32);
}
