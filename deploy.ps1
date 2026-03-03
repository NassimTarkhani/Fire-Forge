# FireForge API - Quick Deploy Script (PowerShell)
# Usage: .\deploy.ps1 [environment]
# Example: .\deploy.ps1 production

param(
    [string]$Environment = "production"
)

$ErrorActionPreference = "Stop"

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  FireForge API Deployment" -ForegroundColor Cyan
Write-Host "  Environment: $Environment" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
try {
    docker --version | Out-Null
} catch {
    Write-Host "❌ Docker is not installed. Please install Docker first." -ForegroundColor Red
    exit 1
}

# Check if Docker Compose is installed
try {
    docker-compose --version | Out-Null
} catch {
    Write-Host "❌ Docker Compose is not installed. Please install Docker Compose first." -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (-not (Test-Path .env)) {
    Write-Host "⚠️  .env file not found!" -ForegroundColor Yellow
    
    if (Test-Path ".env.$Environment") {
        Write-Host "📋 Copying .env.$Environment to .env" -ForegroundColor Cyan
        Copy-Item ".env.$Environment" .env
    } else {
        Write-Host "❌ No environment file found. Please create .env file." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🔍 Checking environment configuration..." -ForegroundColor Cyan

# Check required environment variables
$requiredVars = @(
    "SUPABASE_URL",
    "SUPABASE_KEY",
    "FIRECRAWL_BASE_URL",
    "ADMIN_MASTER_KEY"
)

$missingVars = @()
$envContent = Get-Content .env

foreach ($var in $requiredVars) {
    $found = $false
    foreach ($line in $envContent) {
        if ($line -match "^$var=(.+)$" -and -not ($line -match "your-")) {
            $found = $true
            break
        }
    }
    if (-not $found) {
        $missingVars += $var
    }
}

if ($missingVars.Count -gt 0) {
    Write-Host "❌ Missing or unconfigured environment variables:" -ForegroundColor Red
    foreach ($var in $missingVars) {
        Write-Host "   - $var" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Please update .env file with actual values." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Environment configuration looks good!" -ForegroundColor Green
Write-Host ""

# Build and deploy
Write-Host "🏗️  Building Docker image..." -ForegroundColor Cyan
docker-compose build

Write-Host ""
Write-Host "🚀 Starting services..." -ForegroundColor Cyan
docker-compose up -d

Write-Host ""
Write-Host "⏳ Waiting for services to be healthy..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Health check
$maxRetries = 10
$retryCount = 0

while ($retryCount -lt $maxRetries) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Service is healthy!" -ForegroundColor Green
            break
        }
    } catch {
        # Continue trying
    }
    
    $retryCount++
    if ($retryCount -lt $maxRetries) {
        Write-Host "   Retry $retryCount/$maxRetries..." -ForegroundColor Yellow
        Start-Sleep -Seconds 3
    } else {
        Write-Host "❌ Service health check failed after $maxRetries attempts" -ForegroundColor Red
        Write-Host ""
        Write-Host "📋 Container logs:" -ForegroundColor Cyan
        docker-compose logs --tail=50 fireforge-api
        exit 1
    }
}

Write-Host ""
Write-Host "==============================================" -ForegroundColor Green
Write-Host "  ✅ Deployment Successful!" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Service URL: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Health Check: http://localhost:8000/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 View logs: docker-compose logs -f" -ForegroundColor Yellow
Write-Host "🛑 Stop service: docker-compose down" -ForegroundColor Yellow
Write-Host "🔄 Restart: docker-compose restart" -ForegroundColor Yellow
Write-Host ""
Write-Host "🎉 FireForge API is now running!" -ForegroundColor Green
