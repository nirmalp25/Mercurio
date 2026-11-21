# Plan — Mercurio Product Catalogue (Take-home: AI-Native Engineer)

## Context
Take-home challenge (see `C:\Users\Asus\Downloads\Code Challenge - AI-Native Engineer 1.pdf`): build a product catalogue PoC that is **a foundation, not a throwaway**. Data source, look & feel, and email provider are all expected to change. Graded on solution design, decisions/assumptions, implementation quality, tests, and AI engineering practice. Repo currently holds only `CLAUDE.md`.

**User-locked decisions:** React + TypeScript frontend · Laravel backend · PostgreSQL only (dev *and* tests, no SQLite) · Jest (frontend unit) · Pest (backend) · Playwright (E2E) · modular monolith · JSON-config-driven UI · Sanctum auth with seeded admin · notifier factory defaulting to `null`, with Mailpit ready in compose.

## Architecture overview
```
React SPA (Vite, TS) ──HTTP/JSON──> Laravel API ──> PostgreSQL (mercuriodb)
   config-driven UI                   modules:          products, enquiries, users
   module folders                     Catalogue           ▲
                                      Enquiry             │ catalogue:sync (artisan)
                                      Identity      ProductSource (FakeStore adapter)
                                      Notifier factory ──> null | mail(Mailpit/SMTP)
```
- The frontend only knows our API. Fake Store is reached **only** by the sync command, through a `ProductSource` interface. Swapping the source means writing one new adapter.
- Read path is DB-backed, so it is fast, searchable, and keeps working if Fake Store is down. Bundle a fixture snapshot as a fallback source so the reviewer setup can't break.

## Repo layout
```
/backend   Laravel 11 (app/Modules/*)
/frontend  Vite + React + TS
/e2e       Playwright
docker-compose.yml  (db, backend, frontend, mailpit)
README.md  DECISIONS.md  AI_USAGE.md  CLAUDE.md  docs/PROCESS_LOG.md
```

## Backend (modular monolith) — `backend/app/Modules/<Module>/`
Each module has `Contracts/ Models/ Services/ Http/{Controllers,Requests,Resources}/ Database/{migrations,seeders,factories}/ routes.php Providers/<Module>ServiceProvider.php Tests/`. Modules talk to each other only through contracts and events, never through each other's models.

**Catalogue**
- Migration `products`: `id` (source id), `title`, `price` decimal(10,2), `description` text, `category` (indexed), `image`, `rating_rate` decimal(3,1), `rating_count` int, `is_top_rated` bool (indexed), `action_ts` timestamp (last admin action or sync), timestamps. Add pg trigram (`pg_trgm`) GIN index on title for ILIKE search.
- `Contracts/ProductSource` → `Sources/FakeStoreProductSource` (Http client, timeout and retry) + `Sources/FixtureProductSource` (`database/fixtures/products.json`). Bound via `config/catalogue.php` (`CATALOGUE_SOURCE=fakestore`).
- `Contracts/ProductRepository` → `EloquentProductRepository` (search, suggest, byCategory, topRated, find).
- `Console/SyncProductsCommand` (`catalogue:sync`): upserts by source id and **never overwrites `is_top_rated`**. Runs on container start.
- `Services/TopRatedService`: toggles top-rated and enforces `config('catalogue.max_top_rated')` (env `MAX_TOP_RATED=5`). Rejects with 422 when the cap is exceeded. Seeder marks 5 products by default.
- Endpoints (public):
  - `GET /api/products/top-rated` (home)
  - `GET /api/categories` → `[{slug,name,productCount,image}]`
  - `GET /api/categories/{slug}/products` → `{topRated:[], products:[]}` (`products` includes top-rated items, each flagged `isTopRated`)
  - `GET /api/products/search?q=` (min 1 char, ILIKE over title, description, category)
  - `GET /api/products/suggest?q=&limit=8` (min 2 chars, title only, lightweight resource)
  - `GET /api/products/{id}`
