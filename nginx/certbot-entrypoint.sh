#!/bin/sh
set -e

echo "Starting Certbot setup..."

if [ ! -d /etc/letsencrypt/live/$DOMAIN ]; then
  echo "Certificate not found for domain: $DOMAIN. Starting generation process..."
  
  # Prepare extra domains arguments
  if [ -n "$EXTRA_DOMAINS" ]; then
    EXTRA_DOMAINS_ARGS=$(echo $EXTRA_DOMAINS | sed 's/,/ -d /g' | sed 's/^/ -d /' | sed 's/  *//')
  else
    EXTRA_DOMAINS_ARGS=""
  fi

  # Prepare staging argument
  if [ "$LETSENCRYPT_ENV" = "staging" ]; then
    LETSENCRYPT_EXTRA_ARGS="--staging"
  else
    LETSENCRYPT_EXTRA_ARGS=""
  fi

  echo "Running certbot command..."
  certbot certonly --webroot --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN $EXTRA_DOMAINS_ARGS \
    $LETSENCRYPT_EXTRA_ARGS
    
  echo "Certificate generation completed."
else
  echo "Certificate already exists for domain: $DOMAIN"
fi

echo "Starting auto-renewal loop..."
trap exit TERM
while :; do 
  certbot renew
  sleep 12h & wait ${!}
done
