# Environment Variables - Required Information

## What You Need to Provide

To run the backend, you need to provide values for these environment variables.

---

## 1. MONGO_URI (REQUIRED)

**What it is**: Your MongoDB connection string

**Choose ONE option:**

### Option A: Local MongoDB (Development)
```
MONGO_URI=mongodb://localhost:27017/echoes_of_resilience
```
- Simple for local development
- No authentication required
- Database name: `echoes_of_resilience`

### Option B: MongoDB Atlas (Cloud - Recommended for Production)
```
MONGO_URI=mongodb+srv://username:password@cluster-name.mongodb.net/echoes_of_resilience?retryWrites=true&w=majority
```

**Steps to get MongoDB Atlas connection string:**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new project
4. Create a cluster
5. Create a database user:
   - Username: `your_username`
   - Password: `your_secure_password`
6. Click "Connect" on cluster
7. Choose "Connect your application"
8. Copy the connection string
9. Replace `<username>` and `<password>` with your credentials

**Example MongoDB Atlas URI:**
```
MONGO_URI=mongodb+srv://echoes_user:MySecurePass123@echoes-cluster.mongodb.net/echoes_of_resilience?retryWrites=true&w=majority
```

---

## 2. JWT_SECRET (REQUIRED)

**What it is**: Secret key for signing JWT tokens

**Generate a strong secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Example output:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

**Use this as your JWT_SECRET in .env**

**Security notes:**
- Must be at least 32 characters
- Should be random and unique
- Never share or commit to git
- Use different secret in production

---

## 3. JWT_EXPIRE (Optional)

**What it is**: How long tokens remain valid

**Default**: `7d` (7 days)

**Valid formats:**
- `7d` - 7 days
- `24h` - 24 hours
- `3600s` - 3600 seconds
- `60m` - 60 minutes

---

## 4. PORT (Optional)

**What it is**: Port the server runs on

**Default**: `5000`

**Other common ports:**
- `3000` - Frontend
- `3001` - Alt backend
- `5000` - Default backend
- `8080` - Common alternative
- `3333` - Development

**Note**: Make sure port is not already in use

---

## 5. NODE_ENV (Optional)

**What it is**: Application environment

**Default**: `development`

**Valid values:**
- `development` - Local development
- `production` - Production deployment
- `testing` - For tests

---

## 6. FRONTEND_URL (Optional)

**What it is**: Your Next.js frontend URL for CORS

**Default**: `http://localhost:3000`

**Examples:**
```
# Development:
FRONTEND_URL=http://localhost:3000

# Production:
FRONTEND_URL=https://echoes-of-resilience.com

# Different port:
FRONTEND_URL=http://localhost:3001
```

---

## Complete .env Example

Copy this template and fill in your values:

```bash
# ============================================
# DATABASE CONFIGURATION
# ============================================
# Replace with your MongoDB URI
MONGO_URI=mongodb://localhost:27017/echoes_of_resilience

# ============================================
# AUTHENTICATION & SECURITY
# ============================================
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_generated_secret_here_at_least_32_characters

# Token expiration time
JWT_EXPIRE=7d

# ============================================
# SERVER CONFIGURATION
# ============================================
# Server port (default: 5000)
PORT=5000

# Environment (development, production, testing)
NODE_ENV=development

# ============================================
# CORS CONFIGURATION
# ============================================
# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# ============================================
# OPTIONAL: EMAIL CONFIGURATION
# ============================================
# For future email notifications (not required now)
# EMAIL_SERVICE=gmail
# EMAIL_USER=your_email@gmail.com
# EMAIL_PASSWORD=your_app_password

# ============================================
# OPTIONAL: RATE LIMITING
# ============================================
# Rate limit window in milliseconds (15 minutes)
# RATE_LIMIT_WINDOW_MS=900000

# Maximum requests per window
# RATE_LIMIT_MAX_REQUESTS=100
```

---

## Step-by-Step Setup Instructions

### 1. Create .env File

