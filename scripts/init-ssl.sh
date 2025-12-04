#!/bin/bash

# SSL Initialization Script for Transellia
# This script sets up Let's Encrypt SSL certificates for the domain

set -e

# Configuration
DOMAIN=${DOMAIN:-transellia.com}
EMAIL=${EMAIL:-admin@transellia.com}

echo "Initializing SSL setup for domain: $DOMAIN"
echo "Email for SSL registration: $EMAIL"

# Create necessary directories
mkdir -p certbot/conf certbot/www

# Check if domain is reachable
echo "Checking if domain $DOMAIN is reachable..."
if ! nslookup $DOMAIN > /dev/null 2>&1; then
    echo "WARNING: Domain $DNS_DOMAIN is not reachable from this network."
    echo "Please ensure the domain points to this server's IP address."
    echo "Continuing anyway for testing purposes..."
fi

# Generate temporary self-signed certificate for initial setup
echo "Generating temporary self-signed certificate..."
openssl req -x509 -nodes -days 1 -newkey rsa:2048 \
    -keyout certbot/conf/privkey.pem \
    -out certbot/conf/fullchain.pem \
    -subj "/C=ID/ST=Jakarta/L=Jakarta/O=Transellia/OU=IT/CN=$DOMAIN"

# Start nginx with temporary certificate
echo "Starting nginx with temporary certificate..."
docker-compose up -d nginx

# Wait for nginx to start
echo "Waiting for nginx to start..."
sleep 10

# Request Let's Encrypt certificate
echo "Requesting Let's Encrypt certificate..."
docker-compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    --email $EMAIL \
    -d $DOMAIN \
    --rsa-key-size 4096 \
    --agree-tos \
    --force-renewal \
    --non-interactive" certbot

# Restart nginx to use the new certificates
echo "Restarting nginx to use Let's Encrypt certificates..."
docker-compose restart nginx

echo "SSL setup completed successfully!"
echo "Your site is now accessible at https://$DOMAIN"
echo "Certificates will be automatically renewed by the certbot service."