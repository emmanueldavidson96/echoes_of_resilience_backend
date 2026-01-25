# Backend Architecture & Reference Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Echoes of Resilience Backend             │
│                     Express.js Server (5000)                 │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
        ┌───────▼──────┐ ┌───▼────────┐ ┌──▼──────────┐
        │   Frontend   │ │  Database  │ │ External    │
        │ Next.js App  │ │ MongoDB    │ │ Services    │
        │  (port 3000) │ │ (Mongoose) │ │ (Email, etc)│
        └──────────────┘ └────────────┘ └─────────────┘
```

---

## Request Flow

```
Client Request
     ↓
CORS Middleware ────────→ Check allowed origin
     ↓
Express Middleware ────→ Parse JSON, cookies
     ↓
Morgan Logger ─────────→ Log request
     ↓
Route Handler ─────────→ Match route
     ↓
Auth Middleware ───────→ Verify JWT token (if protected)
     ↓
Validation Middleware ─→ Validate input
     ↓
Controller ─────────────→ Business logic
     ↓
Database Query ────────→ Mongoose model
     ↓
MongoDB ────────────────→ Fetch/Store data
     ↓
Response Formatting ───→ Return JSON
     ↓
Client Response ───────→ Success/Error
```

---

## User Authentication Flow

```
1. REGISTRATION
   ┌─────────────────────────────────────────────┐
   │ POST /api/auth/register                     │
   │ - firstName, lastName, email, password, role│
   └─────────────────────────────────────────────┘
                      ↓
   ┌─────────────────────────────────────────────┐
   │ - Validate input                            │
   │ - Check if user exists                      │
   │ - Hash password with bcryptjs               │
   │ - Create User document                      │
   │ - Create role profile (Youth/Coach/etc)     │
   └─────────────────────────────────────────────┘
                      ↓
   ┌─────────────────────────────────────────────┐
   │ Return JWT token & user object              │
   │ - Token stored in httpOnly cookie           │
   │ - Also returned in response                 │
   └─────────────────────────────────────────────┘

2. LOGIN
   ┌─────────────────────────────────────────────┐
   │ POST /api/auth/login                        │
   │ - email, password                           │
   └─────────────────────────────────────────────┘
                      ↓
   ┌─────────────────────────────────────────────┐
   │ - Find user by email                        │
   │ - Compare password with hash                │
   │ - Generate JWT token                        │
   │ - Update lastLogin                          │
   └─────────────────────────────────────────────┘
                      ↓
   ┌─────────────────────────────────────────────┐
   │ Return JWT token & user object              │
   └─────────────────────────────────────────────┘

3. PROTECTED REQUEST
   ┌─────────────────────────────────────────────┐
   │ GET /api/users/profile                      │
   │ - Header: Authorization: Bearer TOKEN       │
   │ - OR Cookie: token=TOKEN                    │
   └─────────────────────────────────────────────┘
                      ↓
   ┌─────────────────────────────────────────────┐
   │ - Extract token from header or cookie       │
   │ - Verify token with JWT_SECRET              │
   │ - Extract user ID from decoded token        │
   │ - Check user role for authorization         │
   └─────────────────────────────────────────────┘
                      ↓
   ┌─────────────────────────────────────────────┐
   │ Proceed to handler if authorized            │
   │ Return error if not authorized              │
   └─────────────────────────────────────────────┘
```

---

## Database Relationships

```
┌─────────┐
│  User   │◄─────┐
├─────────┤      │
│ _id     │      │
│ email   │      │ Owns
│ password│      │ (1:1 relationship)
│ role    │      │
└─────────┘      │
     │           │
     ├──────────►│
     │
     ├─────────────────────────────┐
     │                             │
┌────▼────────┐   ┌─────────────┐  ┌──────────────┐
│   Youth     │   │ Coach       │  │ Clinician    │
├─────────────┤   ├─────────────┤  ├──────────────┤
│ userId (FK) │   │ userId (FK) │  │ userId (FK)  │
│ gradeLevel  │   │ specialization│ │ licenseNo    │
│ points      │   │ students    │  │ supervisions │
│ missions[]  │   │ availability│  │              │
└─────────────┘   └─────────────┘  └──────────────┘
     │
     ├─────────┬─────────┬────────────────┐
     │         │         │                │
