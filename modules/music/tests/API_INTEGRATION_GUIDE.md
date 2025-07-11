# 🔌 API Integration Guide - PulseZen Music Module

## Overview

This guide provides step-by-step instructions for transitioning the PulseZen Music Module from mock data to production API integration.

## 🏗️ Current Architecture

The music module is built with a clean separation between data layer and UI components:

```
📁 services/
├── MusicService.ts      # Main service (consumes MusicApiService)
├── MusicApiService.ts   # API abstraction layer (ready for real API)
└── MusicMock.ts         # Mock data (to be replaced)

📁 models/
├── ApiModels.ts         # API response types and mappers
└── index.ts             # Model exports
```

## 🔄 Integration Steps

### Step 1: Configure Environment Variables

Create or update your environment configuration:

```typescript
// .env or constants/config.ts
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.yourserver.com',
  API_KEY: process.env.EXPO_PUBLIC_API_KEY,
  VERSION: 'v1',
  TIMEOUT: 10000,
}
```

### Step 2: Update MusicApiService.ts

Replace the mock implementation with real API calls:

```typescript
// modules/music/services/MusicApiService.ts

class MusicApiService {
  private baseUrl = API_CONFIG.BASE_URL;
  private apiKey = API_CONFIG.API_KEY;

  // BEFORE (mock):
  async getCategories(): Promise<ApiMusicCategory[]> {
    return Promise.resolve(mockCategories);
  }

  // AFTER (real API):
  async getCategories(): Promise<ApiMusicCategory[]> {
    try {
      const response = await fetch(`${this.baseUrl}/music/categories`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }

      const data = await response.json();
      return data.categories || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to mock data in case of error
      return mockCategories;
    }
  }

  // Repeat for other methods...
}
```

### Step 3: API Endpoint Mapping

Update each method in `MusicApiService.ts`:

```typescript
class MusicApiService {
  // Categories
  async getCategories(): Promise<ApiMusicCategory[]> {
    return this.fetchData('/music/categories');
  }

  // Tracks by category
  async getCategoryTracks(categoryId: string): Promise<ApiMusicTrack[]> {
    return this.fetchData(`/music/categories/${categoryId}/tracks`);
  }

  // User playlists
  async getPlaylists(userId?: string): Promise<ApiPlaylist[]> {
    const endpoint = userId 
      ? `/music/playlists?userId=${userId}`
      : '/music/playlists';
    return this.fetchData(endpoint);
  }

  // Search functionality
  async searchTracks(query: string): Promise<ApiMusicTrack[]> {
    return this.fetchData(`/music/search?q=${encodeURIComponent(query)}`);
  }

  // Generic fetch method
  private async fetchData(endpoint: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: API_CONFIG.TIMEOUT,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  }
}
```

### Step 4: Update API Models

Ensure your API models match the real API response structure:

```typescript
// modules/music/models/ApiModels.ts

// Update these interfaces to match your actual API responses:
export interface ApiMusicCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  cover_image_url?: string;
  track_count: number;
  created_at: string;
  updated_at: string;
}

export interface ApiMusicTrack {
  id: string;
  title: string;
  artist_name: string;
  artist_id: string;
  duration_seconds: number;
  file_url: string;
  cover_image_url?: string;
  category_id: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ApiPlaylist {
  id: string;
  name: string;
  description: string;
  user_id: string;
  track_ids: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}
```

### Step 5: Add Error Handling & Retry Logic

Enhance error handling for production:

```typescript
// modules/music/services/MusicApiService.ts

class MusicApiService {
  private async fetchWithRetry(
    endpoint: string, 
    options: RequestInit = {},
    retries: number = 3
  ): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        if (response.ok) {
          return response;
        }

        // If it's a 4xx error, don't retry
        if (response.status >= 400 && response.status < 500) {
          throw new Error(`Client Error: ${response.status}`);
        }

        // For 5xx errors, retry
        if (i === retries - 1) {
          throw new Error(`Server Error: ${response.status}`);
        }
      } catch (error) {
        if (i === retries - 1) {
          throw error;
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    
    throw new Error('Max retries exceeded');
  }
}
```

### Step 6: Add Caching Layer (Optional)

Implement caching for better performance:

