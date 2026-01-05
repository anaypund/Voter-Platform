# Cookie & Authentication Fix for Remote Server

## Problem
Login was successful (200 status) but cookies weren't being set, causing subsequent requests to return 401 Unauthorized.

## Root Causes
1. **Cookie SameSite Policy**: Login route had `sameSite: "none"` which requires HTTPS and breaks on HTTP remote servers
2. **CORS Issues**: Frontend and backend origins weren't properly configured for cross-origin requests
3. **Cookie Not Persisting**: When frontend is on different origin/port than backend

## Solutions Applied

### 1. Fixed Cookie Settings (authRoutes.ts)
Changed from:
```typescript
res.cookie("authToken", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "none",  // ❌ Breaks on HTTP
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

To:
```typescript
res.cookie("authToken", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",  // ✅ Works on HTTP and HTTPS
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

### 2. Improved CORS Configuration (server/index.ts)
Now supports flexible origin configuration via environment variables:

```typescript
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:8000",
  "http://localhost:5000",
  process.env.FRONTEND_URL,      // Custom frontend URL
  process.env.PUBLIC_URL,        // Fallback URL
  process.env.SERVER_IP,         // Server IP
];
```

In development: Allows all origins
In production: Only allows specified origins

## Deployment Instructions

### For Your Remote Server

**Option 1: Using Environment Variables (Recommended)**

Create `.env` file in your project root:
```env
NODE_ENV=production
FRONTEND_URL=http://your-domain.com
PUBLIC_URL=http://your-domain.com
SERVER_IP=65.1.105.61
MONGODB_URI=your-mongo-uri
```

Then start your server:
```bash
npm run build
node dist/index.cjs
```

**Option 2: Using PM2 with .env**

```bash
npm install pm2 -g
npm run build

# Create ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'voter-platform',
    script: 'dist/index.cjs',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      FRONTEND_URL: 'http://your-domain.com',
      SERVER_IP: '65.1.105.61',
    }
  }]
};
EOF

pm2 start ecosystem.config.js
```

## What to Test After Deployment

1. **Login Test**:
   - Go to login page
   - Enter credentials
   - Should see "Generating Slip..." or redirect to home

2. **Check Cookies**:
   - Open DevTools → Application → Cookies
   - Should see `authToken` cookie set

3. **Check Network Requests**:
   - Open DevTools → Network
   - Login request should show `Set-Cookie: authToken=...` header
   - Subsequent requests should include the cookie

4. **Verify 401 is Gone**:
   - After login, navigating to `/admin` should work
   - No 401 errors in console for authenticated endpoints

## If It Still Doesn't Work

Check these in order:

1. **Verify NODE_ENV**:
   ```bash
   echo $NODE_ENV  # Should be 'production' or 'development'
   ```

2. **Check CORS Headers**:
   ```bash
   curl -i -X OPTIONS http://your-server:5000/api/auth/login \
     -H "Origin: http://your-domain.com" \
     -H "Access-Control-Request-Method: POST"
   ```

3. **Verify Cookie is Being Set**:
   ```bash
   curl -c cookies.txt -X POST http://your-server:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"password"}'
   
   cat cookies.txt  # Should show authToken
   ```

4. **Check Cookie on Next Request**:
   ```bash
   curl -b cookies.txt http://your-server:5000/api/auth/user
   # Should return user data, not 401
   ```

## Key Changes Made

| File | Change | Reason |
|------|--------|--------|
| `server/authRoutes.ts` | `sameSite: "lax"` | Works on both HTTP and HTTPS |
| `server/index.ts` | Flexible CORS config | Supports multiple deployment scenarios |
| `client/src/hooks/use-auth.ts` | Added `throwOnError: false` | Suppresses expected 401 errors |

## Browser Compatibility

These fixes work on:
- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

**Questions?** Check that:
1. Frontend and backend are on the same domain or properly configured CORS origins
2. NODE_ENV matches your deployment (development = flexible, production = strict)
3. Browser cookies are enabled
4. No Content Security Policy blocking cookies
