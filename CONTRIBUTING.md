# Contributing to Mystery Customer Insight

Thanks for considering a contribution! This guide explains how to propose changes
and the terms under which contributions are accepted.

## Contributor License Agreement (required)

This project is open source under **AGPL-3.0**, but the maintainer also intends to
offer a hosted/commercial version. To make that possible while accepting community
contributions, **every contribution requires acceptance of the
[Contributor License Agreement (CLA)](CLA.md)**.

In short: you keep ownership of your contribution, but you grant the maintainer a
broad, sublicensable license to use it under any terms — including proprietary and
commercial/SaaS offerings. See [CLA.md](CLA.md) for the full text.

On your first pull request, an automated CLA check will ask you to confirm
acceptance. PRs cannot be merged until the CLA is signed.

## Development setup

- Node.js **24** (see `.nvmrc`; use `nvm use 24`).
- Install dependencies: `npm ci`.
- Local database runs in Docker: `docker compose up -d` (Postgres on port 5434).
- Start the dev server: `npm run dev:next`.

## Before opening a pull request

Run the same checks CI and the pre-commit hooks enforce — all must pass:

```bash
npm run check:types   # TypeScript
npm run lint          # ESLint (use npm run lint:fix to autofix)
npm run check:deps    # knip (unused deps/exports)
npm run check:i18n    # i18n keys (en is the source; uk must mirror)
npm run test:e2e      # Playwright end-to-end suite
```

## Pull request guidelines

- Branch off `main`; do not push directly to `main`.
- Use **Conventional Commits** (e.g., `feat(scope): summary`, `fix: …`); the commit
  header must be ≤100 characters.
- Keep PRs focused; describe what changed, why, and how you tested it.
- Add or update tests for new features and bug fixes.
- Update user-facing strings in `src/locales/en.json` (source) and mirror in
  `src/locales/uk.json`.

## Reporting issues

Open a GitHub issue with clear steps to reproduce, expected vs. actual behavior,
and environment details.

## License

By contributing, your contributions are licensed under the project's AGPL-3.0
license and, additionally, under the broad grant described in [CLA.md](CLA.md).
