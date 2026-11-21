#!/bin/sh
# Boots the API: install deps, ensure app key, migrate, seed, sync catalogue.
set -e

composer install --no-interaction --prefer-dist

[ -f .env ] || cp .env.example .env
grep -q '^APP_KEY=base64' .env || php artisan key:generate --force

php artisan migrate --force
php artisan db:seed --force
# Sync must not block startup if the upstream is down: fall back to the bundled fixture.
php artisan catalogue:sync || php artisan catalogue:sync --source=fixture

exec "$@"
