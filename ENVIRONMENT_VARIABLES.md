# Echoes of Resilience Backend - Environment Variables Guide

## Required Environment Variables

### Database Configuration

**MONGO_URI**
- **Description**: MongoDB connection string
- **Type**: String
- **Required**: Yes
- **Examples**:
  - Local: `mongodb://localhost:27017/echoes_of_resilience`
  - MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/echoes_of_resilience`
- **Notes**: Replace username, password, and cluster details with your actual credentials

### Authentication & Security

**JWT_SECRET**
- **Description**: Secret key for signing and verifying JWT tokens
- **Type**: String
- **Required**: Yes
- **Recommended Length**: At least 32 characters
- **Security Note**: NEVER expose this in version control. Generate a strong random string for production
- **Example**: `your_very_secure_jwt_secret_key_here_change_in_production`

**JWT_EXPIRE**
- **Description**: JWT token expiration time
- **Type**: String
- **Required**: No
- **Default**: `7d`
- **Valid Formats**: `7d`, `24h`, `3600s`, etc.

### Server Configuration

**PORT**
- **Description**: Server port number
- **Type**: Number
- **Required**: No
- **Default**: `5000`
- **Example**: `5000`, `3001`, `8080`

**NODE_ENV**
- **Description**: Application environment
- **Type**: String
- **Required**: No
- **Default**: `development`
- **Valid Values**: `development`, `production`, `testing`
- **Impact**: Affects logging, error handling, and security features

### CORS Configuration

**FRONTEND_URL**
- **Description**: Frontend application URL for CORS configuration
- **Type**: String
- **Required**: No
- **Default**: `http://localhost:3000`
- **Example**: 
  - Development: `http://localhost:3000`
  - Production: `https://echoes-of-resilience.com`

### Email Configuration (Optional - For Future Use)

**EMAIL_SERVICE**
- **Description**: Email service provider
- **Type**: String
- **Required**: No
- **Valid Values**: `gmail`, `sendgrid`, `aws-ses`, etc.
- **Example**: `gmail`

**EMAIL_USER**
- **Description**: Email account username/address
- **Type**: String
- **Required**: No
- **Example**: `noreply@echoes-of-resilience.com`

**EMAIL_PASSWORD**
- **Description**: Email account password or app-specific password
- **Type**: String
- **Required**: No
- **Security Note**: Use app-specific passwords, never your actual password

### Rate Limiting

**RATE_LIMIT_WINDOW_MS**
- **Description**: Rate limiting window in milliseconds
- **Type**: Number
- **Required**: No
- **Default**: `900000` (15 minutes)

**RATE_LIMIT_MAX_REQUESTS**
- **Description**: Maximum requests allowed per window
- **Type**: Number
- **Required**: No
- **Default**: `100`

---

## Setup Instructions

### 1. MongoDB Setup

#### Local MongoDB
```bash
# Install MongoDB (if not already installed)
# Windows: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/
# Mac: brew install mongodb-community
# Linux: See MongoDB docs

# Start MongoDB
mongod

# Create database and collections (optional)
mongo
> use echoes_of_resilience
> db.createCollection("users")
```

#### MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Create database user and password
4. Whitelist IP address
5. Get connection string
6. Use format: `mongodb+srv://username:password@cluster.mongodb.net/echoes_of_resilience`

### 2. Generate JWT Secret

Generate a strong random JWT secret:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32

# Output example: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

### 3. Create .env File

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your actual values
# For development:
MONGO_URI=mongodb://localhost:27017/echoes_of_resilience
JWT_SECRET=your_generated_jwt_secret_here
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# For production, use more restrictive values
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Start Development Server

```bash
npm run dev
```

---

## Production Deployment Checklist

- [ ] Use strong, randomly generated JWT_SECRET
- [ ] Set NODE_ENV=production
- [ ] Use MongoDB Atlas or secured MongoDB instance
- [ ] Configure FRONTEND_URL to your production domain
- [ ] Enable HTTPS
- [ ] Use environment variable management service (e.g., AWS Secrets Manager, HashiCorp Vault)
- [ ] Set up proper logging and monitoring
- [ ] Configure firewall and security groups
- [ ] Enable rate limiting
- [ ] Set up backup strategy for database

---

## Troubleshooting

### MongoDB Connection Error
- Verify MONGO_URI is correct
- Ensure MongoDB is running
- Check IP whitelist (if using Atlas)
- Verify username/password (if using authentication)

### JWT Issues
- Ensure JWT_SECRET is set and consistent across all server instances
- Check token expiration time
- Verify token is being sent in Authorization header or cookies

### CORS Issues
- Verify FRONTEND_URL matches your frontend application URL
- Check that frontend is sending credentials with requests
- Ensure request headers are allowed

---

## Security Best Practices

1. **Never commit .env file** - Add to .gitignore
2. **Rotate JWT_SECRET regularly** - Implement token rotation strategy
3. **Use HTTPS in production** - Enforce secure connections
4. **Validate all inputs** - Use validation middleware
5. **Implement rate limiting** - Prevent abuse
6. **Monitor logs** - Set up alerts for suspicious activity
7. **Keep dependencies updated** - Regularly update packages
8. **Use secrets manager** - For production deployments