┌────▼─┐ ┌────▼──┐ ┌───▼────┐ ┌────────▼─────┐
│Mission│ │Journal│ │MoodEntry│ │ Assessment  │
├──────┤ ├───────┤ ├────────┤ ├─────────────┤
│ title │ │ content│ │ mood   │ │ type(PHQ9)  │
│points │ │emotion │ │intensity│ │ score       │
│rewards│ │tags    │ │triggers│ │ severity    │
└──────┘ └───────┘ └────────┘ └─────────────┘
     │
     └──────┬────────┐
            │        │
      ┌─────▼─┐ ┌──▼─────┐
      │ Alert │ │Badge   │
      ├───────┤ ├────────┤
      │type   │ │badgeId │
      │severity│ │ unlocked│
      │status  │ │date    │
      └───────┘ └────────┘
```

---

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "data": null,
  "errors": [
    {
      "field": "email",
      "msg": "Invalid email format"
    }
  ]
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 100,
    "currentPage": 1,
    "totalPages": 5
  }
}
```

---

## Middleware Stack

```
Request
   ↓
┌─────────────────────────────────────────────┐
│ Morgan (Logging)                            │
│ ✓ Logs all HTTP requests                    │
│ ✓ Format: combined, simple, dev             │
└─────────────────────────────────────────────┘
   ↓
┌─────────────────────────────────────────────┐
│ CORS                                        │
│ ✓ Check allowed origin                      │
│ ✓ Allow credentials                         │
│ ✓ Allowed methods: GET, POST, PUT, DELETE   │
└─────────────────────────────────────────────┘
   ↓
┌─────────────────────────────────────────────┐
│ Body Parsers                                │
│ ✓ JSON parser                               │
│ ✓ URL-encoded parser                        │
│ ✓ Cookie parser                             │
└─────────────────────────────────────────────┘
   ↓
┌─────────────────────────────────────────────┐
│ Route Matching                              │
│ ✓ Match incoming path to route              │
└─────────────────────────────────────────────┘
   ↓
┌─────────────────────────────────────────────┐
│ Auth Middleware (if protected route)        │
│ ✓ Extract token                             │
│ ✓ Verify JWT                                │
│ ✓ Check user exists                         │
│ ✓ Set req.userId, req.userRole              │
└─────────────────────────────────────────────┘
   ↓
┌─────────────────────────────────────────────┐
│ Validation Middleware (if configured)       │
│ ✓ Validate input fields                     │
│ ✓ Sanitize data                             │
│ ✓ Return errors if invalid                  │
└─────────────────────────────────────────────┘
   ↓
┌─────────────────────────────────────────────┐
│ Route Handler (Controller)                  │
│ ✓ Business logic                            │
│ ✓ Database queries                          │
│ ✓ Response formatting                       │
└─────────────────────────────────────────────┘
   ↓
┌─────────────────────────────────────────────┐
│ Error Handler                               │
│ ✓ Catch errors                              │
│ ✓ Format error responses                    │
│ ✓ Log errors                                │
└─────────────────────────────────────────────┘
   ↓
Response
```

---

## Controller Pattern

```javascript
export const getResource = async (req, res, next) => {
  try {
    // 1. Extract data from request
    const { id } = req.params;
    const userId = req.userId; // From auth middleware
    
    // 2. Validate data
    if (!id) {
      return sendError(res, 400, 'ID is required');
    }
    
    // 3. Query database
    const resource = await Resource.findById(id);
    
    // 4. Check if exists
    if (!resource) {
      return sendError(res, 404, 'Resource not found');
    }
    
    // 5. Check authorization
    if (resource.userId.toString() !== userId) {
      return sendError(res, 403, 'Not authorized');
    }
    
    // 6. Return success
    sendSuccess(res, 200, 'Resource retrieved', resource);
    
  } catch (error) {
    // 7. Pass errors to error handler
    next(error);
  }
};
```

---

## Role-Based Access Control (RBAC)

