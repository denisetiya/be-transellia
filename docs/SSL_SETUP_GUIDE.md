# SSL Setup and Auto-Renewal Guide for Transellia

This guide explains how to set up HTTPS with automatic SSL certificate renewal for the Transellia backend application using Nginx as a reverse proxy and Let's Encrypt for SSL certificates.

## Overview

The SSL setup includes:
- Nginx reverse proxy for HTTPS termination
- Let's Encrypt SSL certificates with automatic renewal
- Security headers and rate limiting
- HTTP to HTTPS redirection

## Prerequisites

1. **Domain Name**: You need a domain name pointing to your server's IP address
2. **Server Access**: SSH access to the server with sudo privileges
3. **Docker and Docker Compose**: Installed on the server
4. **Port Access**: Ports 80 and 443 must be open on the server firewall

## Setup Instructions

### 1. Configure Environment Variables

Copy the SSL environment template and update it with your values:

```bash
cp .env.ssl.example .env.ssl
```

Edit `.env.ssl` and update at least these values:
- `DOMAIN`: Your domain name (e.g., transellia.com)
- `EMAIL`: Your email address for Let's Encrypt notifications

### 2. Initialize SSL Certificates

Run the SSL initialization script:

```bash
# Make the script executable
chmod +x scripts/init-ssl.sh

# Run the initialization
./scripts/init-ssl.sh
```

This script will:
1. Create necessary directories for certificates
2. Generate a temporary self-signed certificate
3. Start Nginx with the temporary certificate
4. Request a Let's Encrypt certificate
5. Restart Nginx with the new certificate

### 3. Start the Application

After SSL initialization, start the full application stack:

```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps
```

### 4. Verify HTTPS Setup

1. **Check HTTP to HTTPS redirect**:
   ```bash
   curl -I http://your-domain.com
   ```
   You should see a 301 redirect to HTTPS.

2. **Check HTTPS access**:
   ```bash
   curl -I https://your-domain.com
   ```
   You should see a 200 OK response.

3. **Check SSL certificate**:
   ```bash
   openssl s_client -connect your-domain.com:443 -servername your-domain.com
   ```

## File Structure

```
├── nginx/
│   └── nginx.conf              # Nginx configuration with SSL settings
├── certbot/
│   ├── conf/                   # Let's Encrypt certificates
│   └── www/                    # ACME challenge directory
├── scripts/
│   ├── init-ssl.sh            # SSL initialization script
│   └── renew-ssl.sh           # Manual SSL renewal script
├── .env.ssl.example           # SSL environment variables template
└── docker-compose.yml         # Updated with Nginx and Certbot services
```

## Automatic Renewal

SSL certificates are automatically renewed by the certbot service that runs continuously in the background. The renewal process:

1. **Check frequency**: Every 12 hours
2. **Renewal threshold**: 30 days before expiration
3. **Auto-restart**: Nginx is automatically restarted after renewal

### Manual Renewal

If you need to manually renew certificates:

```bash
# Make the script executable
chmod +x scripts/renew-ssl.sh

# Run manual renewal
./scripts/renew-ssl.sh
```

## Security Features

### SSL Configuration

- **Protocols**: TLSv1.2 and TLSv1.3 only
- **Ciphers**: Strong cipher suites
- **Certificate**: 4096-bit RSA key

### Security Headers

- **X-Frame-Options**: DENY
- **X-Content-Type-Options**: nosniff
- **X-XSS-Protection**: "1; mode=block"
- **Strict-Transport-Security**: HSTS with 1-year max age

### Rate Limiting

- **API endpoints**: 10 requests per second
- **Burst capacity**: 20 requests
- **Protection**: Against DDoS and brute force attacks

## Troubleshooting

### Common Issues

1. **Domain not reachable**:
   - Ensure your domain DNS A record points to the server IP
   - Check firewall settings for ports 80 and 443

2. **Certificate issuance failed**:
   - Check if domain is properly configured
   - Verify Nginx is running and accessible
   - Check certbot logs: `docker-compose logs certbot`

3. **Certificate not renewing**:
   - Check certbot service status: `docker-compose ps certbot`
   - Verify renewal logs: `docker-compose logs certbot`
   - Run manual renewal: `./scripts/renew-ssl.sh`

### Useful Commands

```bash
# Check certificate expiration
docker-compose run --rm --entrypoint "certbot certificates" certbot

# Check Nginx configuration
docker-compose exec nginx nginx -t

# Reload Nginx configuration
docker-compose exec nginx nginx -s reload

# View SSL certificate details
docker-compose run --rm --entrypoint 'openssl x509 -in /etc/letsencrypt/live/transellia.com/cert.pem -text -noout' certbot

# Check certbot logs
docker-compose logs certbot

# Check Nginx logs
docker-compose logs nginx
```

## Monitoring and Maintenance

### Certificate Monitoring

Monitor certificate expiration with:

```bash
# Check certificate expiration date
openssl x509 -in certbot/conf/live/transellia.com/cert.pem -noout -dates

# Set up cron job for monitoring (optional)
0 9 * * 1 /path/to/scripts/check-ssl-expiration.sh
```

### Log Monitoring

Monitor important logs:

```bash
# Follow Nginx access logs
docker-compose logs -f nginx

# Follow certbot logs
docker-compose logs -f certbot
```

## Backup and Recovery

### Backup Certificates

```bash
# Create backup directory
mkdir -p backups/ssl

# Backup certificates
tar -czf backups/ssl/certbot-$(date +%Y%m%d).tar.gz certbot/
```

### Recovery

```bash
# Restore certificates
tar -xzf backups/ssl/certbot-YYYYMMDD.tar.gz

# Restart services
docker-compose restart nginx certbot
```

## Production Considerations

1. **Email Notifications**: Ensure the email address is valid for renewal notifications
2. **Monitoring**: Set up monitoring for certificate expiration
3. **Backup**: Regularly backup certificates and configuration
4. **Testing**: Test renewal process in staging environment first

## Support

For issues with:
- **Let's Encrypt**: Check https://letsencrypt.org/docs/
- **Nginx**: Check https://nginx.org/en/docs/
- **Docker**: Check https://docs.docker.com/

## Security Best Practices

1. Regularly update Docker images
2. Monitor security advisories
3. Use strong passwords for all services
4. Implement proper access controls
5. Regular security audits