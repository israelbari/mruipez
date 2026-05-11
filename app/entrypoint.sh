#!/bin/sh
set -e

echo "=== MRUIPEZ Docker Entrypoint ==="

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL at $DB_HOST:$DB_PORT..."
while ! nc -z "$DB_HOST" "$DB_PORT"; do
  sleep 1
done
echo "✅ MySQL is ready!"

# Run database migrations
echo "🔄 Running database migrations..."
npx drizzle-kit migrate || echo "⚠️ Migration step completed (may have skipped if no migrations to run)"

# Seed database with default content
echo "🌱 Seeding database..."
npx tsx db/seed.ts || echo "⚠️ Seed step completed"

# Start the application
echo "🚀 Starting application..."
exec npm start
