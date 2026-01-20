#!/bin/bash

# Update script for Resume App (Monorepo)
# Pulls latest changes and rebuilds containers

set -e

DEPLOY_DIR="/var/www/resume_app"

echo "Updating Resume App..."

cd $DEPLOY_DIR

# Pull latest changes
echo "Pulling latest code..."
git pull

# Rebuild and restart
echo "Rebuilding containers..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d

echo "Checking status..."
sleep 5
docker-compose ps

echo "Update complete!"
echo "View logs with: docker-compose logs -f"
