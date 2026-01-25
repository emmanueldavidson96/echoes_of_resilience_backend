# Installation Checklist

Complete this checklist to ensure your backend is properly set up.

## Pre-Installation ✓

- [ ] You have Node.js 16+ installed: `node --version`
- [ ] You have npm installed: `npm --version`
- [ ] You have MongoDB (local or Atlas account)
- [ ] You're in the correct directory: `echoes_of_resilience_backend`

## Installation Steps

### Step 1: Install Dependencies
```bash
npm install
```

**Verification:**
```bash
ls node_modules | head -10
# Should show: cookie-parser, cors, dotenv, express, mongoose, etc.
```

- [ ] All dependencies installed successfully
- [ ] No errors during installation
- [ ] node_modules folder created

### Step 2: Create Environment File
```bash
cp .env.example .env
```

**Edit .env with your values:**

**MongoDB URI** - Choose one:
```bash
# Local MongoDB:
MONGO_URI=mongodb://localhost:27017/echoes_of_resilience

# OR MongoDB Atlas:
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/echoes_of_resilience
```

- [ ] .env file created
- [ ] MONGO_URI added
- [ ] JWT_SECRET generated and added
- [ ] PORT set (default: 5000)
- [ ] NODE_ENV set to "development"
- [ ] FRONTEND_URL set to http://localhost:3000

### Step 3: Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Example output:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

- [ ] JWT_SECRET generated
- [ ] Added to .env file
- [ ] Secret is 32+ characters

### Step 4: Verify File Structure
```bash
tree src -L 2
# Or: dir /s src
```

Ensure these directories exist:
- [ ] src/
- [ ] src/config/
- [ ] src/models/
- [ ] src/controllers/
- [ ] src/routes/
- [ ] src/middleware/
- [ ] src/utils/

### Step 5: Verify Model Files
```bash
ls -la src/models/
```

Ensure these files exist:
- [ ] User.js
- [ ] Youth.js
- [ ] Coach.js
- [ ] Clinician.js
- [ ] Parent.js
- [ ] Mission.js
- [ ] Journal.js
- [ ] MoodEntry.js
- [ ] Assessment.js
- [ ] Alert.js

### Step 6: Verify Route Files
```bash
ls -la src/routes/
```

Ensure these files exist:
- [ ] auth.js
- [ ] users.js
- [ ] missions.js
- [ ] journals.js
- [ ] moods.js
- [ ] assessments.js
- [ ] alerts.js

### Step 7: Verify Controller Files
```bash
ls -la src/controllers/
```

Ensure these files exist:
- [ ] authController.js
- [ ] userController.js
- [ ] missionController.js
- [ ] journalController.js
- [ ] moodController.js
- [ ] assessmentController.js
- [ ] alertController.js

### Step 8: Verify Middleware Files
```bash
ls -la src/middleware/
```

Ensure these files exist:
- [ ] auth.js
- [ ] errorHandler.js
- [ ] validation.js

### Step 9: Start MongoDB
```bash
# Windows/Linux:
mongod

# Mac:
brew services start mongodb-community
```

**Verify MongoDB is running:**
```bash
mongo --eval "db.adminCommand('ping')"
# Should output: { ok: 1 }
```

- [ ] MongoDB is running locally or connection configured for Atlas
- [ ] MongoDB connection confirmed
- [ ] No connection errors

### Step 10: Start Development Server
```bash
npm run dev
```

**Expected output:**
```
✓ MongoDB Connected: localhost
🚀 Echoes of Resilience Backend Server Running
📍 Server: http://localhost:5000
🔗 Environment: development
```

- [ ] Server starts without errors
- [ ] MongoDB connected successfully
- [ ] Server listening on port 5000
- [ ] No warnings or error messages

### Step 11: Test Health Endpoint
```bash
# In another terminal:
curl http://localhost:5000/health
```

**Expected response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-21T10:30:00.000Z"
}
```

- [ ] Health endpoint responds
- [ ] Response is successful
- [ ] No connection errors

### Step 12: Test Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "Password123",
    "role": "youth",
    "dateOfBirth": "2010-05-15"
  }'
```

**Expected response contains:**
- [ ] "success": true
- [ ] Token issued
- [ ] User object created
- [ ] No validation errors

### Step 13: Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

**Expected response contains:**
- [ ] "success": true
- [ ] Token issued
- [ ] User authenticated
- [ ] Last login updated

