#!/bin/sh

# Multi-cloud health check script
set -e

echo "🏥 FlowOps Health Check"

# Check backend health
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ Backend: Healthy"
    BACKEND_STATUS=0
else
    echo "❌ Backend: Unhealthy"
    BACKEND_STATUS=1
fi

# Check frontend (if running)
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend: Healthy"
    FRONTEND_STATUS=0
else
    echo "⚠️ Frontend: Not running (production mode)"
    FRONTEND_STATUS=0
fi

# Check database connection
if [ -n "$DB_HOST" ]; then
    if nc -z "$DB_HOST" "${DB_PORT:-5432}" > /dev/null 2>&1; then
        echo "✅ Database: Connected"
        DB_STATUS=0
    else
        echo "❌ Database: Disconnected"
        DB_STATUS=1
    fi
else
    echo "⚠️ Database: Not configured"
    DB_STATUS=0
fi

# Check Redis connection
if [ -n "$REDIS_HOST" ]; then
    if nc -z "$REDIS_HOST" "${REDIS_PORT:-6379}" > /dev/null 2>&1; then
        echo "✅ Redis: Connected"
        REDIS_STATUS=0
    else
        echo "❌ Redis: Disconnected"
        REDIS_STATUS=1
    fi
else
    echo "⚠️ Redis: Not configured"
    REDIS_STATUS=0
fi

# Overall health status
TOTAL_STATUS=$((BACKEND_STATUS + FRONTEND_STATUS + DB_STATUS + REDIS_STATUS))

if [ $TOTAL_STATUS -eq 0 ]; then
    echo "🎉 All systems healthy"
    exit 0
else
    echo "⚠️ Some systems unhealthy (Status: $TOTAL_STATUS)"
    exit 1
fi