```typescript
// utils/cache.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

class CacheService {
  private static CACHE_PREFIX = 'music_cache_';
  private static DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  static async get<T>(key: string): Promise<T | null> {
    try {
      const cachedData = await AsyncStorage.getItem(this.CACHE_PREFIX + key);
      if (!cachedData) return null;

      const { data, timestamp, ttl } = JSON.parse(cachedData);
      
      if (Date.now() - timestamp > ttl) {
        await this.remove(key);
        return null;
      }

      return data;
    } catch {
      return null;
    }
  }

  static async set<T>(key: string, data: T, ttl = this.DEFAULT_TTL): Promise<void> {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      await AsyncStorage.setItem(this.CACHE_PREFIX + key, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  static async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.CACHE_PREFIX + key);
    } catch (error) {
      console.error('Cache remove error:', error);
    }
  }
}

// Update MusicApiService to use caching:
class MusicApiService {
  async getCategories(): Promise<ApiMusicCategory[]> {
    const cacheKey = 'categories';
    
    // Try cache first
    const cached = await CacheService.get<ApiMusicCategory[]>(cacheKey);
    if (cached) return cached;

    // Fetch from API
    const data = await this.fetchData('/music/categories');
    
    // Cache the result
    await CacheService.set(cacheKey, data);
    
    return data;
  }
}
```

## 🔧 Configuration Examples

### Environment Variables (.env)

```bash
# Development
EXPO_PUBLIC_API_BASE_URL=https://dev-api.yourserver.com
EXPO_PUBLIC_API_KEY=your_dev_api_key

# Production
EXPO_PUBLIC_API_BASE_URL=https://api.yourserver.com
EXPO_PUBLIC_API_KEY=your_prod_api_key
```

### Expected API Endpoints

```
GET /music/categories
Response: {
  categories: ApiMusicCategory[]
}

GET /music/categories/:id/tracks
Response: {
  tracks: ApiMusicTrack[]
}

GET /music/playlists?userId=:userId
Response: {
  playlists: ApiPlaylist[]
}

GET /music/search?q=:query
Response: {
  tracks: ApiMusicTrack[]
}

POST /music/playlists
Body: {
  name: string,
  description: string,
  trackIds: string[]
}
Response: {
  playlist: ApiPlaylist
}
```

## 🧪 Testing API Integration

### Step 1: Test with Postman/Insomnia

Before integrating, test your API endpoints:

```bash
# Test categories endpoint
curl -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     https://api.yourserver.com/music/categories
```

### Step 2: Gradual Rollout

Implement feature flags to gradually enable API integration:

```typescript
// constants/features.ts
export const FEATURES = {
  USE_REAL_API: __DEV__ ? false : true, // Enable in production only
  USE_CACHE: true,
  ENABLE_OFFLINE_MODE: true,
};

// In MusicApiService.ts
class MusicApiService {
  async getCategories(): Promise<ApiMusicCategory[]> {
    if (!FEATURES.USE_REAL_API) {
      return mockCategories; // Fallback to mock data
    }
    
    try {
      return await this.fetchData('/music/categories');
    } catch (error) {
      console.warn('API failed, using mock data:', error);
      return mockCategories; // Graceful fallback
    }
  }
}
```

### Step 3: Monitor and Log

Add monitoring for API performance:

```typescript
// utils/monitoring.ts
class ApiMonitoring {
  static logApiCall(endpoint: string, duration: number, success: boolean) {
    const logData = {
      endpoint,
      duration,
      success,
      timestamp: new Date().toISOString(),
    };
    
    // Send to your analytics service
    console.log('API Call:', logData);
  }
}

// In MusicApiService.ts
class MusicApiService {
  private async fetchData(endpoint: string): Promise<any> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        // ... fetch options
      });
      
      const duration = Date.now() - startTime;
      ApiMonitoring.logApiCall(endpoint, duration, response.ok);
      
      return await response.json();
    } catch (error) {
      const duration = Date.now() - startTime;
      ApiMonitoring.logApiCall(endpoint, duration, false);
      throw error;
    }
  }
}
```

## ✅ Integration Checklist

- [ ] Environment variables configured
- [ ] API endpoints tested with Postman/Insomnia
- [ ] MusicApiService.ts updated with real API calls
- [ ] API models match actual response structure
- [ ] Error handling and retry logic implemented
- [ ] Caching layer added (optional)
- [ ] Feature flags for gradual rollout
- [ ] Monitoring and logging in place
- [ ] Fallback to mock data on API failure
- [ ] Performance testing completed
- [ ] Security review of API integration

## 🚨 Important Notes

1. **Always maintain mock data fallback** - The app should continue working even if the API is down
2. **Test thoroughly** - Test all user flows with the real API before deploying
3. **Monitor performance** - Track API response times and error rates
4. **Handle rate limiting** - Implement proper rate limiting and backoff strategies
5. **Secure API keys** - Never commit API keys to version control

## 🔗 Related Files

- `modules/music/services/MusicApiService.ts` - Main API integration file
- `modules/music/models/ApiModels.ts` - API response type definitions
- `modules/music/services/MusicService.ts` - Service layer (no changes needed)
- `constants/config.ts` - Environment configuration

---

Following this guide will ensure a smooth transition from mock data to production API while maintaining the robust architecture and user experience of the PulseZen Music Module.
