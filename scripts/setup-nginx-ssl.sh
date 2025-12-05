#!/bin/bash

# SSL Setup Script for Nginx with Docker Compose
# This script helps set up SSL certificates and configure nginx

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
DOMAIN=${DOMAIN:-transellia.com}
EMAIL=${EMAIL:-admin@transellia.com}
USE_STAGING=${USE_STAGING:-false}

echo -e "${GREEN}🚀 Starting Nginx SSL Setup for Transellia${NC}"
echo "Domain: $DOMAIN"
echo "Email: $EMAIL"
echo "Using Staging: $USE_STAGING"
echo ""

# Create necessary directories
echo -e "${YELLOW}📁 Creating directories...${NC}"
mkdir -p certbot/conf certbot/www

# Check if .env.ssl exists
if [ ! -f .env.ssl ]; then
    echo -e "${YELLOW}📝 Creating .env.ssl file from template...${NC}"
    cp .env.ssl.example .env.ssl
    echo -e "${RED}⚠️  Please edit .env.ssl with your domain and email!${NC}"
    echo "Then run this script again."
    exit 1
fi

# Load environment variables
source .env.ssl

# Function to generate extra domains args
generate_extra_domains_args() {
    if [ -n "$EXTRA_DOMAINS" ]; then
        echo "$EXTRA_DOMAINS" | sed 's/,/ -d /g' | sed 's/^/ -d /' | sed 's/  *//'
    fi
}

EXTRA_DOMAINS_ARGS=$(generate_extra_domains_args)

# Check if certificates already exist
if [ -d "certbot/conf/live/$DOMAIN" ]; then
    echo -e "${GREEN}✅ SSL certificates already exist for $DOMAIN${NC}"
else
    echo -e "${YELLOW}🔐 Requesting SSL certificates...${NC}"
    
    # Prepare certbot command
    CERTBOT_ARGS="certonly --webroot --webroot-path=/var/www/certbot --email $EMAIL --agree-tos --no-eff-email -d $DOMAIN$EXTRA_DOMAINS_ARGS"
    
    if [ "$USE_STAGING" = "true" ]; then
        CERTBOT_ARGS="$CERTBOT_ARGS --staging"
        echo -e "${YELLOW}⚠️  Using Let's Encrypt staging environment${NC}"
    fi
    
    # Run certbot in docker container
    docker run --rm \
        -v $(pwd)/certbot/conf:/etc/letsencrypt \
        -v $(pwd)/certbot/www:/var/www/certbot \
        certbot/certbot:latest \
        $CERTBOT_ARGS
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ SSL certificates obtained successfully!${NC}"
    else
        echo -e "${RED}❌ Failed to obtain SSL certificates${NC}"
        exit 1
    fi
fi

# Test nginx configuration
echo -e "${YELLOW}🔧 Testing nginx configuration...${NC}"

# Generate nginx.conf from template
envsubst '\$DOMAIN \$EXTRA_DOMAINS \$SSL_PROTOCOLS \$SSL_CIPHERS \$HSTS_MAX_AGE \$HSTS_INCLUDE_SUBDOMAINS \$RATE_LIMIT_REQUESTS_PER_SECOND \$RATE_LIMIT_BURST' \
    < nginx/nginx.conf.template > nginx/nginx.conf

# Test nginx config with docker
docker run --rm \
    -v $(pwd)/nginx/nginx.conf:/etc/nginx/nginx.conf:ro \
    -v $(pwd)/certbot/conf:/etc/letsencrypt:ro \
    nginx:alpine \
    nginx -t

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Nginx configuration is valid!${NC}"
else
    echo -e "${RED}❌ Nginx configuration has errors${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Run 'docker-compose up -d' to start all services"
echo "2. Check 'docker-compose logs nginx' to monitor nginx"
echo "3. Access your application at https://$DOMAIN"
echo ""
echo "Useful commands:"
echo "- View logs: docker-compose logs -f nginx"
echo "- Renew certificates: docker-compose exec certbot certbot renew"
echo "- Test nginx config: docker-compose exec nginx nginx -t"
echo "- Reload nginx: docker-compose exec nginx nginx -s reload"