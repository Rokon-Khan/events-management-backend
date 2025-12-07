# Troubleshooting Guide

## JWT Malformed Error Fix

### Problem
Getting "jwt malformed" error when accessing `/user/me` or `/user/update-my-profile` endpoints.

### Root Cause
The auth middleware was not stripping the "Bearer " prefix from the Authorization header.

### Solution Applied
Updated `auth.middleware.ts` to properly handle Bearer token format:

```typescript
// Strip "Bearer " prefix if present
if (token && token.startsWith("Bearer ")) {
  token = token.substring(7);
}
```

### How to Use in Postman

1. **After Login**, copy the `accessToken` from response
2. **Set Token Variable**:
   - Go to Collection Variables
   - Set `token` = `your_access_token_here` (without "Bearer ")
   
3. **Authorization Header Format**:
   - Key: `Authorization`
   - Value: `Bearer {{token}}`

### Example

**Login Response:**
```json
{
  "success": true,
  "message": "Logged in successfully!",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Set in Postman:**
- Variable `token` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Header: `Authorization: Bearer {{token}}`

---

## Pino Logger Configuration

### Features Implemented

✅ **Pretty Logging** - Colorized console output
✅ **HTTP Request Logging** - Automatic request/response logging
✅ **Error Logging** - Structured error logs
✅ **Info Logging** - Application events

### Logger Usage

```typescript
import logger from "./app/utils/logger";

// Info logs
logger.info("Server started successfully");

// Error logs
logger.error("Database connection failed", error);

// Debug logs
logger.debug("Processing user data", { userId: "123" });

// Warn logs
logger.warn("High memory usage detected");
```

### Log Levels

- `error` - Error messages
- `warn` - Warning messages
- `info` - Informational messages (default)
- `debug` - Debug messages
- `trace` - Trace messages

### Environment Configuration

Add to `.env`:
```env
LOG_LEVEL=info
```

Available levels: `trace`, `debug`, `info`, `warn`, `error`, `fatal`

### Log Output Example

```
[2024-01-01 10:00:00] INFO: 🚀 Event Management Server is running on http://localhost:5000
[2024-01-01 10:00:01] INFO: Event status scheduler started (runs every 60 seconds)
[2024-01-01 10:00:15] INFO: GET /api/v1/user/me 200 45ms
[2024-01-01 10:01:00] INFO: Event statuses updated: 3 events closed
```

---

## Common Issues

### 1. Token Not Working

**Symptoms:**
- "jwt malformed" error
- "You are not authorized!" error

**Solutions:**
- Ensure token is set in Postman variables
- Check Authorization header format: `Bearer {{token}}`
- Verify token hasn't expired (24 hours default)
- Re-login to get fresh token

### 2. Cookie vs Header Authentication

**Auth Endpoints (`/auth/*`):**
- Use cookies automatically
- No Authorization header needed for `/auth/me`

**Other Endpoints (`/user/*`, `/event/*`, etc.):**
- Require Authorization header
- Format: `Bearer {{token}}`

### 3. CORS Issues

**Allowed Origins:**
- `http://localhost:5173`
- `http://localhost:3000`
- `http://localhost:3001`

**Add New Origin:**
Edit `src/app.ts`:
```typescript
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3001",
  "https://your-frontend-domain.com", // Add here
];
```

### 4. Database Connection

**Error:** "Can't reach database server"

**Solutions:**
- Check PostgreSQL is running
- Verify DATABASE_URL in `.env`
- Run migrations: `npm run migrate`
- Check database credentials

### 5. File Upload Issues

**Error:** "File upload failed"

**Solutions:**
- Check Cloudinary credentials in `.env`
- Verify file size (max 10MB)
- Ensure Content-Type is `multipart/form-data`
- Check file field name matches (`profilePhoto`, `eventImage`)

---

## Testing Checklist

### Authentication Flow
- [ ] Register user
- [ ] Verify email with OTP
- [ ] Login successfully
- [ ] Copy accessToken
- [ ] Set token in Postman variable
- [ ] Access protected routes

### User Profile
- [ ] Get my profile (`/user/me`)
- [ ] Update profile with data
- [ ] Upload profile photo
- [ ] Verify changes

### Event Management
- [ ] Create event (as HOST)
- [ ] Get all events
- [ ] Get event by ID
- [ ] Update event
- [ ] Participate in event

### Review System
- [ ] Create review for host
- [ ] Get host statistics
- [ ] Update review
- [ ] View all reviews

### Payment
- [ ] Create payment
- [ ] Get payment details
- [ ] Admin update status
- [ ] View all payments

---

## Quick Fixes

### Reset Everything
```bash
# Stop server
# Drop database
npm run migrate:reset

# Restart server
npm run dev
```

### Clear Cookies
```bash
# In Postman, send request to:
POST {{baseUrl}}/auth/logout
```

### Regenerate Prisma Client
```bash
npm run prisma:generate
```

### View Logs
Logs are automatically displayed in console with Pino pretty formatting.

---

## Support

If issues persist:
1. Check server logs for detailed errors
2. Verify all environment variables are set
3. Ensure all dependencies are installed
4. Check database migrations are up to date
5. Review API documentation

---

## Status: ✅ FIXED

- JWT malformed error resolved
- Pino logger configured
- All endpoints working correctly
