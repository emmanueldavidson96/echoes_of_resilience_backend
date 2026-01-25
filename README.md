# Echoes of Resilience - Backend API

**Express.js** backend for the Echoes of Resilience gamified social-emotional learning (SEL) platform. Handles user authentication, assessments, mood tracking, journaling, missions, and role-based access control.

**📚 Documentation**: See [ARCHITECTURE_REFERENCE.md](./ARCHITECTURE_REFERENCE.md), [API_INTEGRATION.md](./API_INTEGRATION.md)
**Frontend Repository**: See [echoes_of_resilience/](../echoes_of_resilience/)

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ (preferably 18+)
- **MongoDB** (local or Atlas)
- **npm** or **pnpm**

### Installation

1. **Clone and Setup**
```bash
cd echoes_of_resilience_backend
npm install
```

2. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start Development Server**
```bash
npm run dev
```

Server will start on `http://localhost:5000` (default port)

### Build for Production
```bash
npm run build
npm start
```

---

## 🔧 Environment Configuration

### Required Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/echoes_of_resilience` | ✅ |
| `JWT_SECRET` | Secret key for JWT tokens | `your-super-secret-key-min-32-chars` | ✅ |
| `JWT_EXPIRE` | JWT token expiration time | `7d` | ✅ |
| `PORT` | Server port | `5000` | ❌ (default: 5000) |
| `NODE_ENV` | Environment | `development` or `production` | ✅ |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` | ✅ |
| `BCRYPT_ROUNDS` | Password hash rounds | `10` | ❌ (default: 10) |
| `LOG_LEVEL` | Logging level | `debug`, `info`, `warn`, `error` | ❌ (default: info) |

### Setup Instructions

1. **Create `.env` file**
```bash
cp .env.example .env
```

2. **Configure MongoDB**
   - **Local**: `MONGO_URI=mongodb://localhost:27017/echoes_of_resilience`
   - **Atlas**: `MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/echoes_of_resilience`

3. **Generate JWT Secret** (optional but recommended)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

4. **Verify Configuration**
```bash
npm run dev
# Should see: "Server running on http://localhost:5000"
```

---

## 📁 Project Structure

```
src/
├── server.js                   # Main server entry point
├── types.ts                    # TypeScript type definitions
│
├── config/
│   └── database.js             # MongoDB connection & initialization
│
├── models/                     # Mongoose schemas & database models
│   ├── User.js                 # Base user model
│   ├── Youth.js                # Youth profile model
│   ├── Coach.js                # Coach profile model
│   ├── Clinician.js            # Clinician profile model
│   ├── Parent.js               # Parent profile model
│   ├── Mission.js              # Mission/task model
│   ├── Journal.js              # Journal entry model
│   ├── Assessment.js           # Assessment results model
│   ├── MoodEntry.js            # Mood tracking model
│   └── Alert.js                # System alerts model
│
├── controllers/                # Route handler functions
│   ├── authController.js       # Authentication logic
│   ├── userController.js       # User profile management
│   ├── missionController.js    # Mission management
│   ├── journalController.js    # Journal operations
│   ├── assessmentController.js # Assessment handling
│   ├── moodController.js       # Mood tracking
│   └── alertController.js      # Alerts & notifications
│
├── routes/                     # API route definitions
│   ├── auth.js                 # Auth endpoints
│   ├── users.js                # User endpoints
│   ├── missions.js             # Mission endpoints
│   ├── journals.js             # Journal endpoints
│   ├── assessments.js          # Assessment endpoints
│   ├── moods.js                # Mood endpoints
│   └── alerts.js               # Alert endpoints
│
├── middleware/                 # Express middleware functions
│   ├── auth.js                 # JWT verification
│   ├── errorHandler.js         # Error handling
│   └── validation.js           # Input validation
│
└── utils/
    ├── errorResponse.js        # Error response formatting
    └── validators.js           # Custom validation functions
```

---

## 🔌 API Endpoints Overview

### Authentication
```
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login user
POST   /api/auth/logout            # Logout user
POST   /api/auth/refresh-token     # Refresh JWT token
POST   /api/auth/forgot-password   # Request password reset
POST   /api/auth/reset-password    # Reset password
```

### Users & Profiles
```
GET    /api/users/profile          # Get current user profile
PUT    /api/users/profile          # Update user profile
GET    /api/users/:id              # Get user by ID
DELETE /api/users/:id              # Delete user account
GET    /api/users                  # List users (admin only)
```

