# Vercel Deployment Checklist

## Pre-Deployment Setup

### 1. Environment Variables
Ensure all required environment variables are set in Vercel Dashboard:

**Required:**
- `MONGODB_URI` - MongoDB connection string (use MongoDB Atlas for cloud)
- `JWT_SECRET` - Secret key for JWT token generation
- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret
- `NODE_ENV` - Set to `production`

**Optional:**
- `CLIENT_ORIGIN` - Frontend URL for CORS
- `ADMIN_PANEL_ORIGIN` - Admin panel URL for CORS
- `PORT` - Not needed (Vercel handles this automatically)

### 2. MongoDB Setup
- Use MongoDB Atlas for cloud deployment
- Whitelist Vercel IPs (or use 0.0.0.0/0 for all IPs in development)
- Ensure connection string is correct

### 3. Cloudinary Setup
- Verify Cloudinary credentials are correct
- Ensure upload settings allow the file sizes you need

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel will automatically detect `vercel.json`
4. Add environment variables in project settings
5. Click "Deploy"

### Option 2: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

## Post-Deployment

### 1. Verify Deployment
- Check health endpoint: `https://your-project.vercel.app/health`
- Test API endpoints
- Verify database connection

### 2. Test API Endpoints
```bash
# Health check
curl https://your-project.vercel.app/health

# Test public endpoint
curl https://your-project.vercel.app/api/public/wallpapers
```

### 3. Monitor Logs
- Check Vercel dashboard for function logs
- Monitor database connections
- Watch for any errors

## Important Notes

### File Upload Limitations
- Vercel serverless functions have a 4.5MB request body limit
- For larger uploads (up to 200MB), consider:
  - Direct client-side uploads to Cloudinary using signed URLs
  - Using Vercel Blob storage for temporary storage
  - Implementing chunked uploads

### Database Connections
- Database connections are cached across function invocations
- Connections are optimized for serverless (single connection pool)
- Connection errors are automatically retried

### Scheduled Tasks
- Cron jobs (`node-cron`) don't work in serverless functions
- Use [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) for scheduled tasks
- Or use external scheduler services (e.g., EasyCron, cron-job.org)

### Cold Starts
- First request after inactivity may be slower (cold start)
- Database connection is initialized on cold start
- Subsequent requests in the same container are faster (warm start)

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify MongoDB URI is correct
   - Check MongoDB Atlas IP whitelist
   - Verify network connectivity

2. **Environment Variables Not Set**
   - Check Vercel dashboard for environment variables
   - Ensure variables are set for correct environment (Production/Preview)
   - Redeploy after adding variables

3. **CORS Errors**
   - Verify `CLIENT_ORIGIN` and `ADMIN_PANEL_ORIGIN` are set correctly
   - Check CORS configuration in `src/app.ts`

4. **File Upload Errors**
   - Check file size limits
   - Verify Cloudinary credentials
   - Check multer configuration

5. **Function Timeout**
   - Default timeout is 10 seconds (Hobby plan)
   - Pro plan allows up to 60 seconds
   - Current configuration allows 30 seconds max duration

## API Endpoints After Deployment

- `https://your-project.vercel.app/health` - Health check
- `https://your-project.vercel.app/api/public/*` - Public endpoints
- `https://your-project.vercel.app/api/auth/*` - Authentication endpoints
- `https://your-project.vercel.app/api/admin/*` - Admin endpoints (requires JWT)

## Next Steps

1. Set up custom domain (optional)
2. Configure Vercel Cron Jobs for scheduled tasks
3. Set up monitoring and alerts
4. Implement direct Cloudinary uploads for large files
5. Set up CI/CD pipeline for automatic deployments

