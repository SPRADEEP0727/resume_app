#!/bin/bash

# Resume App Deployment Script for VPS (Monorepo Version)
# This script sets up the Resume App from a single repository

set -e

echo "==================================="
echo "Resume App - VPS Deployment Script"
echo "==================================="

# Configuration
DEPLOY_DIR="/var/www/resume_app"
REPO_URL="https://github.com/SPRADEEP0727/career_app_backend.git"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script should be run as root or with sudo${NC}" 
   exit 1
fi

echo -e "${GREEN}Step 1: Creating deployment directory${NC}"
mkdir -p $DEPLOY_DIR

echo -e "${GREEN}Step 2: Cloning repository${NC}"
if [ -d "$DEPLOY_DIR/.git" ]; then
    echo -e "${YELLOW}Repository exists, pulling latest changes${NC}"
    cd $DEPLOY_DIR
    git pull
else
    git clone $REPO_URL $DEPLOY_DIR
    cd $DEPLOY_DIR
fi

echo -e "${GREEN}Step 3: Setting up environment file${NC}"
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${YELLOW}Created .env file from .env.example${NC}"
        echo -e "${YELLOW}Please edit .env file with your configuration${NC}"
    else
        echo -e "${YELLOW}Creating .env file${NC}"
        cat > .env << 'EOF'
# Backend
OPENAI_API_KEY=your-openai-api-key-here
SECRET_KEY=your-secret-key-here
FLASK_ENV=production
PORT=5000

# Frontend
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
VITE_API_BASE_URL=/api
EOF
        echo -e "${YELLOW}Please edit .env file with your configuration${NC}"
    fi
else
    echo -e "${GREEN}.env file already exists${NC}"
fi

echo -e "${GREEN}Step 4: Checking Docker installation${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker not found, installing...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
else
    echo -e "${GREEN}Docker is already installed${NC}"
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}Docker Compose not found, installing...${NC}"
    apt install docker-compose -y
else
    echo -e "${GREEN}Docker Compose is already installed${NC}"
fi

echo -e "${GREEN}Step 5: Building and starting containers${NC}"
docker-compose build
docker-compose up -d

echo -e "${GREEN}Step 6: Checking container status${NC}"
sleep 5
docker-compose ps

echo ""
echo -e "${GREEN}==================================="
echo "Deployment Complete!"
echo "===================================${NC}"
echo ""
echo "Next steps:"
echo "1. Edit .env file: nano $DEPLOY_DIR/.env"
echo "2. Restart containers: docker-compose restart"
echo "3. View logs: docker-compose logs -f"
echo "4. Configure domain and SSL (see DOCKER_DEPLOYMENT.md)"
echo ""
echo "URLs:"
echo "- Frontend: http://YOUR_SERVER_IP"
echo "- Backend API: http://YOUR_SERVER_IP/api"
echo "- Health: http://YOUR_SERVER_IP/health"
echo ""
