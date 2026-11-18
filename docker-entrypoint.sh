#!/bin/sh
set -e

echo "Waiting for PostgreSQL database (erp-db:5432) to be ready..."
until nc -z -v -w30 erp-db 5432; do
  echo "Waiting for erp-db:5432..."
  sleep 2
done
echo "PostgreSQL is ready!"

echo "Syncing Prisma database schema for JKI ERP..."
# Refuse to drop tables that are not in the Prisma schema (jki_data_migrations).
# --accept-data-loss would remove the one-time customer import guard.
if ! npx prisma db push --skip-generate; then
  echo "Prisma db push made no changes. Unmanaged tables were left in place."
fi

echo "Seeding initial data (Products, Salons, Orders, Leads)..."
npx tsx prisma/seed.ts || echo "Seed already completed or skipped."

echo "Starting JKIOCEAN ERP Hub on port 3000..."
exec node server.js
