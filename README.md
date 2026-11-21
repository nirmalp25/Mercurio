# Mercurio — Product Catalogue PoC

Customers browse and search a catalogue, view product details and send an enquiry. Admins choose the "top rated" products and read enquiries.

## Stack and why

| Layer | Choice | Why |
|---|---|---|
| Client | React 18 + TypeScript (Vite) | Typed, component-driven. Paired with a config-driven UI registry so the coming redesign doesn't mean a rewrite. |
| Backend | PHP / Laravel 13 (modular monolith) | Mature validation, auth (Sanctum), mail drivers and queues out of the box. Modules keep clean boundaries without the cost of microservices. |
| DB | PostgreSQL 16 | Production-like (AWS RDS compatible). Tests use a separate `mercuriodb_test`. |
| Mail | Pluggable notifier (`null` / `mail`), with Mailpit locally | No paid accounts. Switching to SES or Postmark is an `.env` change. |
| Tests | Pest (backend), Jest + RTL (frontend), Playwright (E2E) | |

## Run it (about 5 minutes; needs only Docker)

```powershell
cp .env.example .env
docker compose up --build
```

- App: http://localhost:5173
- API: http://localhost:8000
- Mailpit (local sales inbox): http://localhost:8025
- Admin: `admin@mercurio.test` / `password` (demo values from `.env.example`). Log in at `/admin/login`.

On boot, the backend migrates, seeds the admin, and syncs products from the Fake Store API. If that API is unreachable, it falls back to a bundled snapshot.

**Port already in use?** Set `API_PORT` and `APP_URL` (or `WEB_PORT`, `FRONTEND_URL` and `SANCTUM_STATEFUL_DOMAINS`) in `.env`.

**Email the sales inbox:** set `ENQUIRY_NOTIFIER=mail` in `.env`, then run `docker compose up -d backend`. Enquiries are always stored and shown on the admin Queries page, whichever notifier is set.

## Tests

```powershell
docker compose exec -T backend php artisan test
```
```powershell
cd frontend; npm install; npm test
```
```powershell
cd e2e; npm install; npx playwright install chromium; npx playwright test
```

## Layout

```
backend/app/Modules/{Catalogue,Identity,Enquiry,Notifier}   one module = config + migrations + routes + bindings
frontend/src/{app,shared,modules}                           shared = api, config-driven UI registry, theme tokens
e2e/                                                        Playwright specs, one per acceptance criterion
docs/PLAN.md, docs/PROCESS_LOG.md                           plan and build log
```

See [DECISIONS.md](DECISIONS.md) and [AI_USAGE.md](AI_USAGE.md).
