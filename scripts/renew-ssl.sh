#!/bin/bash

# SSL Renewal Script for Transellia
# This script manually renews Let's Encrypt SSL certificates

set -e

echo "Renewing SSL certificates..."

# Run certbot renewal
docker-compose run --rm --entrypoint "certbot renew --cert-name transellia.com" certbot

# Restart nginx to apply renewed certificates
echo "Restarting nginx to apply renewed certificates..."
docker-compose restart nginx

echo "SSL certificate renewal completed!"
echo "Checking certificate expiration..."
docker-compose run --rm --entrypoint "certbot certificates" certbot

echo "Current certificate status:"
echo "You can check certificate details with:"
echo "docker-compose run --rm --entrypoint 'openssl x509 -in /etc/letsencrypt/live/transellia.com/cert.pem -text -noout' certbot"