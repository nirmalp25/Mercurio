# Decisions & Assumptions

## Assumptions (where the acceptance criteria left gaps)

- **"I have chosen 5 top rated products":**
  - An admin picks them on `/admin/products`. Fake Store's `rating` field is not used to decide.
  - The cap is set by config (`MAX_TOP_RATED=5`). The server enforces it and rejects a 6th product with a 422.
  - On the very first sync, the 5 best-rated products are featured so the home page is never empty. Later syncs never touch admin choices.
- **Category page:**
  - Implemented as a category card grid that opens a near-fullscreen modal, instead of a separate route.
  - The modal's first section shows the category's top-rated products (4 at first, then "Show more").
  - The second section lists every product in the category, with a ★ on top-rated ones.
- **Search:**
  - Case-insensitive substring match on title, description and category, with title matches ranked first.
  - Autocomplete is debounced (300 ms, at least 2 characters) and matches titles only.
  - Results appear only when the user clicks Search or presses Enter, as the criterion says.
- **Enquiry:**
  - Fields: first and last name, email, country code + phone, query (max 1000 characters).
  - The phone number is validated for the chosen country and stored in E.164 format.
  - Spam control: a honeypot field and a limit of 5 submissions per minute per IP.
- **"Sales inbox receives an email":**
  - The email provider is a factory, and the default is `null`. Every enquiry is saved first, and the admin **Queries** page acts as the inbox.
  - With `ENQUIRY_NOTIFIER=mail`, an email is also sent to `SALES_INBOX`. Locally it lands in Mailpit.
- **Customers stay anonymous.** Only admins log in, using Sanctum SPA cookie auth with a role column.

## Dropped or simplified

- **Production server:** `php artisan serve` instead of php-fpm + nginx. It's simpler to run locally; production would use fpm or Octane behind a load balancer.
- **Notifications run synchronously.** A notifier failure is logged and never loses the enquiry. A queued listener with retries is the next step.
- **No pagination on the catalogue,** since there are only 20 products. Admin enquiries are paginated.
- **No customer accounts, cart or i18n.** They're out of scope for the MVP.

## How the design grows beyond the PoC

- **Data source:**
  - `ProductSource` (where products come from) is separate from `ProductRepository` (how the app reads them).
  - A new source (PIM, Shopify, CSV) is one adapter class plus `CATALOGUE_SOURCE=…`. The frontend and the API contract don't change.
  - Reads come from our own database, so the catalogue is fast, searchable and keeps working when the upstream is down.
- **Email or notifications:** add a driver class to `Notifier/config.php` (SMS, Slack, CRM). SES or Postmark is just Laravel mailer config.
- **Look and feel:**
  - Forms and layouts are JSON configs rendered through a component registry. Validation is generated from the same config.
  - A redesign means re-registering components and swapping the design tokens in `tokens.css`. The pages and configs stay the same.
- **Modules:** each module owns its config, migrations, routes and bindings, and talks to other modules only through contracts or events. Any of them could be extracted into a service later.
- **Infrastructure:** everything is containerised with no AWS-incompatible pieces (Postgres maps to RDS, SMTP to SES).

## Next, with another day

1. Queue the notifier with retries, and run a scheduled `catalogue:sync`.
2. Finish triaging the Playwright suite and add it to CI (GitHub Actions running compose).
3. Admin UX: search and filter in the top-rated manager; enquiry detail view and a reply action.
4. Production Docker images (multi-stage, php-fpm + nginx, a static frontend build) and IaC for ECS + RDS.
5. Observability: structured logs and health checks for upstream sync failures.
