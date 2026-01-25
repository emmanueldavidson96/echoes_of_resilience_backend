# Backend Architecture Reference

## System Design Overview

Echoes of Resilience backend is built with **Express.js** and **MongoDB**, using a **Model-View-Controller (MVC)** architecture with middleware-based request processing.

---

## 🏗️ Architecture Layers

### 1. **Request Entry Point** (server.js)
- Express app initialization
- Middleware configuration
- Route registration
- Error handling setup
- Server startup

### 2. **Middleware Layer**
- **Auth Middleware**: JWT verification & token extraction
- **Validation Middleware**: Input schema validation
- **Error Handler**: Centralized error handling
- **Logging**: Request/response logging (Morgan)
- **CORS**: Cross-origin request handling

### 3. **Route Layer** (`routes/`)
- Maps HTTP methods to endpoints
- Applies middleware chains
- Routes to appropriate controller

```
GET /api/assessments
  ↓
requireAuth (middleware)
  ↓
assessmentController.getAssessments
```

### 4. **Controller Layer** (`controllers/`)
- Business logic implementation
- Request validation
- Database operations via models
- Response formatting

### 5. **Model Layer** (`models/`)
- Mongoose schema definitions
- Data validation rules
- Database constraints
- Instance methods & statics

### 6. **Database Layer** (MongoDB)
- Data persistence
- Indexing & performance
- Transactions for complex ops

---

## 🔄 Request Flow Diagram

```
HTTP Request
    ↓
CORS Middleware
    ↓
Body Parser
    ↓
Morgan Logging
    ↓
Route Matching
    ↓
Auth Middleware (if required)
    ↓
Validation Middleware
    ↓
Controller Logic
    ├─→ Model Query/Operation
    ├─→ Data Processing
    └─→ Response Formatting
    ↓
Success Response / Error Handler
    ↓
HTTP Response
```

---

## 🔐 Authentication Architecture

### JWT Token Flow

```
1. Registration/Login
   ├─→ User provides credentials
   ├─→ Password validation (bcrypt)
   └─→ JWT generated
   
2. Token Storage (Client)
   ├─→ localStorage or cookie
   └─→ Sent with each request
   
3. Token Verification (Server)
   ├─→ Extract token from header
   ├─→ Verify signature with JWT_SECRET
   ├─→ Validate expiration
   └─→ Extract user info
   
4. Access Control
   ├─→ Check role-based permissions
   └─→ Allow/Deny request
```

### JWT Payload Structure

```javascript
{
  userId: "507f1f77bcf86cd799439011",
  email: "user@example.com",
  role: "youth",
  iat: 1673000000,
  exp: 1673604800
}
```

### Middleware Chain Example

```javascript
// Route with multiple middlewares
router.post(
  '/missions/:id/complete',
  requireAuth,              // 1. Verify JWT token
  requireRole('youth'),      // 2. Check user role
  validateMissionComplete,   // 3. Validate request body
  async (req, res) => {
    // 4. Controller logic
  }
);
```

---

## 📊 Database Schema Design

### User Model Hierarchy

```
User (Base)
├── Youth (inherits User)
│   ├── School
│   ├── GradeLevel
│   └── EmergencyContact
├── Coach (inherits User)
│   ├── Specializations
│   ├── AssignedYouth
│   └── Certifications
├── Clinician (inherits User)
│   ├── License
│   ├── Specialization
│   └── ReviewedAssessments
├── Parent (inherits User)
│   ├── ChildrenIds
│   └── PreferredContact
└── Admin (inherits User)
    └── Permissions
```

### Assessment Schema

```javascript
assessmentSchema {
  userId: ObjectId (ref: User),
  type: String (GAD7|PHQ9|mood),
  responses: [Number],
  score: Number,
  severity: String,
  interpretation: String,
  clinicianNotes: String,
  recommendedActions: [String],
  completedAt: Date,
  createdAt: Date
}

// Indexes
userId + type + createdAt (for efficient queries)
```

### Relationship Diagram

```
User
├── 1 → Many: Assessments
├── 1 → Many: MoodEntries
├── 1 → Many: Journals
├── 1 → Many: Missions (completed)
└── 1 → Many: Alerts

Coach
├── 1 → Many: AssignedYouth
└── 1 → Many: CreatedMissions

Mission
├── Many → Many: CompletedByUsers (with timestamps)
└── 1 → Many: Comments
```

---

## 🎯 API Response Patterns

### Standard Success Response

```javascript
{
  success: true,
  message: "Assessment submitted successfully",
  data: {
    assessment: {
      id: "assessment_123",
      score: 15,
      severity: "moderate"
    }
  }
}
```

### List Response with Pagination

```javascript
{
  success: true,
  data: [
    { id: "1", title: "Mission 1" },
    { id: "2", title: "Mission 2" }
  ],
  pagination: {
    total: 50,
    page: 1,
    limit: 20,
    pages: 3
  }
}
```

### Error Response

```javascript
{
  success: false,
  message: "Validation failed",
  status: 400,
  errors: {
    email: "Invalid email format",
    password: "Password too short"
  }
}
```

---

## 🚨 Error Handling Strategy

### Error Hierarchy

```
AppError (Custom Base)
├── ValidationError (400)
├── AuthenticationError (401)
├── AuthorizationError (403)
├── NotFoundError (404)
├── ConflictError (409)
└── ServerError (500)
```

### Error Handling Flow

