import { useTranslations } from 'next-intl';
import { createReport } from './actions';

const REASONS = ['spam', 'inappropriate', 'broken', 'other'] as const;

const REASON_KEYS = {
  spam: 'reason_spam',
  inappropriate: 'reason_inappropriate',
  broken: 'reason_broken',
  other: 'reason_other',
} as const;

type ReportFormProps = {
  targetType: 'app' | 'test' | 'submission' | 'review';
  targetId: string;
};

// Анонимная форма репорта (без регистрации, поля обязательны). 3 репорта → автоскрытие.
export function ReportForm({ targetType, targetId }: ReportFormProps) {
  const action = createReport.bind(null, targetType, targetId);
  const t = useTranslations('ModerationReport');

  return (
    <details className="mt-2 text-sm">
      <summary className="cursor-pointer text-muted-foreground">{t('report')}</summary>
      <form action={action} className="mt-2 flex max-w-sm flex-col gap-2">
        <select name="reason" required className="rounded-md border px-2 py-1">
          <option value="">{t('reason_placeholder')}</option>
          {REASONS.map(r => (
            <option key={r} value={r}>{t(REASON_KEYS[r])}</option>
          ))}
        </select>
        <textarea
          name="details"
          required
          placeholder={t('details_placeholder')}
          className="rounded-md border px-2 py-1"
        />
        <input
          name="email"
          type="email"
          placeholder={t('email_placeholder')}
          className="rounded-md border px-2 py-1"
        />
        <button type="submit" className="self-start rounded-md border px-3 py-1">
          {t('send_report')}
        </button>
      </form>
    </details>
  );
}