- Admin: `GET /api/admin/products`, `PATCH /api/admin/products/{id}/top-rated {isTopRated}`

**Enquiry**
- Migration `enquiries`: `id`, `product_id` FK→products, `product_title` snapshot, `first_name`, `last_name`, `email`, `country_code`, `phone`, `query` text, `status` (new/read), `enquired_at`, timestamps.
- `Http/Requests/StoreEnquiryRequest`: required fields, email:rfc, phone validated with `propaganistas/laravel-phone` against the country, `query` max 1000. Throttle `5/min` per IP. Honeypot field.
- `Services/EnquiryService::submit()`: persists the enquiry, then dispatches an `EnquirySubmitted` event. A listener calls the notifier, so a notification failure never loses the enquiry (the event is queued; `QUEUE_CONNECTION=sync` in the PoC).
- Admin: `GET /api/admin/enquiries` (paginated), `PATCH /api/admin/enquiries/{id}` (mark read).

**Notifier (factory)** — `app/Modules/Notifier/`
- `Contracts/EnquiryNotifier { notify(EnquiryData) }`
- `NotifierFactory::make(string $driver)` → `NullNotifier` (no-op; the admin Queries page is the inbox) | `MailNotifier` (Laravel Mailable to `SALES_INBOX`, using the configured Laravel mailer, so Mailpit, SES or Postmark is just `.env`). Unknown driver throws. Register new drivers in a map in `config/notifier.php`.
- `.env`: `ENQUIRY_NOTIFIER=null`, `SALES_INBOX=sales@mercurio.test`, `MAIL_HOST=mailpit`.

