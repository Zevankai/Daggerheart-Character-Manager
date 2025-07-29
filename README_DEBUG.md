# ZEVI Character Sheet - Debug Instructions

## Loading Loop Fix - Testing Guide

The infinite loading loop between `landing.html` and `index.html` has been fixed. Here's how to test:

### Debug URLs for Testing

1. **Debug Page**: `http://localhost:8000/debug.html`
   - View and clear storage contents
   - Test character creation
   - Navigate between pages safely

2. **Landing Page with Clear**: `http://localhost:8000/landing.html?clear=1`
   - Clears all ZEVI data when loading
   - Starts with a clean slate

3. **Main Page with Clear**: `http://localhost:8000/index.html?clear=1`
   - Clears all ZEVI data and stays on the page
   - Good for testing the main page without redirects

4. **Debug Mode**: Add `?debug=1` to any URL for extra console logging

### Testing Scenarios

#### Scenario 1: Fresh Start (No Characters)
1. Visit `http://localhost:8000/landing.html?clear=1`
2. Should show landing page with "No Characters" button disabled
3. Click "Create New Character" - should work without loops

#### Scenario 2: Existing Character
1. Use debug page to create a test character
2. Visit `http://localhost:8000/landing.html`
3. Should auto-redirect to main app with character loaded
4. No infinite loop should occur

#### Scenario 3: Invalid Character Data
1. Use debug page to create invalid character data
2. Visit either page - should clean up gracefully
3. Should redirect to landing page without loops

### What Was Fixed

1. **Redirect Guards**: Added `sessionStorage` guards to prevent rapid redirects
2. **Timing Issues**: Fixed race conditions between character manager and page initialization
3. **Script Loading Order**: Moved character manager to load before other scripts
4. **Page-Specific Logic**: Character manager only runs auto-redirect on landing page
5. **Error Handling**: Better cleanup of invalid character data

### Console Logging

Open browser dev tools to see detailed logging:
- `=== LANDING.HTML: Page loaded ===`
- `=== CHARACTER MANAGER: DOMContentLoaded called ===`
- `=== INDEX.HTML: Initializing page ===`

Look for redirect guard messages and character lookup results.

### If Issues Persist

1. Clear all browser data for localhost:8000
2. Visit `http://localhost:8000/debug.html`
3. Click "Clear All Storage"
4. Try the test scenarios above
5. Check console for any error messages

The application should now load without infinite redirects!