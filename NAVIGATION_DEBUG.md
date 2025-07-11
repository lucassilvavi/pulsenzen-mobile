# Debugging Navigation Issues

## Problem Description
Users are being redirected to onboarding/auth after completing registration and setup, instead of going to the home screen.

## Root Cause Analysis

### Issue 1: Multiple Sources of Truth
The app was checking both:
- AuthContext for authentication state
- AsyncStorage directly for onboarding state

This created race conditions and inconsistent navigation logic.

### Issue 2: Navigation Logic in Wrong Component
The navigation logic was in the main _layout.tsx instead of being properly integrated with the AuthContext.

## Solution Implemented

### 1. Centralized Navigation Logic
- Created `NavigationHandler` component that uses AuthContext
- Moved all navigation logic to use consistent state sources

### 2. Enhanced AuthContext
- Added `markOnboardingComplete()` function
- Updated User interface to include `onboardingComplete` flag
- Better integration between auth and onboarding states

### 3. Updated AuthService
- Added `markOnboardingComplete()` method
- Updates both user data and AsyncStorage consistently

### 4. Fixed Setup Flow
- Setup screen now calls `markOnboardingComplete()` from context
- Ensures state is updated before navigation

## Navigation Flow

```
App Start
├── AuthProvider loads user state
├── NavigationHandler checks auth + onboarding
├── Not authenticated → /onboarding/welcome
├── Authenticated + no onboarding → /onboarding/setup  
└── Authenticated + onboarding done → / (home)

Registration
├── User registers → AuthContext.register()
├── Token + user saved to AsyncStorage
├── User redirected to /onboarding/setup

Setup Complete
├── User completes setup → markOnboardingComplete()
├── onboardingDone saved to AsyncStorage
├── User data updated with onboardingComplete: true
├── NavigationHandler detects change
└── User redirected to / (home)
```

## Key Changes Made

### /app/_layout.tsx
- Created `NavigationHandler` component
- Uses AuthContext instead of direct AsyncStorage checks
- Re-checks onboarding status when user changes

### /context/AuthContext.tsx
- Added `markOnboardingComplete()` function
- Enhanced User interface

### /services/authService.ts
- Added `markOnboardingComplete()` method
- Updates user data and AsyncStorage

### /app/onboarding/setup.tsx
- Uses `markOnboardingComplete()` from context
- Removes direct AsyncStorage manipulation

## Testing the Fix

1. **Fresh Install**: Should go to welcome screen
2. **Register New User**: Should go to setup after registration
3. **Complete Setup**: Should go to home screen
4. **Restart App**: Should stay on home screen (persistent login + onboarding)
5. **Logout**: Should go back to welcome screen

## Debugging Commands

### Check AsyncStorage State
```javascript
// In React Native Debugger console
import AsyncStorage from '@react-native-async-storage/async-storage';

// Check auth token
AsyncStorage.getItem('@pulsezen_auth_token').then(console.log);

// Check user data
AsyncStorage.getItem('@pulsezen_user_data').then(data => console.log(JSON.parse(data)));

// Check onboarding status
AsyncStorage.getItem('onboardingDone').then(console.log);
```

### Clear State (for testing)
```javascript
// Clear all app data
AsyncStorage.multiRemove([
  '@pulsezen_auth_token',
  '@pulsezen_user_data', 
  'onboardingDone'
]).then(() => console.log('State cleared'));
```

## Expected Behavior After Fix

✅ Register → Setup → Home (no redirects)
✅ Login → Home (if onboarding already done)
✅ App restart → Stay logged in and on correct screen
✅ Logout → Return to welcome screen
✅ No infinite redirect loops
