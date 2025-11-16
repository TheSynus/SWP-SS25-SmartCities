# Production Deployment Guide

This guide explains how to deploy the SmartCities web application in production using Docker Compose and pre-built images from GitHub Container Registry.

> **Note**: For development setup, see [README.md](README.md#quick-start---development)

## CI/CD with GitHub Actions

The project uses GitHub Actions to automatically build and push Docker images to GitHub Container Registry (ghcr.io) whenever code is pushed to the `main` branch or when a version tag is created.

### Automated Image Building

When you push to the `main` branch, GitHub Actions will:
1. Build the frontend and backend Docker images
2. Push them to `ghcr.io/thesynus/swp-ss25-smartcities/frontend:latest` and `ghcr.io/thesynus/swp-ss25-smartcities/backend:latest`
3. Cache layers for faster subsequent builds

This means **you don't need to build images on the production server** - just pull the pre-built images.

### Manual Workflow Trigger

You can also manually trigger a build from the GitHub Actions tab:
1. Go to the repository on GitHub
2. Click "Actions" → "Build and Push Docker Images"
3. Click "Run workflow"

### Version Tagging

To create a versioned release:
```bash
git tag v1.0.0
git push origin v1.0.0
```

This will create images tagged with:
- `v1.0.0` (full version)
- `1.0` (major.minor)
- `latest` (if on main branch)

### Authenticating with GitHub Container Registry

On your production server, authenticate Docker with GitHub Container Registry:

```bash
# Create a GitHub Personal Access Token (PAT) with 'read:packages' scope
# Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)

# Login to ghcr.io
echo "YOUR_GITHUB_PAT" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

The token only needs `read:packages` permission for pulling images.

## Docker Compose Files

The project includes two Docker Compose configurations:

- **`docker-compose.prod.yml`**: Production deployment using pre-built images from GitHub Container Registry
  - Use this for production deployments
  - Images are automatically built by GitHub Actions
  - No local building required

- **`docker-compose.test.yml`**: Local testing with image building
  - Use this for testing the entire production stack locally
  - Builds images on your machine
  - Useful for verifying changes before pushing to GitHub
  - See [README.md](README.md) for development setup

## Prerequisites

- Docker Engine 20.10+ and Docker Compose V2
- At least 2GB RAM and 10GB disk space
- Linux server (tested on Ubuntu 22.04 LTS)
- Open ports: 80 (HTTP) and optionally 443 (HTTPS)

### Automated Server Setup with Ansible (Optional)

If you prefer automated server provisioning, you can use the included Ansible playbook to install Docker and dependencies:

```bash
cd ansible
ansible-playbook -i ansible_hosts playbook.yaml --ask-vault-pass
```

See **[ansible/README.md](ansible/README.md)** for detailed setup instructions.

Otherwise, install Docker manually following the [official Docker documentation](https://docs.docker.com/engine/install/).

## Quick Start

### 1. Authenticate with GitHub Container Registry

```bash
# Create a Personal Access Token at GitHub → Settings → Developer settings
# Token needs 'read:packages' permission

echo "YOUR_GITHUB_PAT" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

### 2. Clone the Repository

```bash
git clone git@github.com:TheSynus/SWP-SS25-SmartCities.git
cd SWP-SS25-SmartCities
```

### 3. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.production.example .env.production

# Edit with secure passwords
nano .env.production
```

**Important**: Change all default passwords before deployment!

### 4. Configure Backend Settings

Ensure the backend configuration file has valid initial values:

```bash
# Check/edit SmartCities_Backend/api/config.json
cat SmartCities_Backend/api/config.json
```

The file should contain:
```json
{
  "plz": "22880",
  "cityName": "Wedel, Stadt",
  "regionalKey": "010560050050",
  "latitude": 53.58,
  "longitude": 9.70,
  "apiKey": "your-openweathermap-api-key"
}
```

Replace these values with your municipality's data:
- `plz`: 5-digit postal code
- `cityName`: Municipality name
- `regionalKey`: 12-digit regional key for NINA warnings
- `latitude`/`longitude`: Geo-coordinates for weather data
- `apiKey`: Your OpenWeatherMap API key (get one at https://openweathermap.org/api)

### 5. Deploy the Application

```bash
# Pull pre-built images and start all services
docker compose -f docker-compose.prod.yml --env-file .env.production up -d

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Check service status
docker compose -f docker-compose.prod.yml ps
```

**Note**: The images are pulled from GitHub Container Registry. No build step is needed on the production server.

The application will be available at:
- **Frontend**: http://your-server-ip (default port 80)
- **API**: http://your-server-ip/api/

### 6. Verify Deployment

```bash
# Check all containers are healthy
docker compose -f docker-compose.prod.yml ps

# Test the API
curl http://localhost/api/nina/test

# Test the frontend
curl http://localhost/health
```

## Production Checklist

### Security
- [ ] Changed all default passwords in `.env.production`
- [ ] Generated strong, unique passwords (use `openssl rand -base64 32`)
- [ ] Updated `config.json` with valid API key
- [ ] Set up HTTPS/SSL (see SSL Setup section below)

### Configuration
- [ ] Set correct postal code and regional key for your municipality
- [ ] Verified geo-coordinates for accurate weather data
- [ ] Tested OpenWeatherMap API key
- [ ] Reviewed nginx security headers in `SmartCities/nginx.conf`

### Monitoring
- [ ] Set up log rotation for Docker logs
- [ ] Configure health check monitoring
- [ ] Set up backup strategy for PostgreSQL data

## SSL/HTTPS Setup (Recommended)

For production, use a reverse proxy (Traefik, Nginx, or Caddy) to handle SSL:

### Option 1: Using Traefik (Recommended)

```yaml
# Add to docker-compose.prod.yml
services:
  traefik:
    image: traefik:v2.10
    container_name: traefik
    restart: unless-stopped
    command:
      - "--api.insecure=false"
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
      - "--certificatesresolvers.letsencrypt.acme.email=your-email@example.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - traefik_certs:/letsencrypt
    networks:
      - smartcities_network

  frontend:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.smartcities.rule=Host(`your-domain.com`)"
      - "traefik.http.routers.smartcities.entrypoints=websecure"
      - "traefik.http.routers.smartcities.tls.certresolver=letsencrypt"

volumes:
  traefik_certs:
```

Replace `your-domain.com` with your actual domain.

### Option 2: Manual SSL Certificate

If you have your own SSL certificates:

1. Copy certificates to the server:
```bash
mkdir -p ./ssl
cp your-cert.crt ./ssl/
cp your-key.key ./ssl/
```

2. Update `SmartCities/nginx.conf` to include SSL configuration
3. Mount certificates in docker-compose.prod.yml

## Management Commands

### Start/Stop Services

```bash
# Stop all services
docker compose -f docker-compose.prod.yml down

# Stop and remove volumes (WARNING: deletes database!)
docker compose -f docker-compose.prod.yml down -v

# Restart a specific service
docker compose -f docker-compose.prod.yml restart api

# Rebuild and restart after code changes
docker compose -f docker-compose.prod.yml up -d --build --force-recreate
```

### View Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f postgres
```

### Database Management

```bash
# Backup database
docker exec smartcities_postgres pg_dump -U admin webportal > backup_$(date +%Y%m%d).sql

# Restore database
cat backup_20250101.sql | docker exec -i smartcities_postgres psql -U admin -d webportal

# Access PostgreSQL shell
docker exec -it smartcities_postgres psql -U admin -d webportal
```

### Update Application

```bash
# Pull latest changes from git
git pull origin main

# Pull latest Docker images from registry
docker compose -f docker-compose.prod.yml pull

# Restart with new images
docker compose -f docker-compose.prod.yml up -d

# Check for errors
docker compose -f docker-compose.prod.yml logs -f
```

**Note**: Since images are built by GitHub Actions, you just need to pull the latest images, not rebuild them locally.

## Monitoring and Health Checks

All services include health checks. Monitor them with:

```bash
# Check health status
docker compose -f docker-compose.prod.yml ps

# Watch health status continuously
watch -n 5 'docker compose -f docker-compose.prod.yml ps'
```

Health check endpoints:
- Frontend: `http://localhost/health`
- API: `http://localhost:3000/nina/test`
- PostgreSQL: Internal health check

## Troubleshooting

### Container won't start

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs <service-name>

# Check if ports are already in use
sudo netstat -tulpn | grep -E ':(80|3000|5432)'

# Remove containers and restart
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

### Database connection issues

```bash
# Check if PostgreSQL is healthy
docker compose -f docker-compose.prod.yml ps postgres

# Test database connection
docker exec smartcities_postgres pg_isready -U admin

# Check environment variables
docker compose -f docker-compose.prod.yml config
```

### Frontend can't reach backend

```bash
# Check network connectivity
docker exec smartcities_frontend ping -c 3 api

# Check nginx configuration
docker exec smartcities_frontend nginx -t

# Reload nginx
docker exec smartcities_frontend nginx -s reload
```

### API errors

```bash
# Check config.json is mounted
docker exec smartcities_api cat /app/config.json

# Verify environment variables
docker exec smartcities_api env | grep DB_

# Test API directly
docker exec smartcities_api wget -O- http://localhost:3000/nina/test
```

## Performance Tuning

### For production workloads:

1. **Increase PostgreSQL resources** (in docker-compose.prod.yml):
```yaml
postgres:
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 2G
      reservations:
        memory: 512M
```

2. **Enable PostgreSQL connection pooling** (add to API container):
```bash
DB_POOL_MAX=20
DB_POOL_MIN=5
```

3. **Configure nginx worker processes** (in nginx.conf):
```nginx
worker_processes auto;
worker_connections 1024;
```

## Backup Strategy

Automated backup script:

```bash
#!/bin/bash
# backup.sh - Place in /root/smartcities-backup/

BACKUP_DIR="/var/backups/smartcities"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
docker exec smartcities_postgres pg_dump -U admin webportal | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup config
cp /path/to/SmartCities_Backend/api/config.json $BACKUP_DIR/config_$DATE.json

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete
find $BACKUP_DIR -name "config_*.json" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Add to crontab:
```bash
# Daily backup at 2 AM
0 2 * * * /root/smartcities-backup/backup.sh >> /var/log/smartcities-backup.log 2>&1
```

## Local Testing Before Deployment

If you want to test the production stack locally before deploying, use `docker-compose.test.yml`:

```bash
# Copy environment file
cp .env.production.example .env.production
nano .env.production  # Edit with your settings

# Build and start the entire production stack locally
docker compose -f docker-compose.test.yml --env-file .env.production up -d --build

# View logs
docker compose -f docker-compose.test.yml logs -f

# Test the application
curl http://localhost/health
curl http://localhost/api/nina/test

# Stop when done
docker compose -f docker-compose.test.yml down
```

This builds the images locally (like GitHub Actions would) and lets you verify everything works before pushing to production.

## Support

For issues and questions:
- Check logs: `docker compose -f docker-compose.prod.yml logs`
- Review health status: `docker compose -f docker-compose.prod.yml ps`
- Consult [CLAUDE.md](CLAUDE.md) for architecture details
- See [README.md](README.md) for development setup