### Step 14: Test Protected Route
```bash
# Replace YOUR_TOKEN_HERE with the token from login
curl http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected response:**
- [ ] User profile returned
- [ ] No 401 Unauthorized error
- [ ] Correct user data

### Step 15: Check Documentation
```bash
# Verify documentation files exist:
ls -la *.md
```

Ensure these files exist:
- [ ] README.md
- [ ] QUICK_START.md
- [ ] ENVIRONMENT_VARIABLES.md
- [ ] API_INTEGRATION.md
- [ ] ROADMAP.md
- [ ] SETUP_SUMMARY.md

- [ ] All documentation files present
- [ ] Files are readable
- [ ] Content is complete

## Post-Installation ✓

### Database Verification
```bash
mongo
> use echoes_of_resilience
> db.users.find()
> exit
```

- [ ] Database created
- [ ] Collections auto-created by Mongoose
- [ ] Initial user record exists

### Environment Verification
```bash
cat .env | grep -v "^#"
```

- [ ] All required variables are set
- [ ] No empty values
- [ ] Credentials are valid
- [ ] .env is NOT in git (check .gitignore)

### Git Setup
```bash
git init
git add .
git status
```

- [ ] Git initialized
- [ ] .env is ignored
- [ ] node_modules is ignored
- [ ] Only source files tracked

## Ready for Frontend Integration ✓

### Prepare Frontend Variables
In your Next.js frontend `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_API_PREFIX=/api
```

- [ ] Frontend .env configured
- [ ] API_URL points to backend
- [ ] Frontend can reach backend

### Test Frontend Connection
From frontend project:
```bash
curl -X GET http://localhost:5000/health
```

- [ ] Frontend can reach backend
- [ ] CORS properly configured
- [ ] No connection issues

## Troubleshooting Checklist

### If MongoDB Connection Fails
- [ ] MongoDB service is running
- [ ] MONGO_URI is correct
- [ ] Credentials are correct (if using Atlas)
- [ ] IP is whitelisted (if using Atlas)
- [ ] Port 27017 is accessible

### If Server Won't Start
- [ ] Port 5000 is available (or change PORT in .env)
- [ ] All required packages are installed
- [ ] .env file exists and is readable
- [ ] No syntax errors in server.js
- [ ] Environment variables are set

### If Authentication Fails
- [ ] JWT_SECRET is set in .env
- [ ] Token is being sent correctly
- [ ] Token hasn't expired
- [ ] User credentials are correct
- [ ] Role is set correctly

### If CORS Errors Occur
- [ ] FRONTEND_URL is set correctly in .env
- [ ] Frontend includes credentials in requests
- [ ] API includes correct CORS headers
- [ ] No browser cache issues (clear or use incognito)

## Performance Checklist

- [ ] Server responds within 200ms
- [ ] Database queries are fast (<50ms)
- [ ] No memory leaks (monitor with `top` or Task Manager)
- [ ] Logging is appropriate level
- [ ] No unnecessary console.logs in production code

## Security Checklist

- [ ] .env file is in .gitignore
- [ ] JWT_SECRET is strong (32+ random characters)
- [ ] Password hashing is enabled (bcryptjs)
- [ ] HTTPS enabled in production
- [ ] CORS restricts to frontend domain in production
- [ ] Rate limiting is configured
- [ ] Input validation is active

## Deployment Readiness Checklist

Before deploying to production:

- [ ] Environment variables are configured for production
- [ ] NODE_ENV is set to "production"
- [ ] JWT_SECRET is unique and strong
- [ ] MongoDB is set to production instance
- [ ] HTTPS is enabled
- [ ] Error logs are configured
- [ ] Monitoring is set up
- [ ] Database backups are configured
- [ ] All dependencies are pinned in package.json
- [ ] Security audit completed

## Final Verification

Run this complete test:

```bash
# 1. Start server
npm run dev

# 2. In another terminal, test all endpoints:
echo "Testing backend..."
curl http://localhost:5000/health

# 3. Test auth flow
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}' \
  | jq -r '.token')

echo "Token: $TOKEN"

# 4. Test protected route
curl http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer $TOKEN"

echo "✅ All tests passed!"
```

- [ ] Health check passed
- [ ] User created successfully
- [ ] Login successful
- [ ] Protected route accessible
- [ ] Token validation working

## All Set! 🎉

You're ready to:
- ✅ Run the backend server
- ✅ Connect your frontend
- ✅ Test API endpoints
- ✅ Deploy to production
- ✅ Start building features

## Next Steps

1. **Read Documentation**
   - [ ] Start with QUICK_START.md
   - [ ] Review API_INTEGRATION.md for frontend

2. **Connect Frontend**
   - [ ] Implement auth endpoints
   - [ ] Create API client
   - [ ] Test integration

3. **Test Thoroughly**
   - [ ] Unit test each endpoint
   - [ ] Integration testing
   - [ ] Load testing

4. **Deploy**
   - [ ] Choose platform (Heroku, AWS, Render, etc.)
   - [ ] Configure production environment
   - [ ] Set up monitoring and logs
   - [ ] Configure backups

## Support Resources

- **README.md** - Complete API reference
- **ENVIRONMENT_VARIABLES.md** - Configuration guide
- **API_INTEGRATION.md** - Frontend integration examples
- **ROADMAP.md** - Feature roadmap

---

**Date Completed:** _______________
**Completed By:** _______________
**Notes:** _______________________________________________

