# Authentication System Documentation

## Overview

The venue finder CRM uses OAuth-based authentication with JWT tokens for session management. The system supports both Google and Microsoft OAuth providers and implements role-based access control.

## Architecture

- **OAuth Providers**: Google OAuth 2.0 and Microsoft OAuth 2.0
- **Session Management**: JWT tokens with 7-day expiration
- **Authorization**: Role-based access control (Admin, Consultant)
- **Database**: User profiles stored in PostgreSQL via Prisma

## Authentication Flow

1. User clicks login button for Google or Microsoft
2. User is redirected to OAuth provider
3. After successful authentication, user is redirected back with authorization code
4. Server exchanges code for user profile information
5. Server creates or updates user record in database
6. Server generates JWT token and redirects to frontend with token
7. Frontend stores token and uses it for API requests

## API Endpoints

### OAuth Endpoints

- `GET /auth/google` - Initiate Google OAuth flow
- `GET /auth/google/callback` - Handle Google OAuth callback
- `GET /auth/microsoft` - Initiate Microsoft OAuth flow
- `GET /auth/microsoft/callback` - Handle Microsoft OAuth callback

### User Management Endpoints

- `GET /auth/me` - Get current user profile (requires authentication)
- `POST /auth/logout` - Logout user (client-side token removal)
- `POST /auth/refresh` - Refresh JWT token (requires authentication)

## Middleware

### Authentication Middleware

```typescript
import { authenticateToken } from '../lib/auth';

// Protect route with authentication
router.get('/protected', authenticateToken, (req, res) => {
  // req.user contains authenticated user info
});
```

### Role-based Authorization

```typescript
import { requireRole, requireAdmin } from '../lib/auth';

// Require specific role
router.get('/admin-only', requireAdmin, (req, res) => {
  // Only admins can access
});

// Require any of multiple roles
router.get('/consultants', requireRole(['consultant', 'admin']), (req, res) => {
  // Consultants and admins can access
});
```

### Permission-based Authorization

```typescript
import { requirePermission } from '../middleware/auth';
import { Permission } from '../lib/permissions';

// Require specific permission
router.get(
  '/clients',
  requirePermission(Permission.VIEW_CLIENT),
  (req, res) => {
    // Users with VIEW_CLIENT permission can access
  }
);
```

## User Roles and Permissions

### Admin Role

- Full access to all system features
- Can manage users and system settings
- Can view and modify all data
- Can access audit logs and reports

### Consultant Role

- Can manage their own clients, venues, proposals, and bookings
- Can create and track commission claims
- Can view their own reports and dashboard
- Cannot access other users' data or system administration features

## Environment Variables

Required environment variables for authentication:

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Microsoft OAuth
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret

# Frontend URL for OAuth redirects
CLIENT_URL=http://localhost:3000
```

## Security Features

1. **JWT Token Security**
   - Tokens expire after 7 days
   - Tokens include user role and permissions
   - Server validates token on each request

2. **OAuth Security**
   - Uses industry-standard OAuth 2.0 flow
   - No passwords stored in database
   - User identity verified by trusted providers

3. **Role-based Access Control**
   - Granular permissions system
   - Resource ownership validation
   - Admin override capabilities

4. **Database Security**
   - User data validation
   - Referential integrity constraints
   - Audit trail for user actions

## Testing

The authentication system includes comprehensive tests:

- Unit tests for JWT token generation and validation
- Integration tests for OAuth flows
- Middleware tests for authentication and authorization
- API endpoint tests for all auth routes

Run tests with:

```bash
npm test -- --testPathPattern=auth
```

## Error Handling

The system provides structured error responses:

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  },
  "timestamp": "2023-11-01T12:00:00.000Z",
  "path": "/api/protected-route"
}
```

Common error codes:

- `MISSING_TOKEN` - No authorization header provided
- `INVALID_TOKEN` - Token is malformed or expired
- `UNAUTHORIZED` - Authentication required
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions
- `USER_NOT_FOUND` - User account no longer exists

## Frontend Integration

The frontend should:

1. Store JWT token in secure storage (httpOnly cookie recommended)
2. Include token in Authorization header: `Bearer <token>`
3. Handle token expiration and refresh
4. Redirect to login on authentication errors
5. Show/hide UI elements based on user permissions

Example API call:

```javascript
const response = await fetch('/api/clients', {
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```
