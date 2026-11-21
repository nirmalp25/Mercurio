#!/bin/sh
# Creates the isolated test database alongside the main one (runs once, on first volume init).
set -e
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE DATABASE "${DB_TEST_DATABASE:-mercuriodb_test}" OWNER "$POSTGRES_USER";
EOSQL
for db in "$POSTGRES_DB" "${DB_TEST_DATABASE:-mercuriodb_test}"; do
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$db" -c 'CREATE EXTENSION IF NOT EXISTS pg_trgm;'
done
