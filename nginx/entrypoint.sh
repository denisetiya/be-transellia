#!/bin/sh
set -e

echo "Starting Nginx setup..."

# Debug: Check template file
echo "Checking template file at /etc/nginx/nginx.conf.template"
ls -l /etc/nginx/nginx.conf.template
if [ -s /etc/nginx/nginx.conf.template ]; then
    echo "Template found and has content."
    echo "First 5 lines of template:"
    head -n 5 /etc/nginx/nginx.conf.template
else
    echo "ERROR: Template file is missing or empty!"
    exit 1
fi

echo "Generating Nginx configuration..."
# Define variables to substitute. Note: We use single quotes to prevent shell expansion here, 
# asking envsubst to only replace these specific variables key.
VARS='$DOMAIN $EXTRA_DOMAINS $SSL_PROTOCOLS $SSL_CIPHERS $HSTS_MAX_AGE $HSTS_INCLUDE_SUBDOMAINS $RATE_LIMIT_REQUESTS_PER_SECOND $RATE_LIMIT_BURST'

envsubst "$VARS" < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

echo "Configuration generated. Content check:"
if [ -s /etc/nginx/nginx.conf ]; then
    echo "Config file generated successfully."
    echo "First 20 lines of /etc/nginx/nginx.conf:"
    head -n 20 /etc/nginx/nginx.conf
else
    echo "ERROR: Generated config file is empty!"
    exit 1
fi

echo "Testing Nginx configuration..."
nginx -t

echo "Starting Nginx..."
exec nginx -g 'daemon off;'
