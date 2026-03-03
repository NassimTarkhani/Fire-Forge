#!/bin/bash

# FireForge API - Quick Deploy Script
# Usage: ./deploy.sh [environment]
# Example: ./deploy.sh production

set -e

ENV=${1:-production}

echo "=============================================="
echo "  FireForge API Deployment"
echo "  Environment: $ENV"
echo "=============================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    
    if [ -f .env.$ENV ]; then
        echo "📋 Copying .env.$ENV to .env"
        cp .env.$ENV .env
    else
        echo "❌ No environment file found. Please create .env file."
        exit 1
    fi
fi

echo ""
echo "🔍 Checking environment configuration..."

# Check required environment variables
REQUIRED_VARS=(
    "SUPABASE_URL"
    "SUPABASE_KEY"
    "FIRECRAWL_BASE_URL"
    "ADMIN_MASTER_KEY"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^${var}=" .env || grep -q "^${var}=your-" .env; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo "❌ Missing or unconfigured environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Please update .env file with actual values."
    exit 1
fi

echo "✅ Environment configuration looks good!"
echo ""

# Build and deploy
echo "🏗️  Building Docker image..."
docker-compose build

echo ""
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 5

# Health check
MAX_RETRIES=10
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f -s http://localhost:8000/health > /dev/null 2>&1; then
        echo "✅ Service is healthy!"
        break
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
        echo "   Retry $RETRY_COUNT/$MAX_RETRIES..."
        sleep 3
    else
        echo "❌ Service health check failed after $MAX_RETRIES attempts"
        echo ""
        echo "📋 Container logs:"
        docker-compose logs --tail=50 fireforge-api
        exit 1
    fi
done

echo ""
echo "=============================================="
echo "  ✅ Deployment Successful!"
echo "=============================================="
echo ""
echo "Service URL: http://localhost:8000"
echo "Health Check: http://localhost:8000/health"
echo ""
echo "📋 View logs: docker-compose logs -f"
echo "🛑 Stop service: docker-compose down"
echo "🔄 Restart: docker-compose restart"
echo ""
echo "🎉 FireForge API is now running!"
