# Backend Contributing Guide

Welcome to the Echoes of Resilience backend! This guide helps you contribute to the Express.js API.

---

## 🎯 Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Report issues through proper channels

---

## 🚀 Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/echoes_of_resilience.git
   cd echoes_of_resilience_backend
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/add-mood-filtering
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Create environment file**
   ```bash
   cp .env.example .env
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

---

## 💻 Development Workflow

### 1. Code Style

**JavaScript/Node.js:**
```javascript
// ✅ Good
async function getUserProfile(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  } catch (error) {
    throw error;
  }
}

// ❌ Avoid
async function get_user_profile(userid) {
  let user = await User.findById(userid);
  return user;
}
```

### 2. Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Files | kebab-case | `auth-controller.js` |
| Functions | camelCase | `calculateGAD7Score()` |
| Constants | UPPER_SNAKE_CASE | `JWT_EXPIRE = '7d'` |
| Classes/Models | PascalCase | `UserSchema` |
| Route files | lowercase | `auth.js` |
| Variables | camelCase | `isAuthenticated` |

### 3. File Organization

```
Feature
├── feature-controller.js      # Controller logic
├── feature-routes.js          # Route definitions
├── feature-model.js           # Data model
├── feature-validators.js      # Input validation
└── __tests__/
    └── feature.test.js        # Tests
```

### 4. Controller Template

```javascript
// controllers/featureController.js
const Feature = require('../models/Feature');
const { BadRequestError, NotFoundError } = require('../utils/errorResponse');

