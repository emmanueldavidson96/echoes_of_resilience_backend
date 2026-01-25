# Quick Start Guide

Get your Echoes of Resilience backend running in minutes!

## Prerequisites

- **Node.js**: 16.x or higher
- **npm** or **yarn**
- **MongoDB**: Local or Atlas account
- **Git** (optional)

## Step 1: Extract/Clone the Backend

```bash
cd c:\Users\HP\Documents\FIVERR_JOBS
# Backend folder is: echoes_of_resilience_backend
cd echoes_of_resilience_backend
```

## Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages:
- express
- mongoose
- bcryptjs
- jsonwebtoken
- cookie-parser
- cors
- dotenv
- express-validator
- morgan
- nodemon (dev)

## Step 3: Set Up MongoDB

### Option A: Local MongoDB
```bash
# Start MongoDB service
# Windows: mongod (in separate terminal)
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# Verify it's running
mongo admin --eval "db.version()"
```

### Option B: MongoDB Atlas (Cloud)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Add database user
5. Get connection string

## Step 4: Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your configuration:
MONGO_URI=mongodb://localhost:27017/echoes_of_resilience
JWT_SECRET=your_secure_random_key_here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**How to generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 5: Start the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

You should see:
```
✓ MongoDB Connected: localhost
🚀 Echoes of Resilience Backend Server Running
📍 Server: http://localhost:5000
🔗 Environment: development
```

## Step 6: Test the API

### Health Check
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-21T10:30:00.000Z"
}
```

### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "Password123",
    "role": "youth",
    "dateOfBirth": "2010-05-15"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

Copy the `token` from the response and use it for authenticated requests:

```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Common Issues & Solutions

### MongoDB Connection Error
```
✗ Error connecting to MongoDB: connect ECONNREFUSED
```
**Solution**: 
- Ensure MongoDB is running: `mongod` (Windows/Linux) or `brew services start mongodb-community` (Mac)
- Check MONGO_URI in .env
- Try: `mongodb://localhost:27017/echoes_of_resilience`

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**:
- Kill existing process: `npx kill-port 5000`
- Or change PORT in .env to 5001, 5002, etc.

### Module Not Found
```
Cannot find module 'mongoose'
```
**Solution**:
```bash
npm install mongoose express bcryptjs jsonwebtoken cookie-parser cors dotenv express-validator morgan
```

### JWT Secret Issues
**Solution**: 
- Generate new: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Update JWT_SECRET in .env
- Restart server

## API Endpoints Quick Reference

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/:id` - Get user by ID

### Missions
- `GET /api/missions` - Get all missions
- `POST /api/missions` - Create mission (coach/admin)
- `GET /api/missions/:id` - Get mission details
- `POST /api/missions/:id/complete` - Complete mission (youth)

### Journals
- `GET /api/journals` - Get journals
- `POST /api/journals` - Create journal entry
- `GET /api/journals/:id` - Get journal
- `PUT /api/journals/:id` - Update journal
- `DELETE /api/journals/:id` - Delete journal

### Mood Tracking
- `POST /api/moods` - Log mood
- `GET /api/moods` - Get mood entries
- `GET /api/moods/history` - Get mood history
- `GET /api/moods/trends` - Get mood trends

### Assessments
- `POST /api/assessments/PHQ9/submit` - Submit PHQ9 assessment
- `POST /api/assessments/GAD7/submit` - Submit GAD7 assessment
- `GET /api/assessments/:id` - Get assessment results

### Alerts (Clinician/Admin)
- `GET /api/alerts` - Get all alerts
- `GET /api/alerts/:id` - Get alert details
- `PUT /api/alerts/:id/status` - Update alert status
- `POST /api/alerts/:id/notes` - Add notes to alert

## Connect to Frontend

In your Next.js frontend (.env.local):

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_API_PREFIX=/api
```

See `API_INTEGRATION.md` for detailed frontend integration examples.

## File Structure

```
echoes_of_resilience_backend/
├── src/
│   ├── server.js              # Main app entry
│   ├── types.ts              # TypeScript definitions
│   ├── config/
│   │   └── database.js        # MongoDB connection
│   ├── models/                # Mongoose schemas
│   ├── controllers/           # Route handlers
│   ├── routes/                # API routes
│   ├── middleware/            # Auth, validation, errors
│   └── utils/                 # Helper functions
├── .env.example               # Environment template
├── package.json               # Dependencies
├── README.md                  # Full documentation
├── ENVIRONMENT_VARIABLES.md   # Env var guide
├── API_INTEGRATION.md         # Frontend integration
└── QUICK_START.md            # This file
```

## Next Steps

1. ✅ Install dependencies
2. ✅ Configure .env
3. ✅ Start MongoDB
4. ✅ Run development server
5. → Test endpoints with cURL or Postman
6. → Connect to frontend
7. → Implement additional features
8. → Deploy to production

## Documentation Files

- **README.md** - Complete backend documentation
- **ENVIRONMENT_VARIABLES.md** - All env var options
- **API_INTEGRATION.md** - Frontend integration guide
- **QUICK_START.md** - This file (5-minute setup)

## Support

- Check `README.md` for comprehensive documentation
- Review controller files for implementation examples
- Check middleware for authentication/validation patterns
- See `models/` for database schema definitions

## Production Deployment

When ready to deploy:

1. Set NODE_ENV=production
2. Use strong JWT_SECRET
3. Configure production MongoDB URI
4. Set FRONTEND_URL to your domain
5. Enable HTTPS
6. Set up monitoring and logging
7. Configure backups
8. Deploy to: Heroku, AWS, DigitalOcean, Vercel, or similar

Refer to the specific platform's deployment documentation.

Happy coding! 🚀

