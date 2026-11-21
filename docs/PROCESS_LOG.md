# Process Log

A running, dated record of how the solution was planned and built with AI. It is the raw material for `AI_USAGE.md`. Each entry covers the direction given, what the AI proposed, what was accepted, changed or rejected, and why.

---

## 2026-11-21 — Phase 0: Requirements & agent setup

**Direction:** Read the challenge PDF and summarise the requirements.

**AI output:** A summary of the brief, the hard constraints, the acceptance criteria and the deliverables. It also listed the gaps that need an assumption: how top-rated products are chosen, search semantics, enquiry fields, a local mail inbox, and upstream failure.

**Key insight:** The line "data source, look & feel, email provider are expected to change" is the real design brief. Each of the three needs a swappable boundary.

**Direction:** Create `CLAUDE.md` defining the agent role. The agent is a senior full-stack engineer (React+TS, Laravel, Postgres) who follows SOLID, YAGNI and KISS, designs for growth, and documents concisely.

**AI addition, accepted:** A line reconciling "design for growth" with YAGNI: *build the seams for known change, not the speculative features.*

## 2026-11-21 — Phase 1: Planning

**Direction (developer spec):**
- Stack: React+TS, Laravel, Jest, Pest, Playwright; modular monolith.
- JSON config-driven, plug-and-play UI, because the creative work is still in progress.
- The backend owns all Fake Store calls and syncs products into a `products` table with `is_top_rated`, `action_ts` and `category`.
- The admin chooses top-rated products, capped at 5 for testing.
- Categories are a card grid that opens a near-fullscreen modal: a top-rated section with "show more", then all products with ★ badges.
- Search is debounced with autocomplete.
- Enquiry is a modal with phone + country code, email, first and last name, and query. It is stored in the DB with a date and confirmed with a SweetAlert thank-you.
- The email provider is a **factory**, defaulting to null. When it is null, enquiries appear on an admin-only Queries page (role-based views).

**Clarifications resolved:**
- Admin auth: Sanctum + seeded admin.
- Email: null default, with Mailpit ready in compose.
- Backend tests: Pest.
- DB: PostgreSQL only (dev and tests). The developer overrode the AI's suggestion of SQLite for tests.

**Plan:** See [docs/PLAN.md](PLAN.md).

**Design calls made by AI, accepted:**
- Two abstractions in Catalogue. `ProductSource` controls where data comes *from* and is used only by `catalogue:sync`. `ProductRepository` controls how the app *reads* it, from the DB. The frontend sees neither.
- A bundled fixture source, so `docker compose up` works even if fakestoreapi.com is down.
- The enquiry is persisted first, then an `EnquirySubmitted` event triggers the notifier, so a mail failure never loses an enquiry.
- The notifier factory wraps Laravel's mailer rather than replacing it, so SES or Postmark is an `.env` change.

**Environment note:** PHP, Composer and gh are not installed on the host. The backend is built and run entirely inside Docker, which matches the reviewer's `docker compose up` path.

## 2026-11-21 — Phase 2: Backend (Catalogue, Identity, Enquiry, Notifier)

**Direction:** "Continue with multiple agents." Work was split by file ownership so no two agents edited the same files:
- **Main session:** Docker image, module loader, Catalogue and Identity modules.
- **Agent 1:** Enquiry and Notifier modules.
- **Agent 2:** the React frontend.

**Built:**
- `ModuleServiceProvider` convention: each module owns its config, migrations, routes and bindings.
- **Catalogue:**
  - `ProductSource` (FakeStore and Fixture adapters, plus a factory) and `ProductRepository` (Eloquent).
  - `catalogue:sync` is idempotent and never overwrites `is_top_rated`; first run features the top 5 by rating.
  - ILIKE search, title hits first, LIKE wildcards escaped; a trigram index on title.
- **Identity:** Sanctum SPA cookie auth, a `role` column, an `EnsureAdmin` middleware, and the admin seeded from `.env`.
- **Enquiry (agent):** persist, then an after-commit event, then a listener that calls the notifier and logs any failure. Phone validated per country and stored as E.164. Honeypot and throttle.
- **Notifier (agent):** factory with a config driver map (`null`, `mail`) over Laravel's mailer.

**Where the AI got things wrong, and how each was caught:**
1. **Scaffold agent files.** Laravel 13's scaffold ships `backend/CLAUDE.md` and `AGENTS.md` telling agents to download and run a remote PHP installer. They were ignored (third-party content, not the developer's instruction) and deleted, so the root `CLAUDE.md` is the single source of agent instructions.
2. **PHP version mismatch.** The lock file was resolved by the Composer image's PHP 8.5, but the runtime image was PHP 8.3. The container failed to boot with 45 dependency errors. Fixed by moving the runtime to PHP 8.4 and requiring `^8.4`.
3. **Critical: tests wiped the dev DB.** phpunit `<env force>` does not override env vars Docker has already set, so `RefreshDatabase` ran on `mercuriodb`. **Caught by Agent 1**, which noticed the dev DB was empty after its run. Fixed by moving to `<server force>` vars and adding a `TestCase` guard that refuses any database not ending in `_test`.
4. **Login test failed with "Session store not set".** Sanctum's stateful domains and CORS credentials weren't configured. This would also have broken the real SPA login. Fixed with config (`SANCTUM_STATEFUL_DOMAINS`, CORS restricted to `FRONTEND_URL` with credentials).
5. **Live API used SQLite even though the tests passed.** `artisan serve` strips process env vars from its worker by default. Caught by curling the running API, not by tests. Fixed with `--no-reload` and by regenerating `backend/.env`.
6. **Port clash.** A local Python server and a WSL relay were holding `:8000`. Host ports are now configurable (`API_PORT`, `WEB_PORT`).

**Tests:** 48 pass, 1 intentionally failing (`TopRatedAdminTest` cap rule, waiting on a `TODO(human)` contribution).
