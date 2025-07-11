# Test Flow - Register and Login

## Expected Behavior

### New User Registration Flow:
1. User opens app → Welcome screen
2. User taps "Criar conta" → Auth screen (Register mode)
3. User fills registration form → Taps register
4. Registration success → Redirects to Setup screen
5. User completes setup → Redirects to Home
6. App restart → Goes directly to Home (persistent login + onboarding done)

### Existing User Login Flow:
1. User opens app → Welcome screen  
2. User taps "Entrar" → Auth screen (Login mode)
3. User fills login form → Taps login
4. Login success → Redirects to Home (if onboarding already done)
5. App restart → Goes directly to Home

## Current Issues Fixed:

### Issue 1: Registration going directly to Home
**Problem**: New users were skipping onboarding setup
**Solution**: 
- AuthService.register() now clears 'onboardingDone' from AsyncStorage
- Auth screen only redirects new registrations to setup
- NavigationHandler properly checks onboarding status

### Issue 2: Login redirecting to Setup
**Problem**: Existing users were forced to go through setup again
**Solution**:
- Auth screen no longer forces login to go to setup
- NavigationHandler decides based on onboarding status
- Login users with completed onboarding go directly to home

## Debug Commands

### Check AsyncStorage State (React Native Debugger):
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Check all auth-related keys
const checkAuthState = async () => {
  const token = await AsyncStorage.getItem('@pulsezen_auth_token');
  const user = await AsyncStorage.getItem('@pulsezen_user_data');
  const onboarding = await AsyncStorage.getItem('onboardingDone');
  
  console.log('Auth State:', {
    hasToken: !!token,
    user: user ? JSON.parse(user) : null,
    onboardingDone: onboarding
  });
};

checkAuthState();
```

### Clear State (for testing):
```javascript
// Clear all data to test fresh registration
AsyncStorage.multiRemove([
  '@pulsezen_auth_token',
  '@pulsezen_user_data', 
  'onboardingDone'
]).then(() => console.log('State cleared - test fresh registration'));
```

### Simulate Existing User:
```javascript
// Simulate user who completed onboarding
AsyncStorage.multiSet([
  ['@pulsezen_auth_token', 'fake-token'],
  ['@pulsezen_user_data', JSON.stringify({id: '1', email: 'test@test.com'})],
  ['onboardingDone', 'true']
]).then(() => console.log('Existing user state set - test login flow'));
```

## Test Cases

### Test 1: Fresh App Install (New User)
1. Clear all AsyncStorage data
2. Open app → Should show Welcome
3. Register new account → Should go to Setup
4. Complete setup → Should go to Home
5. Restart app → Should stay on Home

### Test 2: Existing User Login
1. Set up existing user state (token + onboardingDone: true)
2. Clear token to simulate logout
3. Open app → Should show Welcome
4. Login with existing account → Should go directly to Home

### Test 3: Interrupted Registration
1. Clear all data
2. Register new account → Should go to Setup
3. Force close app during setup
4. Reopen app → Should be authenticated but go back to Setup

### Test 4: Fresh Registration after Logout
1. Complete a full registration + setup + logout
2. Register with new email → Should go to Setup (not Home)

## Navigation Logic Summary

```typescript
// In NavigationHandler (_layout.tsx)
if (!isAuthenticated) {
  → Welcome screen
} else if (isAuthenticated && !onboardingDone) {
  → Setup screen  
} else if (isAuthenticated && onboardingDone) {
  → Home screen
}
```

## Key Changes Made

### services/authService.ts
- register() now clears 'onboardingDone' for new users
- Added logging for debugging

### app/onboarding/auth.tsx  
- Login no longer forces redirect to setup
- Only registration redirects to setup
- NavigationHandler decides login destination

### app/_layout.tsx
- Enhanced logging for debugging
- Re-check onboarding status when user/auth changes
- Proper navigation logic for all scenarios

## Expected Console Logs

### Successful Registration:
```
Onboarding status checked: {done: null, newStatus: false, isAuthenticated: true}
Navigation check: {isLoading: false, isAuthenticated: true, onboardingDone: false, pathname: '/onboarding/auth'}
Redirecting to setup (authenticated but no onboarding)
```

### Successful Login (existing user):
```
Onboarding status checked: {done: 'true', newStatus: true, isAuthenticated: true}  
Navigation check: {isLoading: false, isAuthenticated: true, onboardingDone: true, pathname: '/onboarding/auth'}
Redirecting to home (authenticated and onboarded)
```
