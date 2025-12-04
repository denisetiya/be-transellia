#!/bin/sh

echo "Starting application with database migrations..."

# Wait for database to be ready (if needed)
echo "Checking database connection..."
until pnpm db:push --skip-generate > /dev/null 2>&1; do
  echo "Waiting for database to be ready..."
  sleep 2
done

echo "Database is ready, running migrations..."

# Run database migrations
if pnpm db:migrate; then
  echo "✅ Migrations completed successfully!"
else
  echo "❌ Migration failed, but continuing with application startup..."
fi

echo "Starting the application..."
exec node dist/index.js