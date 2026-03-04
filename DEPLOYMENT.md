# FireForge API - Deployment Guide

## Quick Start - Docker Deployment

### Prerequisites
- Docker installed
- Docker Compose installed
- `.env` file configured with production values

---

## Option 1: Docker Compose (Recommended)

### 1. Prepare Environment

```bash
# Copy production env template
cp .env.production .env

# Edit .env with your actual values
nano .env  # or vim, or any editor
```

**Required values:**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Your Supabase anon key
- `FIRECRAWL_BASE_URL` - Your Firecrawl instance URL
- `POLAR_ACCESS_TOKEN` - Polar API token
- `POLAR_WEBHOOK_SECRET` - Polar webhook secret
- `POLAR_ORGANIZATION_ID` - Your Polar organization ID
- `ADMIN_MASTER_KEY` - Secure random key (generate with: `openssl rand -hex 32`)

### 2. Build and Start

```bash
# Build the image
docker-compose build

# Start the service
docker-compose up -d

# Check logs
docker-compose logs -f fireforge-api

# Check status
docker-compose ps
```

### 3. Verify Deployment

```bash
# Health check
curl http://localhost:8000/health

# Should return: {"status": "healthy"}
```

### 4. Stop/Restart

```bash
# Stop
docker-compose down

# Restart
docker-compose restart

# Update and restart
docker-compose pull
docker-compose up -d --build
```

---

## Option 2: Docker Only (Without Compose)

### 1. Build Image

```bash
docker build -t fireforge-api:latest .
```

### 2. Run Container

```bash
docker run -d \
  --name fireforge-api \
  --restart unless-stopped \
  -p 8000:8000 \
  --env-file .env \
  fireforge-api:latest
```

### 3. Manage Container

```bash
# View logs
docker logs -f fireforge-api

# Stop
docker stop fireforge-api

# Start
docker start fireforge-api

# Remove
docker rm -f fireforge-api
```

---

## Option 3: Deploy to VPS

### Using Your VPS (coolify.kapturo.online)

#### Method A: Via Coolify Dashboard

1. **Login to Coolify**: http://coolify.kapturo.online:8000

2. **Create New Application**:
   - Choose "Docker Compose"
   - Add your repository or upload files
   - Set environment variables
   - Deploy!

3. **Configure Domain** (if needed):
   - Add your domain in Coolify
   - SSL will be automatically configured

#### Method B: Manual Deployment via SSH

```bash
# 1. SSH to your VPS
ssh root@coolify.kapturo.online

# 2. Clone/upload your code
git clone https://github.com/yourusername/fireforge-api.git
cd fireforge-api

# 3. Configure environment
cp .env.production .env
nano .env  # Update with production values

# 4. Deploy with Docker Compose
docker-compose up -d

# 5. Check logs
docker-compose logs -f

# 6. Configure firewall (if needed)
ufw allow 8000/tcp
```

---

## Option 4: Deploy to Cloud Platforms

### Deploy to AWS ECS

```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ECR_URL
docker build -t fireforge-api:latest .
docker tag fireforge-api:latest YOUR_ECR_URL/fireforge-api:latest
docker push YOUR_ECR_URL/fireforge-api:latest

# Create ECS service using the image
# (See AWS ECS documentation for detailed steps)
```

### Deploy to Google Cloud Run

```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT-ID/fireforge-api
gcloud run deploy fireforge-api \
  --image gcr.io/PROJECT-ID/fireforge-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars-file .env
```

### Deploy to Azure Container Instances

```bash
# Build and push to ACR
az acr build --registry YOUR_REGISTRY --image fireforge-api:latest .

# Deploy
az container create \
  --resource-group YOUR_RG \
  --name fireforge-api \
  --image YOUR_REGISTRY.azurecr.io/fireforge-api:latest \
  --dns-name-label fireforge-api \
  --ports 8000 \
  --environment-variables-file .env
```

### Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create fireforge-api

# Add config vars
heroku config:set SUPABASE_URL=your-value
heroku config:set SUPABASE_KEY=your-value
# ... add all environment variables

# Deploy
git push heroku main

