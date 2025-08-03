# Save Function Troubleshooting Guide

## Overview
This guide helps you troubleshoot issues with the save function in your Vercel + Neon integration.

## Common Issues and Solutions

### 1. Environment Variables Not Set
**Problem**: Database connection fails or authentication doesn't work.

**Solution**: Set up your environment variables:

#### For Local Development:
Create a `.env.local` file in your project root:
```bash
DATABASE_URL=postgresql://username:password@host.neon.tech/database_name?sslmode=require
JWT_SECRET=your-super-secure-jwt-secret-key-here
RESEND_API_KEY=your-resend-api-key
```

#### For Vercel Production:
Set these in your Vercel dashboard:
1. Go to your project in Vercel
2. Navigate to Settings → Environment Variables
3. Add each variable:
   - `DATABASE_URL`: Your Neon database connection string
   - `JWT_SECRET`: A secure random string
   - `RESEND_API_KEY`: Your Resend API key (optional)

### 2. Database Connection Issues
**Problem**: "DATABASE_URL environment variable is not set" or connection errors.

**Solution**:
1. Verify your Neon database is active
2. Check your connection string format:
   ```
   postgresql://username:password@host.neon.tech/database_name?sslmode=require
   ```
3. Ensure the database tables exist (they should be created automatically)

### 3. Authentication Issues
**Problem**: Save fails with 401 errors.

**Solution**:
1. Make sure you're logged in
2. Check that the JWT token is valid
3. Verify the token is being sent in the Authorization header

### 4. API Endpoint Issues
**Problem**: 404 errors when trying to save.

**Solution**:
1. Ensure your Vercel deployment is working
2. Check that the API routes are properly configured
3. Verify the `vercel.json` file is present

## Debugging Steps

### Step 1: Check Environment Variables
```bash
# For local development
echo $DATABASE_URL
echo $JWT_SECRET

# For Vercel
vercel env ls
```

### Step 2: Test API Health
```bash
curl https://your-app.vercel.app/api/health
```

### Step 3: Test Authentication
```bash
# Login
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}'
```

### Step 4: Test Save Function
Use the provided test script:
```bash
npm install
TEST_EMAIL=your@email.com TEST_PASSWORD=yourpassword node test-save.js
```

### Step 5: Check Browser Console
1. Open your app in the browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. Try to save a character
5. Look for error messages with 🔄, ❌, or 📡 emojis

## Common Error Messages

### "DATABASE_URL environment variable is not set"
- Set the DATABASE_URL environment variable
- Restart your development server

### "Authentication required. Please log in again."
- Log out and log back in
- Check if your JWT token has expired

### "Character not found"
- The character ID doesn't exist
- The character doesn't belong to the current user

### "Failed to update character"
- Check the server logs for detailed error information
- Verify the character data format

## Testing the Save Function

### Manual Testing:
1. Log into your app
2. Create or load a character
3. Make some changes to the character
4. Click the save button
5. Check the browser console for success/error messages

### Automated Testing:
Use the provided test script:
```bash
node test-save.js
```

## Getting Help

If you're still having issues:

1. **Check the logs**: Look at both browser console and server logs
2. **Test the API directly**: Use the test script or curl commands
3. **Verify your setup**: Ensure all environment variables are set
4. **Check your Neon database**: Verify the connection and table structure

## Recent Fixes Applied

1. **Fixed SQL query syntax**: Updated the updateCharacter function to use proper Neon serverless syntax
2. **Added comprehensive logging**: Added detailed console logs to help debug issues
3. **Created test script**: Added a test script to verify API functionality
4. **Added Vercel configuration**: Created vercel.json for proper API routing

## Next Steps

1. Set up your environment variables
2. Deploy to Vercel
3. Test the save function
4. Check the logs for any remaining issues