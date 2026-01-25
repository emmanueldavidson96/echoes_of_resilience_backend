# Mission Progress Route Fix - January 22, 2026

## Problem
When clicking "Confirm" on Day 1 to submit mission progress, the app was throwing a **404 error**:
```
Error updating mission progress: AxiosError - Request failed with status code 404
```

## Root Cause
**Express route ordering issue**: In the missions routes file, the user-specific routes (`/user/active`, `/user/completed`, `/user/history`) were defined **after** the parameterized routes (`/:missionId/start`, `/:missionId/progress`).

Express matches routes **in order**, so when the frontend tried to hit:
```
GET /api/missions/user/active
```

Express was matching it against `/:missionId/...` first and treating `"user"` as a missionId parameter, which didn't exist → 404 error!

## Solution
Reordered routes in `src/routes/missions.js` to put **more specific routes before generic routes**:

### Before (❌ Wrong)
```javascript
router.post('/:missionId/start', authorize('youth'), startMission);
router.post('/:missionId/progress', authorize('youth'), recordMissionProgress);
router.get('/:missionId/user-progress', authorize('youth'), getUserMissionProgress);
router.get('/user/active', authorize('youth'), getUserActiveMissions);        // ❌ Matched as /:missionId
router.get('/user/completed', authorize('youth'), getUserCompletedMissions);  // ❌ Matched as /:missionId
router.get('/user/history', authorize('youth'), getUserMissionHistory);       // ❌ Matched as /:missionId
```

### After (✅ Correct)
```javascript
// User mission queries (MUST be before /:missionId routes)
router.get('/user/active', authorize('youth'), getUserActiveMissions);       // ✅ Specific path
router.get('/user/completed', authorize('youth'), getUserCompletedMissions); // ✅ Specific path
router.get('/user/history', authorize('youth'), getUserMissionHistory);      // ✅ Specific path

// Mission progress tracking (parameterized routes)
router.post('/:missionId/start', authorize('youth'), startMission);
router.post('/:missionId/progress', authorize('youth'), recordMissionProgress);
router.get('/:missionId/user-progress', authorize('youth'), getUserMissionProgress);
```

## Route Priority (Correct Order)
```
1. Public routes (no params)
   GET /
   GET /search
   
2. Public parameterized routes
   GET /:id
   GET /:id/leaderboard
   
3. Protected specific routes (/user/...)
   GET /user/active
   GET /user/completed
   GET /user/history
   
4. Protected parameterized routes (/:missionId/...)
   POST /:missionId/start
   POST /:missionId/progress
   GET /:missionId/user-progress
   
5. Legacy routes
   POST /:id/complete
   
6. Admin routes
   POST /
   PUT /:id
   DELETE /:id
```

## To Apply Fix

1. **Restart backend server**:
   ```bash
   cd echoes_of_resilience_backend
   npm run dev
   ```

2. **Clear frontend cache** (optional but recommended):
   - Hard refresh in browser (Ctrl+Shift+R on Windows)

3. **Test again**:
   - Navigate to mission detail page
   - Click "Start Mission"
   - Click Day 1 and mark as done
   - Should now work! ✅

## Files Changed
- `echoes_of_resilience_backend/src/routes/missions.js` - Reordered routes

## Express Route Matching Rules
- Express matches routes **top to bottom**
- First matching route wins
- `:param` matches any value (including "user")
- Specific paths (`/user/...`) must come before generic params (`/:missionId/...`)

---

**Status**: ✅ Fixed and Ready to Test

