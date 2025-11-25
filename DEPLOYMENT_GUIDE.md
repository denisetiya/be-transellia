# Vercel Deployment Guide - Prisma Version

This guide provides instructions for deploying the Transellia backend to Vercel using Prisma ORM and troubleshooting database connection issues.

## Environment Variables

Make sure to set these environment variables in your Vercel dashboard:

### Required Environment Variables

```
NODE_ENV=production
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_SUPABASE_URL:5432/postgres
SALT=transellia-salt-2024-OI&*&#*&*IIIJIiyyttd+_00aefkajhfQUJEIUJDLAKJlkdkadwlk%$#@*
API_KEY=qzD75kD1AUM04R2FQBbNJZPoLP1ARPtkdt9VCtLc3QghLe5rAQ
JWT_SECRET=oijuwudoiay8917276&^%#@#jhgadgiuwjncjhbiwjhduyg>jlojo\[[]]
```

### Optional Environment Variables

```
MIDTRANS_SERVER_KEY=your-midtrans-server-key-prod
MIDTRANS_CLIENT_KEY=your-midtrans-client-key-prod
FIREBASE_PROJECT_ID=your-firebase-project-id-prod
FIREBASE_CLIENT_EMAIL=your-firebase-client-email-prod
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_PROD\n-----END PRIVATE KEY-----
CORS_ORIGINS=https://your-frontend-domain.com
```

## Prisma Configuration for Vercel

The application has been optimized for Vercel's serverless environment using Prisma:

1. **Prisma Client**: Uses Prisma Client v5.22.0 for better serverless compatibility
2. **Connection Management**: Prisma automatically handles connection pooling for serverless environments
3. **Query Optimization**: Prisma's query engine is optimized for serverless functions
4. **Error Handling**: Enhanced error logging and handling for better debugging
5. **Type Safety**: Full TypeScript support with generated types

## Database Connection Configuration

The Prisma configuration uses the DATABASE_URL environment variable directly:

```typescript
// src/config/prisma.config.ts
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
```

## Migration from Drizzle to Prisma

### Key Changes Made:
1. **Schema Migration**: Converted Drizzle schema to Prisma schema (`prisma/schema.prisma`)
2. **Service Layer Migration**: Updated all service files to use Prisma client instead of Drizzle
3. **Configuration**: Replaced Drizzle config with Prisma client configuration
4. **Dependencies**: Updated package.json to use Prisma instead of Drizzle

### Benefits of Prisma over Drizzle for Vercel:
- **Better Serverless Support**: Prisma is designed for serverless environments
- **Automatic Connection Management**: No need to manually manage connection pools
- **Type Safety**: Generated TypeScript types provide better IntelliSense and error prevention
- **Query Optimization**: Prisma's query engine is optimized for cold starts
- **Simplified API**: More intuitive and consistent API compared to Drizzle

## Troubleshooting Database Issues

### Common Issues and Solutions

#### 1. "Database connection failed" Error

**Symptoms:**
- Login attempts fail with database connection errors
- API returns 500 errors

**Solutions:**
- Verify `DATABASE_URL` is correctly set in Vercel environment variables
- Check if the database is accessible from Vercel's network
- Ensure SSL is properly configured for your database
- Check Prisma schema matches database structure

#### 2. "Query timeout" Error

**Symptoms:**
- Requests take too long to respond
- Database queries timeout

**Solutions:**
- Check database performance
- Verify network connectivity
- Consider optimizing database queries
- Use Prisma's query logging to debug slow queries

#### 3. "Prisma schema validation" Error

**Symptoms:**
- Build fails with schema validation errors
- Generated client has type errors

**Solutions:**
- Run `pnpm prisma validate` to check schema
- Ensure database URL is accessible
- Check for syntax errors in `prisma/schema.prisma`
- Run `pnpm prisma generate` to regenerate client

#### 4. "Foreign key constraint" Error

**Symptoms:**
- User registration fails
- Database constraint violations

**Solutions:**
- Ensure database migrations have been applied
- Check if all required tables exist
- Verify data integrity
- Run `pnpm prisma db push` to sync schema with database

## Deployment Steps

1. **Push your code to GitHub**
2. **Connect your repository to Vercel**
3. **Configure environment variables in Vercel dashboard**
4. **Deploy the application**
5. **Test the deployment**

## Testing the Deployment

After deployment, test these endpoints:

1. **Health Check**: `GET /`
2. **Login**: `POST /auth/login`
3. **Registration**: `POST /auth/register`

## Prisma-Specific Commands

### Development Commands:
```bash
# Generate Prisma client
pnpm prisma generate

# Validate schema
pnpm prisma validate

# Push schema changes to database
pnpm prisma db push

# Create and run migrations
pnpm prisma migrate dev

# Open Prisma Studio
pnpm prisma studio
```

### Production Commands:
```bash
# Generate Prisma client (runs automatically on postinstall)
pnpm prisma generate

# Deploy schema changes (use with caution in production)
pnpm prisma db push
```

## Monitoring and Logs

- Check Vercel function logs for any errors
- Monitor Prisma query performance
- Set up alerts for critical errors
- Use Prisma's built-in query logging in development

## Performance Optimization

The application includes several optimizations for Vercel with Prisma:

1. **Connection Management**: Prisma automatically manages database connections
2. **Query Caching**: Prisma's query engine provides automatic caching
3. **Error Handling**: Comprehensive error logging and handling
4. **Resource Management**: Efficient resource utilization
5. **Type Safety**: Full TypeScript support prevents runtime errors

## Security Considerations

1. **Environment Variables**: Never commit secrets to git
2. **Database Security**: Use SSL connections (handled by Prisma)
3. **API Keys**: Rotate API keys regularly
4. **CORS**: Configure proper CORS origins
5. **Prisma Security**: Use Prisma's built-in security features

## Rollback Procedure

If deployment fails:

1. **Revert to previous commit**
2. **Redeploy to Vercel**
3. **Verify functionality**
4. **Investigate the issue**

## Migration Notes

### From Drizzle to Prisma:
- **Query Syntax**: Drizzle SQL-like syntax → Prisma method calls
- **Type Safety**: Manual types → Generated TypeScript types
- **Connection Management**: Manual → Automatic
- **Error Handling**: Custom → Standardized

### Database Schema:
- The Prisma schema maintains the same structure as the original Drizzle schema
- All tables, relationships, and constraints are preserved
- Enum types are properly mapped to Prisma enums

## Support

For issues related to:
- **Database**: Check your database provider's documentation
- **Vercel**: Check Vercel's documentation and support
- **Prisma**: Check Prisma's documentation and support
- **Application**: Review the application logs and error messages

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Prisma + Vercel Guide](https://www.prisma.io/docs/deployment/deploying-to-vercel)
- [Database Connection Issues](https://www.prisma.io/docs/concepts/database-connections)