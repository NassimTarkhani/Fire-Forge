#!/bin/bash

# FireForge API - VPS Direct Deployment Script
# Run this on your VPS after cloning the repository

set -e

echo "=============================================="
echo "  FireForge API - VPS Deployment"
echo "=============================================="
echo ""

# Check if running in project directory
if [ ! -f "Dockerfile" ]; then
    echo "❌ Error: Dockerfile not found. Please run this script from the project root."
    exit 1
fi

# Step 1: Check if .env exists
if [ ! -f ".env" ]; then
    echo "📋 Creating .env file from template..."
    if [ -f ".env.production" ]; then
        cp .env.production .env
    else
        echo "❌ Error: .env.production template not found!"
        exit 1
    fi
    
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env file with your actual values!"
    echo "   Run: nano .env"
    echo ""
    echo "Required values:"
    echo "  - SUPABASE_URL"
    echo "  - SUPABASE_KEY"
    echo "  - FIRECRAWL_BASE_URL"
    echo "  - ADMIN_MASTER_KEY (generate with: openssl rand -hex 32)"
    echo "  - POLAR_ACCESS_TOKEN"
    echo "  - POLAR_WEBHOOK_SECRET"
    echo "  - POLAR_ORGANIZATION_ID"
    echo ""
    read -p "Press Enter after you've updated .env file..."
fi

# Step 2: Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo "🐋 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    echo "✅ Docker installed!"
fi

# Step 3: Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null; then
    echo "🔧 Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed!"
fi

# Step 4: Stop existing container if running
echo ""
echo "🛑 Stopping existing containers (if any)..."
docker-compose down 2>/dev/null || true

# Step 5: Build the image
echo ""
echo "🏗️  Building Docker image..."
docker-compose build

# Step 6: Start the service
echo ""
echo "🚀 Starting FireForge API..."
docker-compose up -d

# Step 7: Wait for service to be ready
echo ""
echo "⏳ Waiting for service to start..."
sleep 10

# Step 8: Health check
echo ""
echo "🔍 Running health check..."
MAX_RETRIES=10
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f -s http://localhost:8000/health > /dev/null 2>&1; then
        echo "✅ Service is healthy and running!"
        break
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
        echo "   Waiting... ($RETRY_COUNT/$MAX_RETRIES)"
        sleep 3
    else
        echo "❌ Health check failed. Showing logs:"
        docker-compose logs --tail=50
        exit 1
    fi
done

# Step 9: Show status
echo ""
echo "=============================================="
echo "  ✅ Deployment Successful!"
echo "=============================================="
echo ""
echo "🌐 Service is running at:"
echo "   - Local: http://localhost:8000"
echo "   - VPS: http://$(curl -s ifconfig.me):8000"
echo ""
echo "📊 Health endpoint: http://localhost:8000/health"
echo ""
echo "Useful commands:"
echo "  📋 View logs:        docker-compose logs -f"
echo "  🔄 Restart:          docker-compose restart"
echo "  🛑 Stop:             docker-compose down"
echo "  🔍 Check status:     docker-compose ps"
echo "  🏗️  Rebuild:          docker-compose up -d --build"
echo ""

# Step 10: Configure firewall (optional)
read -p "Do you want to open port 8000 in the firewall? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v ufw &> /dev/null; then
        echo "🔓 Opening port 8000..."
        ufw allow 8000/tcp
        ufw reload
        echo "✅ Port 8000 is now open!"
    else
        echo "⚠️  UFW not found. Please open port 8000 manually."
    fi
fi

echo ""
echo "🎉 FireForge API is ready!"
echo ""
echo "⚠️  IMPORTANT: Update Polar webhook URL to:"
echo "   http://$(curl -s ifconfig.me):8000/polar/webhook"
echo ""
