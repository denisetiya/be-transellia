# Vercel Deployment Guide

This guide provides instructions for deploying the Transellia backend to Vercel and troubleshooting database connection issues.

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

## Database Connection Configuration

The application has been optimized for Vercel's serverless environment:

1. **Single Connection Mode**: In production, the database uses a single connection to prevent connection pool exhaustion
2. **Connection Timeouts**: Optimized timeout settings for serverless functions
3. **SSL Configuration**: Proper SSL settings for secure database connections
4. **Error Handling**: Enhanced error logging for better debugging

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

#### 2. "Query timeout" Error

**Symptoms:**
- Requests take too long to respond
- Database queries timeout

**Solutions:**
- Check database performance
- Verify network connectivity
- Consider optimizing database queries

#### 3. "Foreign key constraint" Error

**Symptoms:**
- User registration fails
- Database constraint violations

**Solutions:**
- Ensure database migrations have been applied
- Check if all required tables exist
- Verify data integrity

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

## Monitoring and Logs

- Check Vercel function logs for any errors
- Monitor database connection issues
- Set up alerts for critical errors

## Performance Optimization

The application includes several optimizations for Vercel:

1. **Connection Pooling**: Optimized for serverless environments
2. **Error Handling**: Comprehensive error logging and handling
3. **Timeout Management**: Appropriate timeout settings
4. **Resource Management**: Efficient resource utilization

## Security Considerations

1. **Environment Variables**: Never commit secrets to git
2. **Database Security**: Use SSL connections
3. **API Keys**: Rotate API keys regularly
4. **CORS**: Configure proper CORS origins

## Rollback Procedure

If deployment fails:

1. **Revert to previous commit**
2. **Redeploy to Vercel**
3. **Verify functionality**
4. **Investigate the issue**

## Support

For issues related to:
- **Database**: Check your database provider's documentation
- **Vercel**: Check Vercel's documentation and support
- **Application**: Review the application logs and error messages