# Open
heroku open
```

---

## Production Configuration

### Environment Variables

**Critical Settings:**

1. **ADMIN_MASTER_KEY**: Generate strong key
   ```bash
   openssl rand -hex 32
   ```

2. **POLAR_WEBHOOK_SECRET**: Get from Polar dashboard
   - Settings → Webhooks → Show Secret

3. **FIRECRAWL_BASE_URL**: Point to your Firecrawl instance
   - If using Docker on same host: `http://firecrawl-api:3002`
   - If external: `http://your-domain.com:3002`

### SSL/HTTPS Setup

#### Option 1: Using Nginx Reverse Proxy

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://fireforge-api:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Then use Certbot for SSL:
```bash
sudo certbot --nginx -d your-domain.com
```

#### Option 2: Using Traefik (Already on VPS)

Add labels to docker-compose.yml:

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.fireforge.rule=Host(`api.yourdomain.com`)"
  - "traefik.http.routers.fireforge.entrypoints=websecure"
  - "traefik.http.routers.fireforge.tls.certresolver=letsencrypt"
  - "traefik.http.services.fireforge.loadbalancer.server.port=8000"
```

---

## Post-Deployment Tasks

### 1. Configure Polar Webhook

Update webhook URL in Polar dashboard:
```
https://your-domain.com/polar/webhook
```

Subscribe to events:
- ✅ `order.paid`
- ✅ `order.refunded`
- ✅ `checkout.created`
- ✅ `checkout.updated`

### 2. Test Payment Flow

```bash
# Create test user
curl -X POST https://your-domain.com/admin/users \
  -H "Authorization: Bearer YOUR_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com", "is_admin":false}'

# Check health
curl https://your-domain.com/health
```

### 3. Monitor Logs

```bash
# Docker Compose
docker-compose logs -f --tail=100

# Docker
docker logs -f fireforge-api

# View last 100 lines
docker logs --tail 100 fireforge-api
```

---

## Scaling

### Horizontal Scaling

Update `docker-compose.yml`:

```yaml
fireforge-api:
  # ... other config
  deploy:
    replicas: 3
    resources:
      limits:
        cpus: '1'
        memory: 512M
```

Or in Dockerfile, increase workers:
```dockerfile
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "8"]
```

### Behind Load Balancer

Use Nginx or Traefik to load balance between multiple instances.

---

## Monitoring

### Health Endpoint

```bash
curl https://your-domain.com/health
```

### Docker Health Check

```bash
docker inspect --format='{{.State.Health.Status}}' fireforge-api
```

### Logs

```bash
# Real-time logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Specific service
docker-compose logs fireforge-api
```

---

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs fireforge-api

# Check environment
docker-compose config

# Rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Connection issues

```bash
# Check if port is accessible
curl http://localhost:8000/health

# Check firewall
sudo ufw status

# Check if container is running
docker ps | grep fireforge
```

### Webhook not receiving

```bash
# Check ngrok/tunnel is running (for local testing)
curl https://your-ngrok-url.ngrok.io/polar/webhook

# Check Polar webhook logs in dashboard
# Check your application logs
docker-compose logs -f | grep "webhook"
```

---

## Backup & Restore

### Backup

Supabase handles database backups automatically. 

For application files:
```bash
# Backup environment
cp .env .env.backup

# Backup code
git push origin main
```

### Restore

```bash
# Restore environment
cp .env.backup .env

# Redeploy
docker-compose down
docker-compose up -d --build
```

---

## Security Checklist

- [ ] Strong `ADMIN_MASTER_KEY` (32+ characters, random)
- [ ] HTTPS enabled (SSL certificate)
- [ ] Firewall configured (only necessary ports open)
- [ ] Environment variables not committed to Git
- [ ] Webhook signature verification enabled
- [ ] Rate limiting enabled
- [ ] Regular security updates (`docker-compose pull`)
- [ ] Logs monitored for suspicious activity
- [ ] Supabase RLS policies configured
- [ ] API keys rotated periodically

---

## Performance Tips

1. **Use Redis for rate limiting** (current in-memory solution doesn't persist)
2. **Enable HTTP/2** if using reverse proxy
3. **Add CDN** for static content (if any)
4. **Monitor response times** and optimize slow endpoints
5. **Database indexing** - ensure all queries use indexes
6. **Connection pooling** - optimize Supabase connections

---

## Support

- Documentation: See README.md and POLAR_INTEGRATION.md
- Logs: `docker-compose logs -f`
- Health: `curl https://your-domain.com/health`

---

**Your FireForge API is ready for production! 🚀**