### Assessments
```
GET    /api/assessments            # Get user's assessments
GET    /api/assessments/gad7       # Get GAD-7 assessments
POST   /api/assessments/gad7       # Submit GAD-7 assessment
GET    /api/assessments/phq9       # Get PHQ-9 assessments
POST   /api/assessments/phq9       # Submit PHQ-9 assessment
GET    /api/assessments/:id        # Get specific assessment
```

### Mood Tracking
```
GET    /api/moods                  # Get user's mood entries
POST   /api/moods                  # Record mood entry
GET    /api/moods/history          # Get mood history (filtered)
DELETE /api/moods/:id              # Delete mood entry
```

### Journaling
```
GET    /api/journals               # Get user's journal entries
POST   /api/journals               # Create journal entry
GET    /api/journals/:id           # Get specific journal entry
PUT    /api/journals/:id           # Update journal entry
DELETE /api/journals/:id           # Delete journal entry
```

### Missions
```
GET    /api/missions               # Get available missions
POST   /api/missions               # Create mission (admin/coach)
GET    /api/missions/:id           # Get mission details
PUT    /api/missions/:id           # Update mission
POST   /api/missions/:id/complete  # Mark mission as complete
DELETE /api/missions/:id           # Delete mission
```

### Alerts & Notifications
```
GET    /api/alerts                 # Get user alerts
POST   /api/alerts                 # Create alert
PUT    /api/alerts/:id             # Update alert (mark read)
DELETE /api/alerts/:id             # Delete alert
```

---

## 🛠️ Development Guide

### Technologies Used

| Technology | Purpose | Version |
|------------|---------|---------|
| **Express.js** | Web framework | 5.2.1 |
| **Mongoose** | MongoDB ODM | 9.1.5 |
| **JWT** | Token authentication | 9.0.3 |
| **bcryptjs** | Password hashing | 3.0.3 |
| **Validator** | Input validation | 7.3.1 |
| **CORS** | Cross-origin requests | 2.8.5 |
| **Morgan** | HTTP request logging | 1.10.1 |
| **Nodemon** | Dev auto-reload | 3.0.1 |

### Available Scripts

```bash
# Development
npm run dev              # Start dev server with auto-reload

# Production
npm run start            # Start production server
npm run build            # Build for production

# Code Quality
npm run lint            # Check for linting errors
npm run lint:fix        # Fix linting errors
```

### Project Conventions

#### Naming Conventions
```
Models:        User, Assessment (PascalCase)
Controllers:   authController, userController (camelCase)
Routes:        /api/auth, /api/users (lowercase)
Functions:     getUserById, calculateScore (camelCase)
Constants:     MAX_RETRIES, JWT_EXPIRE (UPPER_SNAKE_CASE)
```

#### Error Handling
```javascript
// Standard error response
{
  success: false,
  message: "Error description",
  status: 400,
  errors: {
    field: "validation error message"
  }
}
```

#### Response Format
```javascript
// Success response
{
  success: true,
  message: "Operation successful",
  data: { /* response data */ }
}

// List response
{
  success: true,
  data: [ /* array of items */ ],
  pagination: {
    total: 100,
    page: 1,
    limit: 10,
    pages: 10
  }
}
```

---

## 🔐 Authentication & Authorization

### JWT Token Structure

```javascript
{
  userId: "user_id_string",
  email: "user@example.com",
  role: "youth|coach|clinician|parent|admin",
  iat: 1673000000,      // Issued at
  exp: 1673604800       // Expiration (7 days)
}
```

### Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **youth** | View own profile, complete assessments, journal, track mood, view missions |
| **coach** | View assigned youth, view assessments, provide guidance, assign missions |
| **clinician** | Review assessments, analyze mental health trends, clinical oversight |
| **parent** | View child's progress, view mood & journal summaries, receive alerts |
| **admin** | Full system access, user management, configuration |

### Protected Endpoints Example

```javascript
// Route protection
router.get('/profile', requireAuth, userController.getProfile);

// Role-based access
router.delete('/users/:id', 
  requireAuth, 
  requireRole('admin'), 
  userController.deleteUser
);
```

---

## 📊 Database Schema Overview

