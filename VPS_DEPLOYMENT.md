# VPS Direct Deployment Guide

## Quick Deploy (Automated)

```bash
# Make deploy script executable
chmod +x deploy-vps.sh

# Run it
./deploy-vps.sh
```

---

## Manual Deployment Steps

If you prefer manual control, follow these steps:

### 1. **Navigate to Project Directory**

```bash
cd /path/to/FC+SRXNG
# or wherever you cloned it
```

### 2. **Configure Environment**

```bash
# Copy template
cp .env.production .env

# Edit with your values
nano .env
```

**Update these values:**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-actual-key
FIRECRAWL_BASE_URL=http://localhost:3002  # or your Firecrawl URL
ADMIN_MASTER_KEY=$(openssl rand -hex 32)  # Generate secure key
POLAR_ACCESS_TOKEN=polar_oat_...
POLAR_WEBHOOK_SECRET=whsec_...
POLAR_ORGANIZATION_ID=your-org-id
```

Save and exit (Ctrl+X, then Y, then Enter)

### 3. **Install Docker (if needed)**

```bash
# Check if Docker is installed
docker --version

# If not installed:
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

### 4. **Install Docker Compose (if needed)**

```bash
# Check if installed
docker-compose --version

# If not installed:
curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

### 5. **Build Docker Image**

```bash
docker-compose build
```

### 6. **Start the Service**

```bash
docker-compose up -d
```

### 7. **Check if Running**

```bash
# Check container status
docker-compose ps

# Check logs
docker-compose logs -f

# Test health endpoint
curl http://localhost:8000/health
# Should return: {"status":"healthy"}
```

### 8. **Open Firewall Port (if needed)**

```bash
# If using UFW
sudo ufw allow 8000/tcp
sudo ufw reload

# Check firewall status
sudo ufw status
```

### 9. **Get Your Public IP**

```bash
curl ifconfig.me
```

Your API will be accessible at: `http://YOUR_VPS_IP:8000`

---

## Verify Deployment

### Test Endpoints

```bash
# Health check
curl http://localhost:8000/health

# Should return: {"status":"healthy"}
```

### Check Logs

```bash
# Follow logs in real-time
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Specific service
docker-compose logs fireforge-api
```

### Check Container

```bash
# List running containers
docker ps

# Check health status
docker inspect --format='{{.State.Health.Status}}' fireforge-api
```

---

## Configure Polar Webhook

Update your Polar webhook URL to:
```
http://YOUR_VPS_IP:8000/polar/webhook
```

Or if you have a domain:
```
https://your-domain.com/polar/webhook
```

---

## Common Issues & Solutions

### Port 8000 Already in Use

```bash
# Find what's using port 8000
sudo lsof -i :8000

# Kill the process (replace PID)
sudo kill -9 PID

# Or change port in docker-compose.yml
# Edit: ports: - "8001:8000"
```

### Container Fails to Start

```bash
# Check logs
docker-compose logs fireforge-api

# Rebuild without cache
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Environment Variable Issues

```bash
# Check if .env is loaded
docker-compose config

# Make sure .env is in the same directory
ls -la .env

# Restart after changing .env
docker-compose restart
```

### Health Check Failing

```bash
# Check if service is listening
curl http://localhost:8000/health

# Check inside container
docker exec -it fireforge-api curl http://localhost:8000/health

# Check container logs
docker logs fireforge-api
```

---

## Useful Commands

### Service Management

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Restart
docker-compose restart

# Rebuild and restart
docker-compose up -d --build

# Remove everything
docker-compose down -v --remove-orphans
```

### Logs

```bash
# Follow all logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Logs since 10 minutes ago
docker-compose logs --since 10m

# Logs for specific service
docker-compose logs fireforge-api
```

### Debugging

```bash
# Enter container shell
docker exec -it fireforge-api bash

# Check running processes
docker-compose top

# Check resource usage
docker stats fireforge-api
```

### Updates

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## Setting Up SSL/HTTPS (Optional)

### Option 1: Using Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install nginx

# Create config
sudo nano /etc/nginx/sites-available/fireforge
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/fireforge /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Install SSL with Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Option 2: Use Existing Traefik (on your VPS)

Traefik is already running on your VPS. Add labels to `docker-compose.yml`:

```yaml
services:
  fireforge-api:
    # ... existing config
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.fireforge.rule=Host(`api.yourdomain.com`)"
      - "traefik.http.routers.fireforge.entrypoints=websecure"
      - "traefik.http.routers.fireforge.tls.certresolver=letsencrypt"
      - "traefik.http.services.fireforge.loadbalancer.server.port=8000"
    networks:
      - coolify  # Use Coolify's network
```

---

## Monitoring

### Set Up Log Rotation

```bash
# Create logrotate config
sudo nano /etc/logrotate.d/docker-containers
```

Add:
```
/var/lib/docker/containers/*/*.log {
  rotate 7
  daily
  compress
  size=10M
  missingok
  delaycompress
  copytruncate
}
```

### Monitor Resources

```bash
# Real-time stats
docker stats fireforge-api

# Disk usage
docker system df
```

---

## Next Steps

1. ✅ Service deployed and running
2. ✅ Health check passing
3. ⏳ Configure Polar webhook with your VPS IP/domain
4. ⏳ Test payment flow
5. ⏳ Set up SSL/HTTPS (recommended)
6. ⏳ Configure domain name (optional)
7. ⏳ Set up monitoring/alerts

---

**Your FireForge API is now running on your VPS! 🚀**

Access it at: `http://YOUR_VPS_IP:8000`
