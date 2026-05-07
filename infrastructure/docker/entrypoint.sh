#!/bin/sh

# Multi-cloud entrypoint script
set -e

echo "🚀 Starting FlowOps Multi-Cloud Deployment"
echo "Environment: ${ENVIRONMENT:-development}"
echo "Cloud Provider: ${CLOUD_PROVIDER:-local}"
echo "Node Version: $(node --version)"

# Wait for database
if [ -n "$DB_HOST" ]; then
    echo "⏳ Waiting for database..."
    while ! nc -z "$DB_HOST" "${DB_PORT:-5432}"; do
        sleep 1
    done
    echo "✅ Database is ready"
fi

# Wait for Redis
if [ -n "$REDIS_HOST" ]; then
    echo "⏳ Waiting for Redis..."
    while ! nc -z "$REDIS_HOST" "${REDIS_PORT:-6379}"; do
        sleep 1
    done
    echo "✅ Redis is ready"
fi

# Run database migrations
if [ "$ENVIRONMENT" = "production" ]; then
    echo "🔄 Running database migrations..."
    cd backend && npm run db:migrate
fi

# Start backend server
echo "🔧 Starting backend server..."
cd backend && npm start &

# Start frontend server (development only)
if [ "$ENVIRONMENT" = "development" ]; then
    echo "🎨 Starting frontend development server..."
    cd ../frontend && npm start &
fi

# Wait for services to be ready
sleep 10

# Health check
echo "🏥 Performing health check..."
if curl -f http://localhost:5000/health; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    exit 1
fi

# Keep the container running
wait
