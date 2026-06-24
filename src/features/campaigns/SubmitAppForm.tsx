import { useTranslations } from 'next-intl';
import { createCampaign } from './actions';

const PLATFORMS = ['ios', 'android', 'web', 'other'] as const;
const QUESTION_TYPES = ['text', 'rating', 'boolean', 'choice'] as const;
const QUESTION_ROWS = [0, 1, 2, 3, 4];

const inputClass
  = 'w-full rounded-lg border bg-card px-3 py-2 text-sm focus:outline-2 focus:outline-primary focus:outline-offset-1';

export function SubmitAppForm() {
  const t = useTranslations('SubmitApp');

  const steps = [
    { title: t('step1_title'), text: t('step1_text') },
    { title: t('step2_title'), text: t('step2_text') },
    { title: t('step3_title'), text: t('step3_text') },
  ];

  return (
    <div className="
      grid gap-6
      lg:grid-cols-[1.1fr_0.9fr]
    "
    >
      <form action={createCampaign} className="flex flex-col gap-6">
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 font-medium">{t('app')}</legend>
          <input name="appName" required placeholder={t('app_name')} className={inputClass} />
          <input
            name="appUrl"
            type="url"
            required
            placeholder={t('app_url')}
            className={inputClass}
          />
          <textarea
            name="description"
            placeholder={t('description')}
            className={inputClass}
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">{t('platforms')}</span>
            {PLATFORMS.map(p => (
              <label
                key={p}
                className="
                  flex items-center gap-1.5 rounded-full border bg-card px-3
                  py-1 text-sm
                  has-checked:border-primary has-checked:bg-secondary
                  has-checked:text-secondary-foreground
                "
              >
                <input type="checkbox" name="platforms" value={p} />
                {p}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 font-medium">{t('test_details')}</legend>
          <input name="title" required placeholder={t('test_title')} className={inputClass} />
          <textarea
            name="scenario"
            required
            placeholder={t('scenario')}
            className={inputClass}
            rows={4}
          />
          <label className="flex flex-col gap-1 text-sm">
            {t('status')}
            <select name="status" className={inputClass} defaultValue="open">
              <option value="draft">draft</option>
              <option value="open">open</option>
              <option value="closed">closed</option>
            </select>
          </label>
          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-1 text-sm">
              {t('starts')}
              <input name="startsAt" type="date" className={inputClass} />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-sm">
              {t('ends')}
              <input name="endsAt" type="date" className={inputClass} />
            </label>
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 font-medium">{t('questions')}</legend>
          {QUESTION_ROWS.map(i => (
            <div key={i} className="flex flex-wrap gap-2">
              <input
                name={`q_prompt_${i}`}
                placeholder={t('question', { n: i + 1 })}
                className={`
                  grow
                  ${inputClass}
                `}
              />
              <select
                name={`q_type_${i}`}
                className={`
                  w-auto
                  ${inputClass}
                `}
              >
                {QUESTION_TYPES.map(qt => (
                  <option key={qt} value={qt}>{qt}</option>
                ))}
              </select>
              <input
                name={`q_options_${i}`}
                placeholder={t('options_for_choice')}
                className={`
                  grow
                  ${inputClass}
                `}
              />
            </div>
          ))}
        </fieldset>

        <button
          type="submit"
          className="
            self-start rounded-lg bg-primary px-5 py-2.5 font-medium
            text-primary-foreground shadow-sm transition
            hover:opacity-90
          "
        >
          {t('submit_app')}
        </button>
      </form>

      <aside className="
        h-fit rounded-xl bg-foreground p-6 text-background
        lg:sticky lg:top-24
      "
      >
        <h2 className="text-lg font-semibold text-background">{t('how_it_works')}</h2>
        <ol className="mt-4 flex flex-col gap-4">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-3 text-sm">
              <span
                className="
                  grid size-6 shrink-0 place-items-center rounded-full bg-accent
                  font-mono text-xs font-semibold text-accent-foreground
                "
              >
                {i + 1}
              </span>
              <span>
                <b className="block text-background">{s.title}</b>
                <span className="text-background/70">{s.text}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-background/70">
          {t('free_note')}
        </p>
      </aside>
    </div>
  );
}