```
Routes can be protected by role:

router.get('/admin/users', 
  protect,                    // Must be authenticated
  authorize('admin'),         // Must be admin
  controller
);

Available roles:
┌─────────────┬──────────────────────────────┐
│ Role        │ Permissions                  │
├─────────────┼──────────────────────────────┤
│ youth       │ Self profile, missions, mood │
│             │ journal, assessments         │
├─────────────┼──────────────────────────────┤
│ parent      │ View child profile, alerts   │
│             │ Contact admin                │
├─────────────┼──────────────────────────────┤
│ coach       │ Create missions, view youth  │
│             │ Add journal feedback         │
├─────────────┼──────────────────────────────┤
│ clinician   │ Review assessments, manage   │
│             │ alerts, view assigned youth  │
├─────────────┼──────────────────────────────┤
│ admin       │ All permissions, manage      │
│             │ system settings              │
└─────────────┴──────────────────────────────┘
```

---

## Database Index Strategy

```
User:
- email (unique, indexed)
- role (indexed for filtering)
- createdAt (indexed for sorting)

Youth:
- userId (unique)
- coachId (indexed)
- clinicianId (indexed)

Mission:
- category (indexed)
- createdBy (indexed)
- isActive (indexed)

MoodEntry:
- userId, createdAt (compound index)

Assessment:
- userId, completedAt (compound index)
- flaggedForReview (indexed)

Alert:
- youthId, status (compound index)
- severity (indexed)
```

---

## Error Handling Hierarchy

```
┌──────────────────────────────────────────┐
│ Application Error                        │
├──────────────────────────────────────────┤
│ 4xx Client Errors                        │
│ ├─ 400 Bad Request (validation)          │
│ ├─ 401 Unauthorized (auth failed)        │
│ ├─ 403 Forbidden (not authorized)        │
│ └─ 404 Not Found (resource missing)      │
├──────────────────────────────────────────┤
│ 5xx Server Errors                        │
│ ├─ 500 Internal Server Error             │
│ ├─ 503 Service Unavailable               │
│ └─ 504 Gateway Timeout                   │
├──────────────────────────────────────────┤
│ Database Errors                          │
│ ├─ Validation errors → 400               │
│ ├─ Duplicate key → 400                   │
│ └─ Connection error → 500                │
├──────────────────────────────────────────┤
│ Auth Errors                              │
│ ├─ Invalid token → 401                   │
│ ├─ Expired token → 401                   │
│ └─ Missing token → 401                   │
└──────────────────────────────────────────┘
```

---

## Deployment Stages

```
Development
├─ NODE_ENV=development
├─ MongoDB: localhost
├─ Logging: verbose
├─ CORS: localhost:3000
└─ Secrets: .env file

Staging
├─ NODE_ENV=production
├─ MongoDB: test cluster
├─ Logging: info level
├─ CORS: staging domain
└─ Secrets: env vars

Production
├─ NODE_ENV=production
├─ MongoDB: main cluster
├─ Logging: error level
├─ CORS: production domain
└─ Secrets: secrets manager
```

---

## Quick Reference Commands

```bash
# Install
npm install

# Development
npm run dev

# Production
npm start

# Test endpoint
curl http://localhost:5000/health

# Test auth
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'

# Test protected route
curl http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check MongoDB
mongosh "your_uri_here"

# Kill port
npx kill-port 5000
```

---

## File Size Reference

```
src/
├── server.js              ~150 lines
├── config/database.js     ~20 lines
├── models/                ~800 lines (all schemas)
├── controllers/           ~1200 lines (all logic)
├── routes/                ~250 lines (all routes)
├── middleware/            ~150 lines
└── utils/                 ~100 lines

Total Production Code: ~2700 lines
Documentation: ~3000 lines
```

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Response Time (p95) | <200ms |
| Database Query (p95) | <50ms |
| Uptime | 99.9% |
| Error Rate | <0.1% |
| Memory Usage | <500MB |
| CPU Usage | <30% |

---

**Reference Guide Version**: 1.0
**Last Updated**: January 2024
**Backend Version**: 1.0.0

