#!/bin/bash

# Quick HTTPS Setup Script for Transellia
# This script automates the entire HTTPS setup process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if domain is provided
if [ -z "$1" ]; then
    print_error "Domain name is required!"
    echo "Usage: $0 your-domain.com [email@your-domain.com]"
    echo "Example: $0 transellia.com admin@transellia.com"
    exit 1
fi

DOMAIN=$1
EMAIL=${2:-admin@$DOMAIN}

print_status "Starting HTTPS setup for domain: $DOMAIN"
print_status "Email for SSL registration: $EMAIL"

# Check if .env.ssl exists, if not create it
if [ ! -f .env.ssl ]; then
    print_status "Creating .env.ssl configuration file..."
    cp .env.ssl.example .env.ssl
    
    # Update domain and email in .env.ssl
    sed -i "s/DOMAIN=transellia.com/DOMAIN=$DOMAIN/" .env.ssl
    sed -i "s/EMAIL=admin@transellia.com/EMAIL=$EMAIL/" .env.ssl
    
    print_status "Created .env.ssl with your domain and email"
else
    print_warning ".env.ssl already exists, skipping creation"
fi

# Check if .env exists for admin configuration
if [ ! -f .env ]; then
    print_status "Creating .env file for admin configuration..."
    cp .env.admin.example .env
    
    # Update admin email in .env
    sed -i "s/ADMIN_EMAIL=admin@transellia.com/ADMIN_EMAIL=$EMAIL/" .env
    
    print_warning "Please update ADMIN_PASSWORD in .env file with a secure password"
    print_status "Created .env with admin configuration template"
else
    print_status ".env file already exists"
    if ! grep -q "ADMIN_EMAIL" .env; then
        print_status "Adding admin configuration to existing .env file..."
        echo "" >> .env
        echo "# Admin Configuration" >> .env
        echo "ADMIN_EMAIL=$EMAIL" >> .env
        echo "ADMIN_PASSWORD=please_change_this_password" >> .env
        echo "ADMIN_NAME=Administrator" >> .env
        print_warning "Please update ADMIN_PASSWORD in .env file with a secure password"
    fi
fi

# Check if docker-compose is running
if docker-compose ps | grep -q "Up"; then
    print_warning "Some services are already running. Stopping them..."
    docker-compose down
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p certbot/conf certbot/www logs

# Check if domain resolves to this server
print_status "Checking domain resolution..."
if nslookup $DOMAIN > /dev/null 2>&1; then
    print_status "Domain $DOMAIN resolves correctly"
else
    print_warning "Domain $DOMAIN does not resolve to this server's IP"
    print_warning "Please ensure your domain A record points to this server"
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Initialize SSL certificates
print_status "Initializing SSL certificates..."
./scripts/init-ssl.sh

# Start the full application
print_status "Starting the full application stack..."
docker-compose up -d

# Wait for services to start
print_status "Waiting for services to start..."
sleep 30

# Check service status
print_status "Checking service status..."
docker-compose ps

# Test HTTPS setup
print_status "Testing HTTPS setup..."
if curl -k -s -o /dev/null -w "%{http_code}" https://$DOMAIN | grep -q "200"; then
    print_status "HTTPS is working correctly!"
else
    print_warning "HTTPS test failed. Please check the logs:"
    echo "  docker-compose logs nginx"
    echo "  docker-compose logs certbot"
fi

print_status "Setup completed successfully!"
echo ""
echo "Your application is now accessible at:"
echo "  HTTPS: https://$DOMAIN"
echo "  HTTP (redirects to HTTPS): http://$DOMAIN"
echo ""
echo "Important files created:"
echo "  - .env.ssl (SSL configuration)"
echo "  - .env (Admin configuration)"
echo "  - certbot/ (SSL certificates)"
echo "  - nginx/nginx.conf (Nginx configuration)"
echo ""
echo "Admin User:"
echo "  - Admin user will be created automatically when application starts"
echo "  - Email: $EMAIL"
echo "  - Password: (Set in .env file - please change it!)"
echo "  - Login endpoint: https://$DOMAIN/v1/auth/login"
echo ""
echo "Important Security Notes:"
echo "  - Change the default admin password in .env file immediately"
echo "  - Use a strong password (minimum 12 characters)"
echo "  - Store credentials securely"
echo ""
echo "Useful commands:"
echo "  - Check SSL certificate: docker-compose run --rm --entrypoint 'certbot certificates' certbot"
echo "  - Renew SSL manually: ./scripts/renew-ssl.sh"
echo "  - View logs: docker-compose logs -f nginx certbot backend"
echo "  - Check admin user status: docker-compose exec backend node -e \"require('./src/modules/admin/admin.service').default.getAdminUser().then(console.log)\""
echo ""
echo "For detailed documentation, see: docs/SSL_SETUP_GUIDE.md"