```javascript
// 1. Throw custom error
if (!user) {
  throw new NotFoundError('User not found');
}

// 2. Middleware catches error
app.use((err, req, res, next) => {
  // Format response
  // Log error
  // Send response
});
```

### Error Response Example

```javascript
{
  success: false,
  message: "User not found",
  status: 404,
  errorCode: "USER_NOT_FOUND",
  timestamp: "2026-01-22T10:30:00Z"
}
```

---

## 🔄 Data Flow Examples

### Assessment Submission Flow

```
POST /api/assessments/gad7
├─→ Extract JWT token
├─→ Validate token & get userId
├─→ Validate request body (7 responses, 0-3 each)
├─→ Calculate score
├─→ Determine severity level
├─→ Save to Assessment model
├─→ Create notification for clinician
├─→ Format response
└─→ Return success response
```

### User Registration Flow

```
POST /api/auth/register
├─→ Validate input (email, password, name, role)
├─→ Check email uniqueness
├─→ Hash password (bcrypt)
├─→ Create user record
├─→ Create role-specific profile
├─→ Generate JWT token
├─→ Send welcome email (optional)
└─→ Return token & user data
```

---

## 📈 Scaling Considerations

### Database Optimization

```javascript
// Indexes to improve query performance
userSchema.index({ email: 1 }, { unique: true });
assessmentSchema.index({ userId: 1, createdAt: -1 });
moodEntrySchema.index({ userId: 1, recordedAt: -1 });
missionSchema.index({ 'completedBy.userId': 1 });
```

### Caching Strategy (Optional)

```javascript
// Cache frequently accessed data
app.use(redis.middleware({
  prefix: 'cache:',
  ttl: 3600 // 1 hour
}));

// Cache user missions
const missions = await cache.get(
  `missions:${userId}`,
  () => Mission.find({ userId })
);
```

### Rate Limiting (Recommended)

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 🧪 Testing Architecture

### Test Structure

```
__tests__/
├── unit/
│   ├── controllers/
│   ├── models/
│   └── utils/
├── integration/
│   ├── routes/
│   └── auth.test.js
└── fixtures/
    ├── seedData.js
    └── mockData.js
```

### Unit Test Example

```javascript
// __tests__/unit/controllers/assessmentController.test.js
describe('Assessment Controller', () => {
  describe('calculateGAD7Score', () => {
    it('should calculate correct score', () => {
      const responses = [2, 1, 3, 0, 2, 1, 2];
      const score = calculateGAD7Score(responses);
      expect(score).toBe(12);
    });
  });
});
```

### Integration Test Example

```javascript
// __tests__/integration/auth.test.js
describe('Auth Routes', () => {
  it('should register and login user', async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ email, password, name, role });
    
    expect(registerRes.status).toBe(201);
    
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password });
    
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeDefined();
  });
});
```

---

## 🔄 State Management

### User Session Tracking

```javascript
// Track active sessions
const activeSessions = new Map();

app.post('/api/auth/login', (req, res) => {
  const userId = user._id;
  activeSessions.set(userId, {
    loginTime: new Date(),
    lastActivity: new Date(),
    device: req.headers['user-agent']
  });
});

app.post('/api/auth/logout', (req, res) => {
  activeSessions.delete(req.user.id);
});
```

---

## 📊 Monitoring & Logging

### Request Logging

```javascript
// Morgan logging
app.use(morgan('combined'));

// Custom logging
function logRequest(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id || 'anonymous'
    });
  });
  next();
}
```

### Error Logging

```javascript
function logError(error, req, res) {
  const errorLog = {
    timestamp: new Date(),
    message: error.message,
    status: error.status || 500,
    userId: req.user?.id,
    endpoint: `${req.method} ${req.path}`,
    stack: error.stack
  };
  
  if (process.env.NODE_ENV === 'production') {
    // Send to external logging service
    externalLogger.error(errorLog);
  } else {
    console.error(errorLog);
  }
}
```

---

## 🔐 Security Best Practices

### Password Security
- Hash with bcrypt (10+ rounds)
- Never store plain text
- Never return in API responses

### JWT Security
- Use strong secret (32+ characters)
- Set reasonable expiration (7 days typical)
- Validate on every protected route

### SQL/Injection Prevention
- Use Mongoose (abstraction layer)
- Validate & sanitize all inputs
- Parameterized queries

### CORS Configuration
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 📚 Configuration Management

### Environment-Based Config

```javascript
// config/index.js
module.exports = {
  development: {
    mongoUri: 'mongodb://localhost:27017/echoes_dev',
    jwtExpire: '7d',
    corsOrigin: 'http://localhost:3000'
  },
  production: {
    mongoUri: process.env.MONGO_URI,
    jwtExpire: '7d',
    corsOrigin: process.env.FRONTEND_URL
  }
};

const config = require(`./config.${process.env.NODE_ENV}`);
```

---

## 🚀 Deployment Considerations

### Environment Setup
```bash
# Production environment variables
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=very-secure-key-min-32-chars
FRONTEND_URL=https://echoes-of-resilience.com
PORT=5000
```

### Health Check Endpoint
```javascript
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});
```

---

## 📚 Additional Resources

- **Express.js Patterns**: https://expressjs.com/en/guide/routing.html
- **MongoDB Design**: https://docs.mongodb.com/manual/core/data-modeling/
- **JWT Best Practices**: https://tools.ietf.org/html/rfc7519
- **Security**: https://owasp.org/www-project-top-ten/

---

**Last Updated**: January 2026
**Version**: 1.0