**Identity**
- `users` + `role` enum (`admin`, `customer`). Seeder creates an admin from `ADMIN_EMAIL`/`ADMIN_PASSWORD` (`.env.example` values only).
- Sanctum SPA cookie auth: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`. `EnsureAdmin` middleware on `/api/admin/*`.
- CORS limited to the frontend origin.

**Cross-cutting:** API Resources for camelCase JSON, a consistent error envelope `{message, errors?}`, a global handler that maps upstream and HTTP failures to 503 or 502.

## Frontend — `frontend/src/`
```
app/          router, providers (QueryClient, Auth, Theme), layout
shared/
  api/        httpClient (axios, baseURL from env, withCredentials), typed endpoints
  ui/registry/  componentRegistry: { text, email, phone, textarea, select, search, productCard, categoryCard, ... }
  ui/renderer/  <FormRenderer schema/>, <ElementRenderer config/>
  config/     JSON configs (forms/enquiry.json, ui/search.json, ui/home.json, countries.json)
  theme/      design tokens (CSS variables) — swapped when creative lands
  hooks/      useDebounce
modules/
  catalogue/  HomePage (top-rated grid), CategoryGrid, CategoryModal, ProductDetailPage
  search/     SearchBar (debounced autocomplete + Search button), SearchResultsPage
  enquiry/    EnquiryModal (FormRenderer + enquiry.json), sweetalert2 thank-you
  admin/      LoginPage, TopRatedManager, QueriesPage, RequireAdmin guard
```
- **Config-driven contract** (`shared/config/schema.ts`): each element is `{ type, name, label, dataType, required?, validation?: {maxLength?, minLength?, pattern?}, props?: {...} }`. The renderer looks up `type` in the registry, so restyling or replacing a component never touches the configs or pages. Validation uses zod schemas generated from the config, run with react-hook-form.
- Data fetching: TanStack Query, with caching and loading and error states.
- Search: 300 ms debounce on suggestions, request cancellation via AbortController, keyboard navigation in the suggestion list. Results load only on Search click or Enter, routed to `/search?q=`, to match the acceptance criterion.
- Category modal: near-fullscreen and accessible (focus trap, Esc to close). Section 1 shows top-rated products, first 4, then a "Show more" toggle. Section 2 shows all products, with a ★ badge on top-rated ones.
- Routes: `/`, `/search`, `/products/:id`, `/admin/login`, `/admin/products`, `/admin/queries`.

## Testing
- **Pest (Postgres test DB `mercuriodb_test` in compose)**:
  - sync is idempotent and keeps `is_top_rated`
  - FakeStore adapter (`Http::fake`) plus fallback
  - top-rated cap
  - search and suggest matching
  - category endpoint shape
  - enquiry validation, persistence and throttling
  - notifier factory (null vs mail with `Mail::fake`; unknown driver throws)
  - admin guard returns 401/403
- **Jest + RTL** (`ts-jest`, jsdom):
  - FormRenderer renders from config and enforces `maxLength`/`required`
  - registry fallback for an unknown type
  - useDebounce (fake timers)
  - SearchBar debounces and shows suggestions
  - CategoryModal sections, show-more and star badge
  - EnquiryModal submit leads to the thank-you message
- **Playwright** (`/e2e`, against the compose stack): one spec per acceptance criterion:
  - home shows 5 featured products
  - category modal
  - search filters results
  - product tile opens the details page
  - enquiry leads to thank-you, and the enquiry appears in the admin Queries page; with `ENQUIRY_NOTIFIER=mail`, check the Mailpit API

## Run
`cp .env.example .env && docker compose up --build`. Compose runs the frontend on :5173, the API on :8000, Postgres and Mailpit (:8025). The backend entrypoint runs migrate, seed, then `catalogue:sync`. Test commands go in the README.

## Documentation (maintained throughout, per assessment)
- `docs/PROCESS_LOG.md`: a running, dated log of each phase. It records your prompts and directions, what the AI proposed, what was changed or rejected, and why. This is the raw material for `AI_USAGE.md`.
- `DECISIONS.md`: assumptions, simplifications, growth path, next-day list. Includes these assumptions:
  - top-rated chosen by admin, capped at 5 by config
  - null notifier leaves the admin Queries page as the inbox
  - category modal replaces category links
  - search fields covered
  - DB-cached catalogue
- `AI_USAGE.md`: tools and models (Claude Code, Opus 5.5), `CLAUDE.md`, this plan, 3–5 key prompts, AI mistakes caught.
- `README.md`: stack and why, setup, env vars, tests, admin credentials (from `.env.example`).
- Time spent: you supply the actual figures; I keep phase timestamps in `PROCESS_LOG.md` to help.

## Implementation phases (each ends with tests green + a commit on `feature/product-catalogue`)
1. Git init: commit `CLAUDE.md` to `main`, create the branch, add docs skeletons and docker-compose (db, mailpit).
2. Backend scaffold: Laravel, module service-provider loader, Sanctum, Pest on Postgres.
3. Catalogue module: migration, ProductSource adapters, sync command, endpoints, tests.
4. Enquiry, Notifier and Identity modules: tests.
5. Frontend scaffold: registry, renderer, configs, theme, API client, Jest.
6. Frontend modules: home, category modal, search, product page, enquiry, admin. Then tests.
7. Playwright E2E, README, DECISIONS, AI_USAGE, open the PR (description written for the assessors).

Learning mode: during implementation I'll hand you small `TODO(human)` pieces at real decision points, for example the top-rated cap rule in `TopRatedService` and the search-matching query.

## Verification
- `docker compose up --build`, then open :5173. Walk through every acceptance criterion manually, including logging in as admin and toggling top-rated (the 6th toggle should be rejected) and seeing an enquiry in Queries.
- Set `ENQUIRY_NOTIFIER=mail`, restart the backend, submit an enquiry, and see the email in Mailpit at :8025.
- `docker compose exec backend php artisan test` (Pest) · `cd frontend && npm test` (Jest) · `cd e2e && npx playwright test`.
- Confirm in the browser network tab that no request goes to fakestoreapi.com.
