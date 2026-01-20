# Resume App - Docker Deployment Guide

This guide will help you deploy the Resume App on Hostinger VPS using Docker.

## Architecture

The application uses a **3-container architecture**:
- **Nginx**: Reverse proxy (port 80/443)
- **Backend**: Flask API (internal port 5000)
- **Frontend**: React/Vite app (internal port 3000)

```
Internet → Nginx (80/443) → Frontend (3000)
                          → Backend API (/api → 5000)
```

## Prerequisites

1. **VPS Server** (Hostinger or any provider)
2. **Docker & Docker Compose** installed
3. **Domain name** (optional but recommended)
4. **SSL Certificate** (Let's Encrypt recommended)

## Deployment Methods

### Method 1: Hostinger Docker Manager (Recommended for Hostinger VPS)

If you're using Hostinger VPS with Docker Manager, deployment is extremely simple:

1. **Access Docker Manager** in your Hostinger panel
2. **Create New Container** or **Add Application**
3. **Provide Git Repository URL**: 
   ```
   https://github.com/SPRADEEP0727/resume_app.git
   ```
4. **Configure Environment Variables** in the Docker Manager:
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `SECRET_KEY` - Generate a secure random key
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
   - `VITE_API_BASE_URL` - Set to `/api`

5. **Deploy** - Hostinger will automatically:
   - Clone the repository
   - Build Docker containers using `docker-compose.yml`
   - Start all services (nginx, backend, frontend)
   - Assign ports and domain

6. **Access Your App** via the provided Hostinger domain or your custom domain

**That's it!** Hostinger handles all the Docker orchestration automatically.

---

### Method 2: Manual Deployment (For Non-Hostinger or Advanced Users)

If you're not using Hostinger's Docker Manager or prefer manual control:

## Installation Steps

### 1. Install Docker on VPS

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y

# Add user to docker group
sudo usermod -aG docker $USER

# Verify installation
docker --version
docker-compose --version
```

### 2. Clone Repository

```bash
cd /var/www
git clone https://github.com/SPRADEEP0727/resume_app.git resume_app
cd resume_app
```

### 3. Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit environment variables
nano .env
```

**Required environment variables:**
```env
# Backend
OPENAI_API_KEY=sk-your-openai-api-key
SECRET_KEY=your-super-secret-key-change-this

# Frontend
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_BASE_URL=/api
```

### 4. Build and Run Containers

```bash
# Build all containers
docker-compose build

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 5. Configure Domain (Optional)

If you have a domain name, point it to your VPS IP:
- Add **A record**: `@` → `your-vps-ip`
- Add **A record**: `www` → `your-vps-ip`

### 6. Setup SSL Certificate (Let's Encrypt)

```bash
# Install certbot
sudo apt install certbot -y

# Stop nginx container temporarily
docker-compose stop nginx

# Get SSL certificate
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Copy certificates to nginx folder
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem

# Update nginx.conf - uncomment HTTPS section and update server_name
nano nginx/nginx.conf

# Restart nginx
docker-compose up -d nginx
```

### 7. Auto-renew SSL Certificate

```bash
# Create renewal script
sudo nano /usr/local/bin/renew-ssl.sh
```

Add this content:
```bash
#!/bin/bash
certbot renew --quiet
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /var/www/resume_app/nginx/ssl/cert.pem
cp /etc/letsencrypt/live/your-domain.com/privkey.pem /var/www/resume_app/nginx/ssl/key.pem
docker-compose -f /var/www/resume_app/docker-compose.yml restart nginx
```

Make it executable and add to crontab:
```bash
sudo chmod +x /usr/local/bin/renew-ssl.sh
sudo crontab -e
# Add this line:
0 0 * * 0 /usr/local/bin/renew-ssl.sh
```

## Docker Commands

### Start/Stop Services
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart specific service
docker-compose restart nginx
docker-compose restart backend
docker-compose restart frontend
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f nginx
docker-compose logs -f backend
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Update Application
```bash
# Pull latest code
cd /var/www/resume_app
git pull

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Or rebuild specific service
docker-compose build backend
docker-compose up -d backend
```

### Clean Up
```bash
# Remove stopped containers
docker-compose down

# Remove all containers, networks, and volumes
docker-compose down -v

# Clean Docker system
docker system prune -a
```

## Monitoring

### Check Container Status
```bash
docker-compose ps
```

### Check Container Health
```bash
docker inspect resume_app_nginx | grep -A 10 Health
docker inspect resume_app_backend | grep -A 10 Health
docker inspect resume_app_frontend | grep -A 10 Health
```

### Resource Usage
```bash
docker stats
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs backend

# Check if port is already in use
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Remove and recreate
docker-compose down
docker-compose up -d
```

### Backend API not responding
```bash
# Check backend logs
docker-compose logs backend

# Exec into backend container
docker exec -it resume_app_backend sh

# Test backend health
curl http://localhost:5000/health
```

### Frontend not loading
```bash
# Check frontend logs
docker-compose logs frontend

# Rebuild frontend
docker-compose build frontend
docker-compose up -d frontend
```

### Nginx errors
```bash
# Check nginx config syntax
docker exec resume_app_nginx nginx -t

# Reload nginx
docker exec resume_app_nginx nginx -s reload

# Check nginx logs
docker-compose logs nginx
```

## Firewall Configuration

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## Backup

### Backup uploads folder
```bash
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz career_app_backend/uploads/
```

### Backup environment file
```bash
cp .env .env.backup
```

## Performance Optimization

### Nginx Caching
Edit `nginx/nginx.conf` to add caching for static files:
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Backend Workers
Increase Gunicorn workers in `career_app_backend/Dockerfile`:
```dockerfile
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--timeout", "120", "app:app"]
```

## Security Checklist

- [ ] Change default SECRET_KEY
- [ ] Setup SSL/HTTPS
- [ ] Configure firewall (UFW)
- [ ] Regular system updates
- [ ] Limit API rate (already configured in nginx)
- [ ] Regular backups
- [ ] Monitor logs regularly
- [ ] Use strong passwords for Supabase
- [ ] Keep Docker images updated

## URLs

- **Frontend**: `http://your-domain.com` or `http://your-vps-ip`
- **Backend API**: `http://your-domain.com/api` or `http://your-vps-ip/api`
- **Health Check**: `http://your-domain.com/health` or `http://your-vps-ip/health`

## Support

If you encounter issues:
1. Check logs: `docker-compose logs -f`
2. Verify environment variables in `.env`
3. Ensure all ports are open in firewall
4. Check Docker daemon status: `sudo systemctl status docker`

---

**Note**: This setup is production-ready but should be customized based on your specific requirements and traffic patterns.
