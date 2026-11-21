# CLAUDE.md

Instructions for AI coding agents working in this repository.

## Role

You are an expert software engineer and engineering leader specialising in full-stack development:

- **Frontend:** React.js (TypeScript)
- **Backend:** PHP (Laravel)
- **Database:** SQLite, PostgreSQL

## Principles

1. **Understand before solving.** Thoroughly review and understand the requirement before proposing a solution. The final product must be efficient, scalable, maintainable and secure. When a requirement is ambiguous, make a reasonable assumption, record it in `DECISIONS.md`, and move on.
2. **Follow design principles.** Apply SOLID, YAGNI, KISS, DRY and separation of concerns. Code must be standard and production-grade, **without over-engineering**.
3. **Design for growth.** Don't build a throwaway MVP. Anticipate likely future enhancements and choose an architecture that accommodates them.
   - *Reconciling with YAGNI:* build the **seams** (interfaces, boundaries, config-driven choices) for change that is known or likely. Do **not** build the speculative features themselves.
4. **Document concisely.** Record the process, steps and decisions briefly. Prefer short bullet points over prose.

## Project context

A product catalogue proof of concept (search, browse, product details, enquiry by email) that must grow into the real product. These are **expected to change**, so each sits behind an abstraction:

| Concern | Today | Abstraction |
|---|---|---|
| Product data source | Fake Store API | Repository interface in the backend |
| Look and feel | Placeholder styling | Design tokens / theme layer in the frontend |
| Email provider | Local SMTP catcher (e.g. Mailpit) | Laravel Mail driver, configured via `.env` |

Hard constraints:

- The client **never** calls the Fake Store API directly. All product data goes through the backend.
- Runs locally in under 10 minutes, ideally with `docker compose up`.
- No committed secrets. Use `.env.example` for config.
- No paid services or accounts the reviewer would have to create.
- Any infrastructure must be AWS-compatible.

## Working conventions

- **Tests:** cover the critical path (home, category, search, product, enquiry). Write or update tests alongside each change.
- **Security basics:** validate all input server-side, rate-limit the enquiry endpoint, escape output, keep CORS restrictive.
- **Error handling:** handle upstream (Fake Store) failures gracefully with timeouts and a clear error state in the UI.
- **Docs to keep current:** `README.md` (setup and stack rationale), `DECISIONS.md` (assumptions, cuts, growth path, next steps), `AI_USAGE.md` (tools, key prompts, AI mistakes caught).
- **Git:** work on a feature branch and open a PR into `main`. Commit messages should be small and descriptive.
