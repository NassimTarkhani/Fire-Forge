# Deployment Files Quick Reference

## Files Created

### Docker Configuration
- **Dockerfile** - Multi-stage production Docker image
- **.dockerignore** - Excludes unnecessary files from build
- **docker-compose.yml** - Orchestrates services with health checks
- **.env.production** - Production environment template

### Deployment Scripts
- **deploy.sh** - Bash deployment script (Linux/Mac)
- **deploy.ps1** - PowerShell deployment script (Windows)
- **DEPLOYMENT.md** - Complete deployment guide

### CI/CD
- **.github/workflows/docker-build.yml** - GitHub Actions workflow

---

## Quick Start Commands

### Windows (PowerShell)
```powershell
# Configure environment
cp .env.production .env
# Edit .env with your values

# Deploy
.\deploy.ps1
```

### Linux/Mac (Bash)
```bash
# Configure environment
cp .env.production .env
# Edit .env with your values

# Make script executable
chmod +x deploy.sh

# Deploy
./deploy.sh
```

### Manual Docker Compose
```bash
# Build and start
docker-compose build
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## Deployment Options

### 1. **Local Testing** ✅ Easiest
- Run `deploy.ps1` or `deploy.sh`
- Access at http://localhost:8000

### 2. **VPS (Your Coolify Server)** ⭐ Recommended
- Upload files to VPS
- Run `./deploy.sh production`
- Configure domain/SSL via Coolify or Traefik

### 3. **Cloud Platforms**
- AWS ECS
- Google Cloud Run
- Azure Container Instances
- Heroku
- Digital Ocean App Platform

See **DEPLOYMENT.md** for detailed instructions.

---

## Environment Variables Required

**Critical:**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Supabase anon/service key
- `FIRECRAWL_BASE_URL` - Firecrawl instance URL
- `ADMIN_MASTER_KEY` - Secure admin key

**Payment (Polar):**
- `POLAR_ACCESS_TOKEN` - Polar API token
- `POLAR_WEBHOOK_SECRET` - Webhook secret
- `POLAR_ORGANIZATION_ID` - Your org ID

**Optional:**
- `RATE_LIMIT_ENABLED` - Enable/disable rate limiting (default: true)
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window (default: 100)
- `RATE_LIMIT_WINDOW` - Time window in seconds (default: 60)
- `FIRECRAWL_TIMEOUT` - Request timeout (default: 300)

---

## Docker Image Details

**Base Image:** python:3.11-slim
**Multi-stage Build:** Yes (optimized size)
**User:** Non-root (appuser, UID 1000)
**Port:** 8000
**Workers:** 4 (configurable in Dockerfile)
**Health Check:** Every 30s via /health endpoint

**Image Size:** ~150-200MB (optimized)

---

## Post-Deployment Checklist

- [ ] Container running: `docker ps | grep fireforge`
- [ ] Health check passing: `curl http://localhost:8000/health`
- [ ] Logs clean: `docker-compose logs --tail=50`
- [ ] Environment variables set correctly
- [ ] Polar webhook configured
- [ ] SSL/HTTPS enabled (production)
- [ ] Firewall configured
- [ ] Test payment flow
- [ ] Monitor for 24 hours

---

## Troubleshooting

### Container won't start
```bash
docker-compose logs fireforge-api
docker-compose down
docker-compose up -d --build
```

### Port already in use
```bash
# Change port in docker-compose.yml
ports:
  - "8001:8000"  # Changed from 8000:8000
```

### Environment issues
```bash
# Check configuration
docker-compose config

# Verify .env file
cat .env | grep -v "^#"
```

---

## Monitoring

### View Logs
```bash
# All logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Specific time
docker-compose logs --since 10m
```

### Check Health
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy"}
```

### Container Status
```bash
docker ps
docker-compose ps
docker inspect fireforge-api
```

---

## Updating

### Pull Latest Changes
```bash
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Rollback
```bash
# Use specific image tag or commit
docker-compose down
git checkout previous-commit
docker-compose up -d --build
```

---

## Security Notes

1. **Never commit .env files** - Already in .gitignore
2. **Use strong ADMIN_MASTER_KEY** - Generate with `openssl rand -hex 32`
3. **Enable HTTPS in production** - Use reverse proxy or cloud SSL
4. **Keep Docker updated** - `docker-compose pull`
5. **Monitor logs regularly** - Watch for suspicious activity
6. **Rotate API keys** - Update POLAR_ACCESS_TOKEN periodically

---

## Support

- 📖 Full Guide: [DEPLOYMENT.md](DEPLOYMENT.md)
- 💳 Payment Setup: [POLAR_PRODUCT_SETUP.md](POLAR_PRODUCT_SETUP.md)
- 🔗 Integration: [POLAR_INTEGRATION.md](POLAR_INTEGRATION.md)
- 🧪 Testing: [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md)

---

**Ready to deploy! 🚀**

Choose your method and follow the instructions in DEPLOYMENT.md
