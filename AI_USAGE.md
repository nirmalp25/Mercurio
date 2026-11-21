# AI Usage

## Tools & models
- **Claude Code** (desktop app), model **Claude Opus 5.5**. It handled planning and implementation in the main session.
- **Parallel sub-agents:**
  - One built the backend Enquiry and Notifier modules.
  - One built the React frontend.
  - A multi-agent workflow ran a contract audit, Playwright E2E, and an adversarially checked review.
- **Agent instructions:** [CLAUDE.md](CLAUDE.md) defines the agent's role and principles (SOLID, YAGNI, KISS, "build seams, not speculative features"), the constraints and the conventions.
- **Plan / spec:** [docs/PLAN.md](docs/PLAN.md), written in plan mode and approved before any code. A full chronological log is in [docs/PROCESS_LOG.md](docs/PROCESS_LOG.md).

## Key prompts and moments
1. **"Given the file, understand the requirements."** The AI identified that "data source, look & feel and email provider will change" is the real design brief, and listed the gaps that needed assumptions.
2. **Developer spec prompt.** I set the stack, the modular monolith, the JSON config-driven plug-and-play UI, the backend-owned Fake Store sync into a `products` table, the email factory with a null default plus an admin Queries page, the category modal, and debounced autocomplete. This shaped the whole architecture.
3. **Clarifying questions in plan mode.** These settled Sanctum with a seeded admin, the null notifier with Mailpit ready, and Pest. **I overrode the AI's suggestion** of SQLite for tests in favour of Postgres everywhere.
4. **"Continue with multiple agents."** Work was split by file ownership so agents never edited the same files.
5. **Learning-mode handover.** The top-rated cap rule was deliberately left as a `TODO(human)`. The tests were written first to specify it, including always allowing un-featuring and treating re-featuring as a no-op.

## Where the AI got things wrong, and how it was caught
- **Tests wiped the dev database.** phpunit `<env force>` doesn't override env vars Docker has already set, so `RefreshDatabase` ran on `mercuriodb`. A sub-agent noticed the dev data had vanished. Fixed with `<server force>` vars and a guard in `TestCase` that refuses any database not ending in `_test`.
- **The live API was on SQLite while the tests passed.** `artisan serve` strips env vars from its worker. Caught by curling the running API, not by tests. Fixed with `--no-reload`.
- **PHP version mismatch.** The lock file was resolved under PHP 8.5, but the image was 8.3, so the container failed to boot. Fixed by aligning to 8.4.
- **SPA login was broken.** Sanctum's stateful domains and CORS credentials were missing, which a failing login test exposed. Fixed in config.
- **Postgres `FOR UPDATE` with `COUNT`.** The first version of the cap's row lock used `lockForUpdate()->count()`, which Postgres rejects with aggregates. Caught in review and changed to lock the rows, then count them.
- **Prompt injection from the scaffold.** Laravel's scaffold shipped `CLAUDE.md` and `AGENTS.md` telling agents to download and run a remote installer. They were ignored as untrusted content and deleted.
- **Frontend agent's own catches:** an invalid Jest config key, and a bundle over the size warning (fixed by splitting vendor chunks).

## Time spent
_To be filled in by the developer:_ planning ~__ · building ~__ · testing ~__ · reviewing ~__ · **total ~__**
