import { createCampaign } from './actions';

const PLATFORMS = ['ios', 'android', 'web', 'other'] as const;
const QUESTION_TYPES = ['text', 'rating', 'boolean', 'choice'] as const;
const QUESTION_ROWS = [0, 1, 2, 3, 4];

const inputClass = 'rounded-md border px-3 py-2';

export function SubmitAppForm() {
  return (
    <form action={createCampaign} className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-3">
        <legend className="font-medium">App</legend>
        <input name="appName" required placeholder="App name" className={inputClass} />
        <input
          name="appUrl"
          type="url"
          required
          placeholder="https://… store or web link"
          className={inputClass}
        />
        <textarea
          name="description"
          placeholder="Short description (optional)"
          className={inputClass}
        />
        <div className="flex flex-wrap gap-3">
          <span className="text-sm text-muted-foreground">Platforms:</span>
          {PLATFORMS.map(p => (
            <label key={p} className="flex items-center gap-1 text-sm">
              <input type="checkbox" name="platforms" value={p} />
              {' '}
              {p}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="font-medium">Test details</legend>
        <input name="title" required placeholder="Test title" className={inputClass} />
        <textarea
          name="scenario"
          required
          placeholder="Test scenario / tasks for the tester"
          className={inputClass}
          rows={4}
        />
        <label className="flex flex-col text-sm">
          Status
          <select name="status" className={inputClass} defaultValue="open">
            <option value="draft">draft</option>
            <option value="open">open</option>
            <option value="closed">closed</option>
          </select>
        </label>
        <div className="flex gap-3">
          <label className="flex flex-col text-sm">
            Starts
            <input name="startsAt" type="date" className={inputClass} />
          </label>
          <label className="flex flex-col text-sm">
            Ends
            <input name="endsAt" type="date" className={inputClass} />
          </label>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="font-medium">Questions (optional, up to 5)</legend>
        {QUESTION_ROWS.map(i => (
          <div key={i} className="flex flex-wrap gap-2">
            <input
              name={`q_prompt_${i}`}
              placeholder={`Question ${i + 1}`}
              className={`
                grow
                ${inputClass}
              `}
            />
            <select name={`q_type_${i}`} className={inputClass}>
              {QUESTION_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <input
              name={`q_options_${i}`}
              placeholder="Options for choice (comma-separated)"
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
          self-start rounded-md border px-4 py-2 font-medium
          hover:bg-muted
        "
      >
        Submit app
      </button>
    </form>
  );
}