/**
 * Get all features
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
async function getFeatures(req, res) {
  try {
    const { limit = 10, skip = 0 } = req.query;
    
    const features = await Feature.find()
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await Feature.countDocuments();
    
    return res.status(200).json({
      success: true,
      data: features,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = { getFeatures };
```

### 5. Route Template

```javascript
// routes/feature.js
const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { validateFeature } = require('../middleware/validation');
const featureController = require('../controllers/featureController');

const router = express.Router();

// Public routes
router.get('/', featureController.getFeatures);

// Protected routes
router.post(
  '/',
  requireAuth,
  requireRole('admin', 'coach'),
  validateFeature,
  featureController.createFeature
);

router.put(
  '/:id',
  requireAuth,
  requireRole('admin', 'coach'),
  validateFeature,
  featureController.updateFeature
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('admin'),
  featureController.deleteFeature
);

module.exports = router;
```

### 6. Model Template

```javascript
// models/Feature.js
const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters']
  },
  description: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
featureSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model('Feature', featureSchema);
```

---

## 🧪 Testing

### Writing Tests

```javascript
// __tests__/controllers/feature.test.js
const request = require('supertest');
const app = require('../../src/server');
const Feature = require('../../src/models/Feature');
const User = require('../../src/models/User');

describe('Feature Controller', () => {
  let user;
  let token;

  beforeAll(async () => {
    // Setup test user
    user = await User.create({
      email: 'test@example.com',
      password: 'Test123!',
      name: 'Test User',
      role: 'admin'
    });

    // Generate token
    token = user.generateToken();
  });

  afterAll(async () => {
    await Feature.deleteMany({});
    await User.deleteMany({});
  });

  describe('GET /api/features', () => {
    it('should get all features', async () => {
      // Create test feature
      await Feature.create({
        title: 'Test Feature',
        description: 'Test Description',
        createdBy: user._id
      });

      const res = await request(app)
        .get('/api/features')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should handle empty results', async () => {
      const res = await request(app)
        .get('/api/features')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /api/features', () => {
    it('should create a feature', async () => {
      const res = await request(app)
        .post('/api/features')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'New Feature',
          description: 'New Description'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('New Feature');
    });

    it('should reject invalid input', async () => {
      const res = await request(app)
        .post('/api/features')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'AB', // Too short
          description: ''  // Required
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- feature.test.js

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

---

## 🧹 Code Quality

### Linting

```bash
# Check for errors
npm run lint

# Fix errors automatically
npm run lint:fix
```

### ESLint Rules

```javascript
// .eslintrc.json
{
  "extends": "airbnb-base",
  "env": {
    "node": true,
    "jest": true
  },
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error",
    "no-async-promise-executor": "error"
  }
}
```

---

## 📝 Commit Messages

Follow conventional commits:

```bash
git commit -m "feat: add mood filtering by date range"
git commit -m "fix: resolve assessment score calculation bug"
git commit -m "docs: update API reference documentation"
git commit -m "refactor: simplify user profile controller"
git commit -m "test: add integration tests for auth"
git commit -m "chore: update dependencies"
```

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `refactor` - Code refactoring
- `test` - Adding/updating tests
- `chore` - Build, dependencies

---

## 🔄 Git Workflow

### Create Feature Branch

```bash
git checkout -b feature/add-admin-dashboard
```

### Push to Your Fork

```bash
git add .
git commit -m "feat: add admin dashboard endpoints"
git push origin feature/add-admin-dashboard
```

### Create Pull Request

1. Go to repository on GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill PR template
5. Request reviewers

### PR Template

```markdown
## Description
Brief description of changes

## Type
- [ ] Bug fix
- [ ] New feature
- [ ] Performance improvement
- [ ] Documentation

## Related Issue
Fixes #123

## Testing
Describe how you tested this

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] Backward compatible
```

---

## 🔍 Code Review Checklist

Before submitting PR:

- [ ] Code follows project style guidelines
- [ ] All functions have JSDoc comments
- [ ] No console.log statements
- [ ] Error handling implemented
- [ ] Input validation complete
- [ ] Security considerations addressed
- [ ] Tests added for new features
- [ ] Database indexes considered
- [ ] Performance impact assessed
- [ ] No hardcoded values

---

## 🐛 Reporting Issues

### Issue Template

```markdown
## Description
Clear description of the issue

## Steps to Reproduce
1. Go to endpoint...
2. With data...
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What happens instead

## Environment
- Node version: 18.x
- MongoDB: local/Atlas
- OS: Windows/Mac/Linux

## Error Log
Paste error message

## Additional Context
Any other info
```

---

## 📦 Adding Dependencies

### NPM Packages

```bash
# Add production dependency
npm install package-name

# Add dev dependency
npm install --save-dev package-name

# Update package.json and package-lock.json in commit
git add package.json package-lock.json
```

### Before Adding
- Check if functionality exists in dependencies
- Verify package is well-maintained
- Check for security vulnerabilities
- Consider bundle size impact

---

## 🚀 Performance Best Practices

### Database Queries

```javascript
// ✅ Good - Use indexes, limit fields
const users = await User.find()
  .select('name email role')
  .limit(10)
  .lean();

// ❌ Avoid - Fetch all fields, no limit
const users = await User.find();
```

### Error Handling

```javascript
// ✅ Good
try {
  const result = await Operation();
  return res.json({ success: true, data: result });
} catch (error) {
  logger.error(error);
  return res.status(500).json({ 
    success: false, 
    message: error.message 
  });
}

// ❌ Avoid
try {
  const result = await Operation();
  return res.json(result);
} catch (error) {
  console.log(error); // Insecure logging
}
```

### Async/Await

```javascript
// ✅ Good - Proper async error handling
async function process() {
  try {
    const data = await fetchData();
    const result = await processData(data);
    return result;
  } catch (error) {
    throw new ProcessError(error.message);
  }
}

// ❌ Avoid - Missing error handling
async function process() {
  const data = await fetchData();
  const result = await processData(data);
  return result;
}
```

---

## ♿ Accessibility & Security

### Input Validation

```javascript
// ✅ Always validate input
const { validateEmail, validatePassword } = require('../utils/validators');

if (!validateEmail(email)) {
  throw new BadRequestError('Invalid email format');
}

if (!validatePassword(password)) {
  throw new BadRequestError('Password too weak');
}
```

### Password Security

```javascript
// ✅ Hash passwords with bcrypt
const bcrypt = require('bcryptjs');
const hashedPassword = await bcrypt.hash(password, 10);

// Never store or return plain passwords
user.password = hashedPassword;
delete user.password; // Don't return in response
```

---

## 📚 Resources

- **Express.js Best Practices**: https://expressjs.com/en/advanced/best-practice-security.html
- **MongoDB Best Practices**: https://docs.mongodb.com/manual/core/data-modeling/
- **Node.js Best Practices**: https://github.com/goldbergyoni/nodebestpractices
- **JWT Security**: https://tools.ietf.org/html/rfc7519
- **OWASP Guidelines**: https://owasp.org

---

## 🤝 Getting Help

- **GitHub Issues**: Report bugs or ask questions
- **Discussions**: General discussions and ideas
- **Pull Request Reviews**: Ask for feedback on PRs

---

## 📋 Contributor License Agreement

By contributing, you agree that your contributions will be licensed under the same license as the project (ISC).

---

**Thank you for contributing to Echoes of Resilience! 🚀**

**Last Updated**: January 2026
**Version**: 1.0
