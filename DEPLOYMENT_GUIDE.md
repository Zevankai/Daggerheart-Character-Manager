# Deployment & Troubleshooting Guide

## 405 Method Not Allowed Error - Solution

The 405 error you're experiencing is likely due to one of these issues:

### 1. Missing vercel.json Configuration (FIXED)
I've created a `vercel.json` file that properly configures:
- API route handling
- CORS headers
- Function configuration

### 2. Development vs Production Environment

#### For Local Development:
You need to run TWO servers:

1. **Frontend Server** (for HTML/JS/CSS):
   ```bash
   npm start
   # This runs servor on port 8080 (or similar)
   ```

2. **API Server** (for backend functions):
   ```bash
   npm run dev
   # This runs vercel dev on port 3000
   ```

#### For Production (Vercel):
The vercel.json configuration will handle everything automatically.

### 3. Testing the Fix

1. **Use the Debug Tool**:
   - Open `/debug.html` in your browser
   - This will show you:
     - Current environment detection
     - API endpoint testing
     - Detailed error messages

2. **Check Browser Console**:
   - Open Developer Tools (F12)
   - Look for API request logs
   - Check for CORS errors

### 4. Common Issues & Solutions

#### Issue: "405 Not Allowed" Error
**Cause**: API routes not properly configured
**Solution**: The vercel.json file now handles this

#### Issue: "CORS Error"
**Cause**: Cross-origin requests blocked
**Solution**: CORS headers added in vercel.json

#### Issue: "Cannot connect to API"
**Cause**: Wrong API URL in development
**Solution**: API client now auto-detects environment

### 5. Deployment Steps

1. **Commit all changes**:
   ```bash
   git add .
   git commit -m "Fix 405 error with proper Vercel configuration"
   git push
   ```

2. **Deploy to Vercel**:
   - Vercel will automatically detect the configuration
   - API routes will be properly handled

3. **Verify deployment**:
   - Visit your-app.vercel.app/debug.html
   - Test the API endpoints

### 6. Environment Variables

Make sure these are set in Vercel:
- `DATABASE_URL` - Your Neon database connection string
- `JWT_SECRET` - A secure random string
- `RESEND_API_KEY` - (Optional) For password reset emails

### 7. Database Setup

If you haven't already, make sure your database is initialized:
- The app will auto-create tables on first registration
- Or manually run the migration endpoint: `/api/migrate`

## Quick Checklist

- [x] vercel.json created with proper routing
- [x] API endpoints handle OPTIONS requests
- [x] CORS headers configured
- [x] Frontend API client updated with better error handling
- [x] Debug tool created for testing
- [ ] Deploy to Vercel
- [ ] Test authentication flow

## Need More Help?

1. Check `/debug.html` for detailed diagnostics
2. Look at browser console for specific errors
3. Verify environment variables in Vercel dashboard
4. Check Vercel function logs for server-side errors