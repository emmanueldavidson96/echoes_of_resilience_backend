---
description: Repository Information Overview
alwaysApply: true
---

# Echoes of Resilience Backend Information

## Summary
The **Echoes of Resilience Backend** is an **Express.js** application serving as the API for a gamified Social-Emotional Learning (SEL) platform. It follows a modular architecture using **ES Modules** and integrates with **MongoDB** via **Mongoose** for data persistence. The platform supports various user roles including Youth, Parent, Coach, Clinician, and Admin, providing features like mission tracking, journaling, mood logging, and assessment management.

## Structure
The project is organized into a standard Express.js directory structure:
- **`src/server.js`**: Main entry point where the Express app is initialized and server is started.
- **`src/config/`**: Contains configuration files, primarily `database.js` for MongoDB connection.
- **`src/controllers/`**: Contains route handlers (business logic) for different features (auth, user, mission, etc.).
- **`src/middleware/`**: Custom middleware for authentication (JWT), error handling, and input validation.
- **`src/models/`**: Mongoose schemas defining the data structure for Users, Missions, Journals, Assessments, etc.
- **`src/routes/`**: Express route definitions mapping endpoints to controller functions.
- **`src/utils/`**: Utility functions and custom validators.

## Language & Runtime
**Language**: JavaScript (ES Modules)  
**Version**: Node.js 16+ (specified in README)  
**Build System**: Node.js  
**Package Manager**: npm

## Dependencies
**Main Dependencies**:
- **`express`** (^5.2.1): Web framework.
- **`mongoose`** (^9.1.5): MongoDB object modeling.
- **`jsonwebtoken`** (^9.0.3): JWT implementation for auth.
- **`bcryptjs`** (^3.0.3): Password hashing.
- **`cors`** (^2.8.5): Cross-Origin Resource Sharing.
- **`dotenv`** (^17.2.3): Environment variable management.
- **`morgan`** (^1.10.1): HTTP request logging.
- **`cookie-parser`** (^1.4.7): Cookie parsing middleware.
- **`express-validator`** (^7.3.1): Input validation.

**Development Dependencies**:
- **`nodemon`** (^3.0.1): Development server auto-restart.
- **`eslint`** (^8.50.0): Linting tool.

## Build & Installation
```bash
# Installation
npm install

# Configuration
cp .env.example .env

# Run Development Server
npm run dev

# Run Production Server
npm start

# Linting
npm run lint
```

## Testing
**Framework**: The `README.md` mentions `npm test`, but no test script is currently defined in `package.json`, and no dedicated test files were found in the source tree.

## Main Files & Resources
- **`src/server.js`**: Main executable.
- **`package.json`**: Project metadata and dependencies.
- **`.env.example`**: Template for environment variables including `MONGO_URI`, `JWT_SECRET`, and `PORT`.
- **`API_INTEGRATION.md` / `ARCHITECTURE_REFERENCE.md`**: Detailed technical documentation.
