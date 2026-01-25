# API Integration Guide

This document outlines how to integrate the Echoes of Resilience backend API with your Next.js frontend.

## Base URL Configuration

Set your API base URL in your frontend environment:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_API_PREFIX=/api
```

## Authentication Flow

### 1. Register
```typescript
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "role": "youth",
  "dateOfBirth": "2010-05-15"
}

Response:
{
  "success": true,
  "token": "eyJhbGc...",
  "user": { ...user object }
}
```

### 2. Login
```typescript
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123"
}

Response:
{
  "success": true,
  "token": "eyJhbGc...",
  "user": { ...user object }
}
```

### 3. Store Token
The token will be stored in:
- **HttpOnly Cookie**: `token` (automatic with credentials: 'include')
- **Local Storage** (optional): For manual token management

### 4. Send Token with Requests
```typescript
// Using Authorization header
fetch('/api/users/profile', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  credentials: 'include'
})

// OR use httpOnly cookies (automatic with credentials: 'include')
fetch('/api/users/profile', {
  credentials: 'include'
})
```

## Frontend Integration Examples

### Create API Client (TypeScript)

```typescript
// lib/api.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const response = await apiClient.post('/auth/refresh-token');
        localStorage.setItem('token', response.data.token);
        return apiClient(error.config);
      } catch (err) {
        // Redirect to login
        window.location.href = '/sign-in';
      }
    }
    return Promise.reject(error);
  }
);
```

### Authentication Hook

```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import type { IUser } from '@echoes-backend/types';

export const useAuth = () => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiClient.get('/auth/me');
        setUser(response.data.data.user);
      } catch (err) {
        setError(err?.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      setError(err?.response?.data?.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
      localStorage.removeItem('token');
      setUser(null);
    } catch (err) {
      setError(err?.message);
    }
  };

  return { user, loading, error, login, logout };
};
```

### Mission Service

```typescript
// services/missions.ts
import { apiClient } from '@/lib/api';
import type { IMission } from '@echoes-backend/types';

export const missionsService = {
  getAll: async (filters?: any) => {
    const response = await apiClient.get('/missions', { params: filters });
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/missions/${id}`);
    return response.data.data;
  },

  create: async (mission: Partial<IMission>) => {
    const response = await apiClient.post('/missions', mission);
    return response.data.data;
  },

  update: async (id: string, mission: Partial<IMission>) => {
    const response = await apiClient.put(`/missions/${id}`, mission);
    return response.data.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/missions/${id}`);
  },

  complete: async (id: string, score?: number) => {
    const response = await apiClient.post(`/missions/${id}/complete`, { score });
    return response.data.data;
  },

  getLeaderboard: async (id: string, limit?: number) => {
    const response = await apiClient.get(`/missions/${id}/leaderboard`, {
      params: { limit }
    });
    return response.data.data;
  }
};
```

### Mood Tracking

```typescript
// services/mood.ts
import { apiClient } from '@/lib/api';
import type { IMoodEntry } from '@echoes-backend/types';

export const moodService = {
  logMood: async (mood: Partial<IMoodEntry>) => {
    const response = await apiClient.post('/moods', mood);
    return response.data.data;
  },

  getEntries: async (page = 1, limit = 20) => {
    const response = await apiClient.get('/moods', {
      params: { page, limit }
    });
    return response.data.data;
  },

  getHistory: async (days = 30) => {
    const response = await apiClient.get('/moods/history', {
      params: { days }
    });
    return response.data.data;
  },

  getTrends: async (days = 7) => {
    const response = await apiClient.get('/moods/trends', {
      params: { days }
    });
    return response.data.data;
  }
};
```

## CORS Configuration

The backend is configured to accept requests from your frontend. If you encounter CORS errors:

1. Verify `FRONTEND_URL` in `.env` matches your frontend URL
2. Ensure your frontend sends requests with `credentials: 'include'`
3. Check browser console for specific CORS error details

## Error Handling

```typescript
try {
  await apiClient.post('/auth/login', credentials);
} catch (error) {
  if (error.response?.status === 401) {
    // Unauthorized
  } else if (error.response?.status === 400) {
    // Validation error
    const errors = error.response.data.errors;
  } else if (error.response?.status === 403) {
    // Forbidden
  } else if (error.response?.status === 500) {
    // Server error
  }
}
```

## Testing with cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePassword123",
    "role": "youth"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'

# Get profile (with token)
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## WebSocket Support (Optional Future Enhancement)

For real-time features like live notifications or collaborative features, consider adding Socket.io:

```bash
npm install socket.io socket.io-client
```

## Rate Limiting

The API implements rate limiting. If you receive a 429 status:
- Wait before retrying
- Implement exponential backoff in your client
- Contact support if you need higher limits

