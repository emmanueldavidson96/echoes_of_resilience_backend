# Backend API Reference

Complete API documentation for Echoes of Resilience backend.

---

## Base URL

```
http://localhost:5000/api
```

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer {token}
```

---

## 🔐 Authentication Endpoints

### Register User

```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "role": "youth|coach|parent|clinician"
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "youth"
  }
}
```

---

### Login

```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "role": "youth"
  }
}
```

---

### Logout

```
POST /auth/logout
Authorization: Bearer {token}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### Refresh Token

```
POST /auth/refresh-token
Authorization: Bearer {token}
```

**Response (200 OK)**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### Forgot Password

```
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

### Reset Password

```
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePass123!"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

## 👤 User Endpoints

### Get Current User Profile

```
GET /users/profile
Authorization: Bearer {token}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "youth",
    "profile": {
      "age": 16,
      "school": "Central High School",
      "avatar": "url_to_avatar"
    },
    "stats": {
      "missionsCompleted": 5,
      "totalPoints": 250,
      "currentStreak": 3,
      "assessmentsCompleted": 2
    },
    "createdAt": "2026-01-15T10:30:00Z"
  }
}
```

---

### Update User Profile

```
PUT /users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Updated",
  "profile": {
    "age": 17,
    "school": "Different School"
  }
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { /* updated user object */ }
}
```

---

### Get User by ID

```
GET /users/:id
Authorization: Bearer {token}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": { /* user object */ }
}
```

---

### Delete User Account

```
DELETE /users/:id
Authorization: Bearer {token}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## 📋 Assessment Endpoints

### Submit GAD-7 Assessment

```
POST /assessments/gad7
Authorization: Bearer {token}
Content-Type: application/json

{
  "responses": [2, 1, 3, 0, 2, 1, 2],
  "completedAt": "2026-01-22T10:30:00Z"
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "message": "Assessment submitted successfully",
  "assessment": {
    "id": "607f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "type": "GAD7",
    "responses": [2, 1, 3, 0, 2, 1, 2],
    "score": 12,
    "severity": "moderate",
    "interpretation": "Moderate anxiety symptoms",
    "completedAt": "2026-01-22T10:30:00Z"
  }
}
```

---

### Get GAD-7 Assessments

```
GET /assessments/gad7
Authorization: Bearer {token}
```

**Query Parameters**
- `limit` (default: 10) - Number of records
- `skip` (default: 0) - Number to skip
- `from` - Start date (ISO 8601)
- `to` - End date (ISO 8601)

**Response (200 OK)**
```json
{
  "success": true,
  "data": [
    { /* assessment objects */ }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

---

### Submit PHQ-9 Assessment

```
POST /assessments/phq9
Authorization: Bearer {token}
Content-Type: application/json

{
  "responses": [1, 2, 1, 0, 2, 1, 0, 1, 2],
  "completedAt": "2026-01-22T10:30:00Z"
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "assessment": {
    "id": "607f1f77bcf86cd799439013",
    "type": "PHQ9",
    "score": 11,
    "severity": "mild",
    "interpretation": "Mild depression symptoms"
  }
}
```

---

### Get PHQ-9 Assessments

```
GET /assessments/phq9
Authorization: Bearer {token}
```

---

### Get Specific Assessment

```
GET /assessments/:id
Authorization: Bearer {token}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": { /* assessment object */ }
}
```

---

## 😊 Mood Tracking Endpoints

### Record Mood Entry

```
POST /moods
Authorization: Bearer {token}
Content-Type: application/json

{
  "level": 4,
  "notes": "Feeling good today, completed my mission",
  "recordedAt": "2026-01-22T14:00:00Z"
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "message": "Mood recorded successfully",
  "mood": {
    "id": "707f1f77bcf86cd799439014",
    "userId": "507f1f77bcf86cd799439011",
    "level": 4,
    "notes": "Feeling good today, completed my mission",
    "recordedAt": "2026-01-22T14:00:00Z"
  }
}
```

---

### Get Mood History

```
GET /moods
Authorization: Bearer {token}
```

**Query Parameters**
- `days` (default: 7) - Number of days to retrieve
- `limit` (default: 30) - Max records
- `skip` (default: 0) - Offset

**Response (200 OK)**
```json
{
  "success": true,
  "data": [
    {
      "id": "707f1f77bcf86cd799439014",
      "level": 4,
      "notes": "Feeling good",
      "recordedAt": "2026-01-22T14:00:00Z"
    }
  ],
  "pagination": { /* pagination info */ }
}
```

---

### Delete Mood Entry

```
DELETE /moods/:id
Authorization: Bearer {token}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Mood entry deleted"
}
```

---

## 📔 Journal Endpoints

### Create Journal Entry

```
POST /journals
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "Today I learned to manage my anxiety through breathing exercises...",
  "mood": 4,
  "tags": ["anxiety", "breathing"],
  "createdAt": "2026-01-22T18:00:00Z"
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "message": "Journal entry created",
  "journal": {
    "id": "807f1f77bcf86cd799439015",
    "userId": "507f1f77bcf86cd799439011",
    "content": "Today I learned...",
    "mood": 4,
    "tags": ["anxiety", "breathing"],
    "createdAt": "2026-01-22T18:00:00Z"
  }
}
```

---

### Get Journal Entries

```
GET /journals
Authorization: Bearer {token}
```

**Query Parameters**
- `limit` (default: 10)
- `skip` (default: 0)
- `tags` - Filter by tags

**Response (200 OK)**
```json
{
  "success": true,
  "data": [ /* journal entries */ ],
  "pagination": { /* pagination info */ }
}
```

---

### Get Specific Journal Entry

```
GET /journals/:id
Authorization: Bearer {token}
```

---

### Update Journal Entry

```
PUT /journals/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "Updated content...",
  "mood": 3,
  "tags": ["anxiety"]
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Journal entry updated",
  "data": { /* updated entry */ }
}
```

---

### Delete Journal Entry

```
DELETE /journals/:id
Authorization: Bearer {token}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Journal entry deleted"
}
```

---

## 🎮 Mission Endpoints

### Get Available Missions

```
GET /missions
Authorization: Bearer {token}
```

**Query Parameters**
- `difficulty` - Filter: easy, medium, hard
- `category` - Filter by category
- `completed` - true/false to filter by completion
- `limit` (default: 10)
- `skip` (default: 0)

**Response (200 OK)**
```json
{
  "success": true,
  "data": [
    {
      "id": "907f1f77bcf86cd799439016",
      "title": "Learn Meditation",
      "description": "Practice 10 minutes of meditation",
      "difficulty": "easy",
      "category": "mindfulness",
      "reward": 25,
      "estimatedTime": 10,
      "isCompleted": false
    }
  ],
  "pagination": { /* pagination info */ }
}
```

---

### Get Mission Details

```
GET /missions/:id
Authorization: Bearer {token}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": "907f1f77bcf86cd799439016",
    "title": "Learn Meditation",
    "description": "Practice meditation...",
    "instructions": [ "Step 1", "Step 2", ... ],
    "difficulty": "easy",
    "category": "mindfulness",
    "reward": 25,
    "estimatedTime": 10,
    "completedBy": [
      {
        "userId": "507f1f77bcf86cd799439011",
        "completedAt": "2026-01-20T10:30:00Z"
      }
    ]
  }
}
```

---

### Complete Mission

```
POST /missions/:id/complete
Authorization: Bearer {token}
Content-Type: application/json

{
  "completedAt": "2026-01-22T10:30:00Z",
  "notes": "Optional completion notes"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Mission completed successfully",
  "data": {
    "mission": { /* mission object */ },
    "pointsEarned": 25,
    "newTotalPoints": 275,
    "achievements": [
      {
        "id": "achievement_1",
        "title": "Mindfulness Master",
        "description": "Complete 5 mindfulness missions"
      }
    ]
  }
}
```

---

### Create Mission (Admin/Coach)

```
POST /missions
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "New Challenge",
  "description": "Challenge description",
  "instructions": ["Step 1", "Step 2"],
  "difficulty": "medium",
  "category": "resilience",
  "reward": 50,
  "estimatedTime": 20
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "message": "Mission created",
  "data": { /* mission object */ }
}
```

---

### Update Mission

```
PUT /missions/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  "reward": 75
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Mission updated",
  "data": { /* updated mission */ }
}
```

---

### Delete Mission

```
DELETE /missions/:id
Authorization: Bearer {token}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Mission deleted"
}
```

---

## 📢 Alert Endpoints

### Get User Alerts

```
GET /alerts
Authorization: Bearer {token}
```

**Query Parameters**
- `unread` - true/false to filter unread
- `type` - Filter by alert type
- `limit` (default: 20)

**Response (200 OK)**
```json
{
  "success": true,
  "data": [
    {
      "id": "a07f1f77bcf86cd799439017",
      "userId": "507f1f77bcf86cd799439011",
      "type": "achievement",
      "title": "Badge Earned!",
      "message": "You earned the Resilience Badge",
      "read": false,
      "createdAt": "2026-01-22T10:30:00Z"
    }
  ]
}
```

---

### Mark Alert as Read

```
PUT /alerts/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "read": true
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Alert marked as read"
}
```

---

### Delete Alert

```
DELETE /alerts/:id
Authorization: Bearer {token}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Alert deleted"
}
```

---

## ❌ Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Validation failed",
  "status": 400,
  "errors": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  }
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Invalid or expired token",
  "status": 401
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Insufficient permissions",
  "status": 403
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Resource not found",
  "status": 404
}
```

### 500 Server Error

```json
{
  "success": false,
  "message": "Internal server error",
  "status": 500
}
```

---

## 🧪 Testing Endpoints

### cURL Examples

**Register User**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User",
    "role": "youth"
  }'
```

**Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

**Submit Assessment**
```bash
curl -X POST http://localhost:5000/api/assessments/gad7 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "responses": [2, 1, 3, 0, 2, 1, 2]
  }'
```

---

## 📊 Common Query Patterns

### Filter by Date Range
```
GET /assessments/gad7?from=2026-01-01&to=2026-01-31
```

### Pagination
```
GET /missions?limit=20&skip=20  # Get items 21-40
```

### Multiple Filters
```
GET /missions?difficulty=medium&category=resilience&completed=false
```

---

## 🔄 Rate Limiting

- Default: 100 requests per 15 minutes per IP
- Protected endpoints may have stricter limits

---

**Last Updated**: January 2026
**Version**: 1.0
**Backend Version**: 1.0.0