### User Model
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  name: String,
  role: String (enum: youth, coach, clinician, parent, admin),
  createdAt: Date,
  updatedAt: Date
}
```

### Assessment Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  type: String (GAD7, PHQ9, mood),
  responses: [Number],
  score: Number,
  severity: String,
  interpretation: String,
  completedAt: Date
}
```

### Mission Model
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  difficulty: String (easy, medium, hard),
  category: String,
  reward: Number,
  completedBy: [ObjectId],
  createdAt: Date
}
```

---

## 🧪 Testing (Recommended Setup)

```bash
# Install testing dependencies
npm install --save-dev jest supertest @babel/preset-env

# Create jest.config.js
# Create __tests__ directory

# Run tests
npm test
```

### Example Test

```javascript
// __tests__/auth.test.js
const request = require('supertest');
const app = require('../src/server');

describe('Auth API', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Test123!',
        name: 'Test User',
        role: 'youth'
      });
    
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
  });
});
```

---

## 📚 Additional Resources

- **Express.js**: https://expressjs.com
- **MongoDB**: https://docs.mongodb.com
- **Mongoose**: https://mongoosejs.com
- **JWT**: https://jwt.io
- **RESTful API Design**: https://restfulapi.net

---

## 🤝 Contributing

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Code style guidelines
- Git workflow
- Pull request process
- Testing requirements

---

## 📄 License

ISC License - See LICENSE file

---

## 📞 Support

For issues and questions:
1. Check documentation files
2. Review API reference
3. Create GitHub issue with detailed information

---

**Last Updated**: January 2026
**Maintained By**: Development Team
**Version**: 1.0
- `GET /api/users/:userId/coaches` - Get assigned coaches

### Youth-Specific
- `GET /api/youth/dashboard` - Get youth dashboard data
- `GET /api/youth/stats` - Get youth statistics
- `GET /api/youth/:youthId/progress` - Get youth progress

### Missions/Quests
- `GET /api/missions` - Get all available missions
- `POST /api/missions` - Create new mission (coaches/admin)
- `GET /api/missions/:id` - Get mission details
- `PUT /api/missions/:id` - Update mission
- `DELETE /api/missions/:id` - Delete mission
- `POST /api/missions/:id/complete` - Mark mission as complete
- `GET /api/missions/:id/leaderboard` - Get mission leaderboard

### Journals
- `GET /api/journals` - Get user's journals
- `POST /api/journals` - Create new journal entry
- `GET /api/journals/:id` - Get journal entry
- `PUT /api/journals/:id` - Update journal entry
- `DELETE /api/journals/:id` - Delete journal entry

### Assessments (PHQ-9, GAD-7)
- `GET /api/assessments` - Get available assessments
- `POST /api/assessments/:type/submit` - Submit assessment responses
- `GET /api/assessments/:id/results` - Get assessment results
- `GET /api/assessments/:userId/history` - Get user's assessment history

### Mood Tracking
- `POST /api/moods` - Log mood entry
- `GET /api/moods` - Get mood entries
- `GET /api/moods/history` - Get mood tracking history
- `GET /api/moods/trends` - Get mood trends/analytics

### Alerts (Clinician-facing)
- `GET /api/alerts` - Get all alerts (admin/clinician)
- `GET /api/alerts/:id` - Get alert details
- `PUT /api/alerts/:id/status` - Update alert status
- `POST /api/alerts/:id/notes` - Add notes to alert

## Authentication

Uses JWT (JSON Web Tokens) stored in HTTP-only cookies.

- Tokens are issued on login/registration
- Included in `Authorization` header or cookies
- Middleware validates tokens before protected routes
- Auto-refresh token functionality

## User Roles

- **Youth**: Primary users, access missions, journaling, mood tracking
- **Parent/Guardian**: Monitor child's progress, access reports
- **Coach**: Create missions, monitor assigned youth
- **Clinician**: View alerts, monitor high-risk youth
- **Admin**: System administration, user management, settings

## Development Tips

### Running Tests
```bash
npm test
```

### API Documentation
Visit `/api/docs` for Swagger documentation (if enabled)

### Database Seeding
```bash
npm run seed
```

## Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- HTTP-only cookies
- CORS configuration
- Rate limiting
- Input validation & sanitization
- Role-based access control

## Error Handling

All endpoints return standardized error responses:
```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

## Support

For issues or questions, contact the development team.
