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
