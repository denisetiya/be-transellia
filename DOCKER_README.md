# Docker Setup for Transellia Backend

This guide explains how to set up and run the Transellia backend using Docker and Docker Compose.

## Prerequisites

- Docker and Docker Compose installed on your system
- Copy of `.docker.example` to `.env` with your environment variables configured

## Quick Start

1. **Setup Environment Variables**
   ```bash
   cp .docker.example .env
   # Edit .env with your actual configuration values
   ```

2. **Start the Services**
   ```bash
   # Start all services (database + backend)
   docker-compose up -d
   
   # View logs
   docker-compose logs -f
   ```

3. **Run Database Migrations**
   ```bash
   # Run migrations (one-time setup)
   docker-compose --profile migrate up migrate
   ```

4. **Access the Application**
   - Backend API: http://localhost:3000
   - Database: localhost:5432

## Services

### PostgreSQL Database
- Container: `transellia-postgres`
- Port: 5432
- Default database: `transellia`
- Data persistence: Enabled via Docker volume

### Backend Application
- Container: `transellia-backend`
- Port: 3000
- Health checks: Enabled
- Automatic restart: Enabled

## Development Workflow

### Starting Development Environment
```bash
# Start with fresh database
docker-compose down -v
docker-compose up -d
docker-compose --profile migrate up migrate
```

### Viewing Logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f postgres
```

### Stopping Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (data loss!)
docker-compose down -v
```

## Environment Variables

Key environment variables that need to be configured in your `.env` file:

- `DATABASE_PASSWORD`: Password for PostgreSQL database
- `API_KEY`: Your API key for authentication
- `SALT`: Salt for password hashing
- `JWT_SECRET`: Secret for JWT token signing
- `FIREBASE_PROJECT_ID`: Firebase project ID
- `FIREBASE_CLIENT_EMAIL`: Firebase service account email
- `FIREBASE_PRIVATE_KEY`: Firebase private key
- `MIDTRANS_SERVER_KEY`: Midtrans server key
- `MIDTRANS_CLIENT_KEY`: Midtrans client key
- `CORS_ORIGINS`: Allowed CORS origins

## Troubleshooting

### Database Connection Issues
1. Check if PostgreSQL is running:
   ```bash
   docker-compose ps postgres
   ```

2. Check PostgreSQL logs:
   ```bash
   docker-compose logs postgres
   ```

3. Test database connection:
   ```bash
   docker-compose exec postgres psql -U postgres -d transellia -c "SELECT version();"
   ```

### Backend Issues
1. Check if backend is running:
   ```bash
   docker-compose ps backend
   ```

2. Check backend logs:
   ```bash
   docker-compose logs backend
   ```

3. Access backend container for debugging:
   ```bash
   docker-compose exec backend sh
   ```

### Migration Issues
1. Run migrations manually:
   ```bash
   docker-compose --profile migrate run --rm migrate pnpm db:migrate
   ```

2. Reset database (WARNING: This will delete all data):
   ```bash
   docker-compose down -v
   docker-compose up -d
   docker-compose --profile migrate up migrate
   ```

## Production Considerations

1. **Security**: Use strong, unique passwords and secrets
2. **Backups**: Implement regular database backups
3. **Monitoring**: Set up monitoring for container health
4. **SSL/TLS**: Configure HTTPS for production
5. **Resource Limits**: Set appropriate memory and CPU limits

## Advanced Usage

### Custom Docker Compose Files
```bash
# Use custom compose file
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Scaling Services
```bash
# Scale backend service (if stateless)
docker-compose up -d --scale backend=3
```

### Running Commands in Containers
```bash
# Run Prisma Studio
docker-compose exec backend pnpm db:studio

# Generate Prisma client
docker-compose exec backend pnpm db:generate

# Create new migration
docker-compose exec backend pnpm db:migrate
```

## File Structure

```
.
├── Dockerfile              # Multi-stage build for the backend
├── docker-compose.yml      # Main compose configuration
├── .docker.example         # Example environment variables
├── .dockerignore          # Files to exclude from Docker build
└── DOCKER_README.md       # This file