```bash
cd c:\Users\HP\Documents\FIVERR_JOBS\echoes_of_resilience_backend
cp .env.example .env
```

### 2. Choose Your MongoDB Option

**For Local Development (Easiest to start):**
```bash
# Make sure MongoDB is installed
# Windows: Download from https://www.mongodb.com/try/download/community
# Mac: brew install mongodb-community
# Linux: sudo apt-get install -y mongodb

# Start MongoDB (in separate terminal)
mongod

# In .env file, use:
MONGO_URI=mongodb://localhost:27017/echoes_of_resilience
```

**For Cloud (Better for production):**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create account and cluster
3. Create user with password
4. Get connection string
5. Add to .env:
```
MONGO_URI=mongodb+srv://your_user:your_password@your_cluster.mongodb.net/echoes_of_resilience
```

### 3. Generate JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output (32+ character hex string) and add to .env:
```
JWT_SECRET=your_copied_hex_string_here
```

### 4. Set Other Variables

Edit your .env file:
```
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_EXPIRE=7d
```

### 5. Verify .env File

```bash
# View your .env (should NOT show these in git)
cat .env

# Verify MongoDB connection
node -e "require('mongoose').connect(process.env.MONGO_URI).then(() => console.log('MongoDB connected!')).catch(err => console.log('Error:', err.message))"
```

---

## Production Setup Recommendations

### For Production Deployment:

**Change these values:**
```bash
# Use production MongoDB
MONGO_URI=mongodb+srv://prod_user:secure_password@prod_cluster.mongodb.net/echoes_of_resilience

# Use strong secret (generate new one)
JWT_SECRET=generate_a_new_strong_secret_for_production

# Set to production
NODE_ENV=production

# Use HTTPS frontend URL
FRONTEND_URL=https://yourdomain.com

# Consider shorter expiration for security
JWT_EXPIRE=24h
```

### Security Best Practices:

1. **Never commit .env to git** (already in .gitignore)
2. **Generate new JWT_SECRET for production**
3. **Use HTTPS in production** 
4. **Use MongoDB Atlas with authentication**
5. **Store secrets in environment variable manager** (AWS Secrets Manager, HashiCorp Vault, etc.)
6. **Use different secrets for dev/staging/prod**

---

## Troubleshooting

### "MONGO_URI not found"
- [ ] Create .env file from .env.example
- [ ] Add MONGO_URI to .env
- [ ] Ensure no typos in variable name

### "MongoDB connection refused"
- [ ] Ensure MongoDB is running: `mongod`
- [ ] Check MONGO_URI in .env is correct
- [ ] For Atlas, ensure IP is whitelisted

### "JWT_SECRET is missing"
- [ ] Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- [ ] Add generated value to JWT_SECRET in .env
- [ ] Restart server

### "Port 5000 already in use"
- [ ] Change PORT in .env to 5001, 5002, etc.
- [ ] Or kill process: `npx kill-port 5000`

---

## Verification Checklist

After setting up .env, verify:

- [ ] MONGO_URI is set correctly
- [ ] JWT_SECRET is at least 32 characters
- [ ] PORT is available
- [ ] NODE_ENV is set to "development" for dev
- [ ] FRONTEND_URL matches your frontend
- [ ] .env is in .gitignore
- [ ] MongoDB is running
- [ ] No typos in variable names

---

## Quick Reference

```bash
# Generate JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Test MongoDB connection (edit MONGO_URI first)
mongosh "your_connection_string_here"

# Check if port is available
netstat -an | grep 5000

# Start MongoDB
mongod

# Install dependencies
npm install

# Start backend
npm run dev

# Test server
curl http://localhost:5000/health
```

---

## Next Steps

Once you have .env configured:
1. Run `npm install`
2. Start MongoDB (`mongod` or ensure Atlas is accessible)
3. Run `npm run dev`
4. Test with `curl http://localhost:5000/health`
5. Connect your frontend

---

**Need help?**
- See QUICK_START.md for setup guide
- See README.md for API documentation
- Check ENVIRONMENT_VARIABLES.md for detailed options

