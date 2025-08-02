# Testing Guide: Zevi Character Sheet Web Application

This guide helps you test the complete transformation from a local-only character sheet to a full-featured web application with cloud storage.

## Prerequisites

Before testing, ensure:

1. **Vercel Deployment**: Your GitHub repository is connected to Vercel and deployed
2. **Neon Database**: Your Neon database is set up and connected to Vercel
3. **Environment Variables**: Set these in your Vercel dashboard:
   - `DATABASE_URL`: Your Neon database connection string
   - `JWT_SECRET`: A secure random string for JWT token signing

## Testing Checklist

### ✅ 1. Basic Application Load

1. Visit your deployed Vercel URL
2. **Expected**: Character sheet loads normally
3. **Check**: No console errors in browser dev tools
4. **Verify**: All existing functionality works (character creation, stats, etc.)

### ✅ 2. Authentication System

#### Register New User
1. Look for the user menu in the top-right corner (should be hidden when not logged in)
2. Click any "💾" save button or attempt to save character data
3. **Expected**: Authentication modal appears
4. Click "Register" tab
5. Fill out the form:
   - Username: `testuser`
   - Email: `test@example.com` 
   - Password: `password123`
   - Confirm Password: `password123`
6. Click "Register"
7. **Expected**: Success message appears
8. **Verify**: Modal switches to login tab automatically

#### Login
1. In the login tab, enter:
   - Email: `test@example.com`
   - Password: `password123`
2. Click "Login"
3. **Expected**: Success message, then modal closes
4. **Check**: User menu appears in top-right showing username
5. **Verify**: Save buttons now show "☁️💾" (cloud save icon)

### ✅ 3. Character Cloud Storage

#### Create Character in Cloud
1. While logged in, modify character data (name, stats, equipment, etc.)
2. Click any save button
3. **Expected**: Console shows "Character data saved to cloud"
4. **Check**: No error messages
5. Refresh the page
6. **Expected**: All data persists after refresh

#### Verify Database Storage
1. Open browser dev tools → Network tab
2. Modify character data and save
3. **Check**: Network requests to `/api/characters/` endpoints
4. **Verify**: Responses show 200 status codes

### ✅ 4. Data Migration

#### Test Local Data Migration
1. Log out (click username → Logout)
2. Clear all localStorage data:
   ```javascript
   // In browser console:
   Object.keys(localStorage).forEach(key => {
     if (key.startsWith('zevi-')) localStorage.removeItem(key);
   });
   ```
3. Create some local character data (modify stats, add equipment, etc.)
4. Save the data (will save to localStorage)
5. Log back in with your test account
6. **Expected**: Migration prompt appears asking to import local data
7. Click "OK" to migrate
8. **Expected**: Success message and page refresh
9. **Verify**: Your local character data now appears in the cloud-saved character

### ✅ 5. Character Management

#### View Character List
1. While logged in, click username → "My Characters"
2. **Expected**: Modal/alert showing all your saved characters
3. **Check**: Shows character names, creation dates, and update dates
4. **Verify**: Shared characters show "🔗 Shared" indicator

#### Multiple Characters
1. Create multiple characters by refreshing and modifying data
2. Save each character
3. **Check**: Each character gets a unique ID and saves separately
4. **Verify**: Character list shows all characters

### ✅ 6. Character Sharing (Advanced Feature)

This requires custom implementation but the API is ready:

```javascript
// In browser console, to share a character:
zeviAPI.shareCharacter('character-id', true)
  .then(response => {
    console.log('Share token:', response.character.share_token);
    // Share this URL: yoursite.com/?share=<token>
  });
```

### ✅ 7. Offline Functionality

#### Test Fallback to localStorage
1. While logged in, open dev tools → Network tab
2. Set network to "Offline" mode
3. Modify character data and save
4. **Expected**: Console shows "Cloud save failed, falling back to localStorage"
5. **Check**: Data still saves locally
6. Re-enable network
7. Save again
8. **Expected**: Data syncs back to cloud

### ✅ 8. Error Handling

#### Test Invalid Credentials
1. Log out
2. Try to login with wrong password
3. **Expected**: Error message "Invalid email or password"
4. **Check**: No console errors

#### Test Duplicate Registration
1. Try to register with the same email again
2. **Expected**: Error message "Email already exists"

#### Test Network Errors
1. While logged in, block network requests to your domain
2. Try to save character data
3. **Expected**: Graceful fallback to localStorage
4. **Check**: User can continue working offline

## Performance Testing

### Load Times
- **Initial Load**: Should be < 3 seconds
- **Authentication**: Login/register should be < 2 seconds  
- **Character Save**: Should be < 1 second
- **Data Migration**: Should complete < 5 seconds

### Database Performance
- **Character List**: Should load instantly for < 100 characters
- **Auto-save**: Should not cause noticeable lag
- **Concurrent Users**: Multiple users should not interfere

## Troubleshooting

### Common Issues

1. **"DATABASE_URL environment variable is not set"**
   - Solution: Set DATABASE_URL in Vercel environment variables

2. **"Authentication required. Please log in again"**
   - Solution: JWT token expired, user needs to log in again

3. **Network errors in console**
   - Check: Vercel function deployment status
   - Verify: API endpoints are accessible

4. **Data not saving to cloud**
   - Check: User is logged in (look for cloud icon on save buttons)
   - Verify: Network requests in dev tools

### Debug Information

Access debug info in browser console:
```javascript
// Check authentication status
console.log('Logged in:', zeviAPI.isLoggedIn());

// Check current user
console.log('Current user:', localStorage.getItem('zevi-current-user'));

// Test API connectivity
zeviAPI.getCharacters()
  .then(data => console.log('Characters:', data))
  .catch(err => console.error('API Error:', err));
```

## Success Criteria

The transformation is successful when:

- ✅ Users can register and log in
- ✅ Character data saves to cloud when logged in
- ✅ Data persists across sessions and devices
- ✅ Local data can be migrated to cloud accounts
- ✅ Application gracefully falls back to localStorage when offline
- ✅ All original functionality remains intact
- ✅ No breaking changes for existing users

## Next Steps

After successful testing:

1. **Documentation**: Update README with new features
2. **User Guide**: Create guides for registration and data migration
3. **Monitoring**: Set up error tracking and analytics
4. **Backup**: Implement database backup procedures
5. **Security**: Review and audit authentication implementation

---

🎉 **Congratulations!** You've successfully transformed a local character sheet into a full-featured web application with persistent cloud storage, user authentication, and character sharing capabilities!