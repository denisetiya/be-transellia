#!/bin/bash

# Admin Management Utilities for Transellia
# This script provides utilities for managing admin users

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Function to check if docker-compose is running
check_docker() {
    if ! docker-compose ps | grep -q "Up"; then
        print_error "Docker services are not running. Please start them with: docker-compose up -d"
        exit 1
    fi
}

# Function to show admin user info
show_admin() {
    print_header "Admin User Information"
    check_docker
    
    docker-compose exec backend node -e "
        const AdminService = require('./src/modules/admin/admin.service').default;
        AdminService.getAdminUser()
            .then(admin => {
                if (admin) {
                    console.log('Admin User Found:');
                    console.log('  ID:', admin.id);
                    console.log('  Email:', admin.email);
                    console.log('  Name:', admin.name || 'Not set');
                } else {
                    console.log('No admin user found or ADMIN_EMAIL not configured');
                }
            })
            .catch(error => {
                console.error('Error:', error.message);
                process.exit(1);
            });
    "
}

# Function to initialize admin user
init_admin() {
    print_header "Initializing Admin User"
    check_docker
    
    docker-compose exec backend node -e "
        const AdminService = require('./src/modules/admin/admin.service').default;
        AdminService.initializeAdmin()
            .then(result => {
                console.log('Result:', result.message);
                if (result.adminCreated) {
                    console.log('✅ New admin user was created');
                } else {
                    console.log('ℹ️ Admin user already exists or not configured');
                }
            })
            .catch(error => {
                console.error('Error:', error.message);
                process.exit(1);
            });
    "
}

# Function to reset admin password
reset_admin_password() {
    print_header "Reset Admin Password"
    check_docker
    
    if [ -z "$1" ]; then
        print_error "New password is required!"
        echo "Usage: $0 reset-password <new_password>"
        exit 1
    fi
    
    NEW_PASSWORD="$1"
    
    print_warning "This will reset the admin password to: $NEW_PASSWORD"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Password reset cancelled"
        exit 0
    fi
    
    docker-compose exec backend node -e "
        const AdminService = require('./src/modules/admin/admin.service').default;
        AdminService.resetAdminPassword('$NEW_PASSWORD')
            .then(result => {
                if (result.success) {
                    console.log('✅', result.message);
                } else {
                    console.log('❌', result.message);
                    process.exit(1);
                }
            })
            .catch(error => {
                console.error('Error:', error.message);
                process.exit(1);
            });
    "
}

# Function to check environment configuration
check_env() {
    print_header "Environment Configuration Check"
    
    if [ -f .env ]; then
        print_status "Found .env file"
        
        if grep -q "ADMIN_EMAIL" .env; then
            ADMIN_EMAIL=$(grep "ADMIN_EMAIL" .env | cut -d'=' -f2)
            print_status "ADMIN_EMAIL: $ADMIN_EMAIL"
        else
            print_warning "ADMIN_EMAIL not found in .env"
        fi
        
        if grep -q "ADMIN_PASSWORD" .env; then
            if grep -q "please_change_this_password" .env; then
                print_warning "ADMIN_PASSWORD is using default value - please change it!"
            else
                print_status "ADMIN_PASSWORD: [SET]"
            fi
        else
            print_warning "ADMIN_PASSWORD not found in .env"
        fi
        
        if grep -q "ADMIN_NAME" .env; then
            ADMIN_NAME=$(grep "ADMIN_NAME" .env | cut -d'=' -f2)
            print_status "ADMIN_NAME: $ADMIN_NAME"
        else
            print_warning "ADMIN_NAME not found in .env"
        fi
    else
        print_error ".env file not found"
        print_status "You can create one by copying .env.admin.example:"
        echo "  cp .env.admin.example .env"
        echo "  # Then edit .env with your admin credentials"
    fi
}

# Function to show help
show_help() {
    echo "Admin Management Utilities for Transellia"
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  show           Show current admin user information"
    echo "  init           Initialize admin user from environment variables"
    echo "  reset-password <password>  Reset admin password"
    echo "  check-env      Check environment configuration"
    echo "  help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 show"
    echo "  $0 init"
    echo "  $0 reset-password MyNewSecurePassword123!"
    echo "  $0 check-env"
    echo ""
    echo "Note: Docker services must be running for most commands"
}

# Main script logic
case "$1" in
    "show")
        show_admin
        ;;
    "init")
        init_admin
        ;;
    "reset-password")
        reset_admin_password "$2"
        ;;
    "check-env")
        check_env
        ;;
    "help"|"--help"|"-h"|"")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac