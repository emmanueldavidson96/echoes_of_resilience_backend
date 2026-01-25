# Mission Progress System - API Documentation

## Overview
The Mission Progress System enables youth users to track daily mission completion with gamification, XP rewards, and progress persistence to MongoDB.

## Backend Models

### UserMissionProgress Model
**File**: `src/models/UserMissionProgress.js`

Tracks user's daily progress on each mission:
```javascript
{
  userId: ObjectId,              // Reference to User
  missionId: ObjectId,           // Reference to Mission
  startDate: Date,               // When user started the mission
  endDate: Date,                 // Calculated deadline based on mission duration
  progress: [                    // Array of daily progress objects
    {
      day: Number,               // Day 1-N
      completed: Boolean,        // User marked as done
      skipped: Boolean,          // User skipped this day
      note: String,              // User's explanation/reflection
      timestamp: Date            // When action was recorded
    }
  ],
  status: String,                // "active" | "completed" | "failed"
  completionPercentage: Number,  // 0-100
  xpEarned: Number,              // XP awarded (if completed ≥80%)
  xpAwarded: Boolean,            // Has XP been given to user?
  completedAt: Date,             // When mission finished
  retryCount: Number,            // Times user restarted after failure
  lastRetryDate: Date,           // Track cooldown period
  createdAt: Date,
  updatedAt: Date
}
```

## Backend API Endpoints

### 1. Start Mission
**Endpoint**: `POST /api/missions/:missionId/start`
**Auth**: Required (Youth user)
**Purpose**: Initialize user progress when starting a mission

**Request**:
```bash
curl -X POST http://localhost:5000/api/missions/[missionId]/start \
  -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json"
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Mission started successfully",
  "data": {
    "_id": "...",
    "userId": "...",
    "missionId": "...",
    "startDate": "2026-01-22T10:00:00Z",
    "endDate": "2026-02-12T10:00:00Z",
    "progress": [
      {
        "day": 1,
        "completed": false,
        "skipped": false,
        "note": "",
        "timestamp": null
      },
      // ... more days
    ],
    "status": "active",
    "completionPercentage": 0,
    "xpEarned": 0,
    "xpAwarded": false
  }
}
```

### 2. Record Mission Progress
**Endpoint**: `POST /api/missions/:missionId/progress`
**Auth**: Required (Youth user)
**Purpose**: Record daily action (done/skip with note)

**Request Body**:
```json
{
  "day": 1,
  "completed": true,
  "skipped": false,
  "note": "Completed all breathing exercises successfully!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Mission progress recorded successfully",
  "data": {
    "_id": "...",
    "userId": "...",
    "missionId": "...",
    "progress": [
      {
        "day": 1,
        "completed": true,
        "skipped": false,
        "note": "Completed all breathing exercises successfully!",
        "timestamp": "2026-01-22T10:15:00Z"
      }
      // ... more days
    ],
    "completionPercentage": 5,
    "status": "active",
    "xpEarned": 0,
    "xpAwarded": false
  }
}
```

### 3. Get User's Mission Progress
**Endpoint**: `GET /api/missions/:missionId/user-progress`
**Auth**: Required (Youth user)
**Purpose**: Fetch user's current progress on a specific mission

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Mission progress retrieved successfully",
  "data": {
    "_id": "...",
    "userId": "...",
    "missionId": { /* full mission object */ },
    "progress": [ /* all days with user actions */ ],
    "completionPercentage": 45,
    "status": "active",
    "xpEarned": 0,
    "xpAwarded": false
  }
}
```

### 4. Get All User's Active Missions
**Endpoint**: `GET /api/missions/user/active`
**Auth**: Required (Youth user)
**Purpose**: Fetch all currently active missions for user

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Active missions retrieved successfully",
  "data": [
    {
      "_id": "...",
      "userId": "...",
      "missionId": { /* mission details */ },
      "completionPercentage": 25,
      "status": "active"
    }
    // ... more active missions
  ]
}
```

### 5. Get All User's Completed Missions
**Endpoint**: `GET /api/missions/user/completed`
**Auth**: Required (Youth user)
**Purpose**: Fetch all completed missions with XP earned

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Completed missions retrieved successfully",
  "data": [
    {
      "_id": "...",
      "userId": "...",
      "missionId": { /* mission details */ },
      "completionPercentage": 95,
      "xpEarned": 500,
      "xpAwarded": true,
      "status": "completed",
      "completedAt": "2026-01-20T18:30:00Z"
    }
    // ... more completed missions
  ]
}
```

### 6. Get User's Mission History
**Endpoint**: `GET /api/missions/user/history?page=1&limit=10`
**Auth**: Required (Youth user)
**Purpose**: Paginated history of all user's missions

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Mission history retrieved successfully",
  "data": {
    "missions": [ /* missions array */ ],
    "totalPages": 5,
    "currentPage": 1,
    "total": 47
  }
}
```

## Frontend Integration

### Mission Detail Page
**File**: `app/dashboard/dashboard-youth/missions/[missionId]/page.tsx`

#### Key Features Implemented:

1. **Fetch Mission Data on Load**
   - Gets mission details from `/api/missions/:missionId`
   - Fetches user's progress from `/api/missions/:missionId/user-progress`
   - Initializes with 21-day tracker if no progress exists

2. **Start Mission Button**
   - Appears when user hasn't started (0% completion)
   - Calls `POST /api/missions/:missionId/start`
   - Initializes full progress array in database

3. **Daily Tracker UI**
   - 7-column grid showing all mission days
   - Visual indicators: ✓ (completed), ✗ (skipped), empty (pending)
   - Click any day to mark done/skip

4. **Note Modal**
   - User enters note explaining achievement or skip reason
   - Submits with `POST /api/missions/:missionId/progress`
   - Backend calculates completion percentage
   - Updates mission status when conditions met

5. **Real-Time Status Updates**
   - Progress bar shows live completion %
   - Color coding: Green (≥80%), Red (<80%)
   - XP Reward status updates when 80% threshold reached
   - Mission marked "Accomplished" at 100% or when last day hits 80%

6. **Data Persistence**
   - All daily actions stored in MongoDB
   - User's XP updated immediately upon qualification
   - Mission history available for future reference

## Completion Logic

### XP Qualification
- **Threshold**: 80% or more days completed
- **Reward**: Mission's configured XP points
- **Trigger**: Automatic when:
  - User reaches 80% completion, OR
  - User completes final day with ≥80% overall

### Mission Status Transitions
```
active → completed (when ≥80% and all days done)
       → failed (when ≥80% threshold not met and days finished)
```

### Retry Rules
- **Failed** (<80%): Can retry immediately
- **Completed** (≥80%): Can retry after 14 days (future enhancement)

## Data Flow Example

### User Completes 21-Day Mission

1. **Start Mission** (Day 1, 8:00 AM)
   ```
   Click "Start Mission"
   → POST /api/missions/[id]/start
   → Creates UserMissionProgress with 21 empty days
   ```

2. **Day 1 - Mark Done** (Day 1, 5:00 PM)
   ```
   Click Day 1 → Modal → Enter note → Submit
   → POST /api/missions/[id]/progress
   → progress[0] = {day:1, completed:true, note:"...", timestamp:now}
   → completionPercentage = 5% (1/21)
   → Status: active
   ```

3. **Days 2-20 - Continue** (each day)
   ```
   POST /api/missions/[id]/progress
   → completionPercentage increases each day
   ```

4. **Day 17** (80% threshold reached)
   ```
   completedDays = 17, completionPercentage = 81%
   → "Reward Qualified" badge appears in UI
   ```

5. **Day 21 - Complete** (final day)
   ```
   POST /api/missions/[id]/progress (day 21)
   → completionPercentage = 100%
   → status = "completed"
   → xpAwarded = true
   → User's totalXP += mission.rewards.points (500)
   → User's level recalculates
   ```

6. **Mission History** (any time after)
   ```
   GET /api/missions/user/completed
   → Returns mission with xpEarned: 500
   ```

## Error Handling

### Common Error Responses

**400 Bad Request** - Missing required fields:
```json
{
  "success": false,
  "message": "Day and action (completed/skipped) are required"
}
```

**404 Not Found** - Mission or progress not found:
```json
{
  "success": false,
  "message": "Active mission progress not found"
}
```

**400 Conflict** - Already has active mission:
```json
{
  "success": false,
  "message": "You already have an active mission. Complete or fail it before starting again."
}
```

## Testing the System

### Via cURL

**1. Get a mission ID**
```bash
curl http://localhost:5000/api/missions \
  -H "Content-Type: application/json" | jq '.data.missions[0]._id'
```

**2. Start a mission**
```bash
MISSION_ID="[from step 1]"
curl -X POST http://localhost:5000/api/missions/$MISSION_ID/start \
  -H "Authorization: Bearer [user_token]" \
  -H "Content-Type: application/json"
```

**3. Record progress**
```bash
curl -X POST http://localhost:5000/api/missions/$MISSION_ID/progress \
  -H "Authorization: Bearer [user_token]" \
  -H "Content-Type: application/json" \
  -d '{
    "day": 1,
    "completed": true,
    "skipped": false,
    "note": "Great session today!"
  }'
```

**4. Get progress**
```bash
curl http://localhost:5000/api/missions/$MISSION_ID/user-progress \
  -H "Authorization: Bearer [user_token]"
```

## Database Indexes

The UserMissionProgress model has optimized indexes for fast queries:
- `userId + missionId` - Quick lookup of specific user's mission progress
- `userId + status` - Fast retrieval of active/completed missions

## Next Steps

1. **Implement Retry Logic** - Add cooldown logic for failed missions
2. **Achievement Badges** - Award badges at specific milestones (3 missions, 10 missions, etc.)
3. **Leaderboards** - Show top users by XP earned from missions
4. **Notifications** - Send reminders for active missions nearing deadline
5. **Analytics** - Track completion rates, popular missions, etc.

