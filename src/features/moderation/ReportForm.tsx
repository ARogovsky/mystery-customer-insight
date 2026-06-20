import { createReport } from './actions';

const REASONS = ['spam', 'inappropriate', 'broken', 'other'];

type ReportFormProps = {
  targetType: 'app' | 'test' | 'submission' | 'review';
  targetId: string;
};

// Анонимная форма репорта (без регистрации, поля обязательны). 3 репорта → автоскрытие.
export function ReportForm({ targetType, targetId }: ReportFormProps) {
  const action = createReport.bind(null, targetType, targetId);

  return (
    <details className="mt-2 text-sm">
      <summary className="cursor-pointer text-muted-foreground">Report</summary>
      <form action={action} className="mt-2 flex max-w-sm flex-col gap-2">
        <select name="reason" required className="rounded-md border px-2 py-1">
          <option value="">Reason…</option>
          {REASONS.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <textarea
          name="details"
          required
          placeholder="Details (required)"
          className="rounded-md border px-2 py-1"
        />
        <input
          name="email"
          type="email"
          placeholder="Email (optional)"
          className="rounded-md border px-2 py-1"
        />
        <button type="submit" className="self-start rounded-md border px-3 py-1">
          Send report
        </button>
      </form>
    </details>
  );
}
