# Logout Implementation Guide

## Overview
The logout functionality in PulseZen performs a complete cleanup of user session data, including authentication tokens, user data, and onboarding status.

## Implementation

### 1. Profile Screen Logout Button
Located in: `/modules/profile/pages/ProfileScreen.tsx`

#### Features:
- **Confirmation Dialog**: Shows "Tem certeza que deseja sair da sua conta?"
- **Complete Data Cleanup**: Clears both profile data and authentication data
- **Error Handling**: Shows alert if logout fails
- **Navigation**: Redirects to welcome screen after successful logout

```typescript
const handleLogout = () => {
  Alert.alert(
    'Sair',
    'Tem certeza que deseja sair da sua conta?',
    [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Sair', 
        style: 'destructive',
        onPress: async () => {
          try {
            // Clear local profile data
            await ProfileService.clearUserData();
            
            // Logout using AuthContext (clears token and user data)
            await logout();
            
            // Navigate to welcome screen
            router.replace('/onboarding/welcome');
          } catch (error) {
            console.error('Erro ao fazer logout:', error);
            Alert.alert('Erro', 'Não foi possível fazer logout. Tente novamente.');
          }
        }
      }
    ]
  );
};
```

### 2. AuthContext Logout
Located in: `/context/AuthContext.tsx`

#### Features:
- Calls API logout endpoint
- Clears authentication token
- Clears user data from memory
- Updates authentication state

```typescript
const logout = async () => {
  try {
    setIsLoading(true);
    await AuthService.logout();
    setUser(null);
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    setIsLoading(false);
  }
};
```

### 3. AuthService Logout
Located in: `/services/authService.ts`

#### Features:
- **API Call**: Calls `/api/v1/auth/logout` endpoint
- **Token Cleanup**: Removes authentication token from AsyncStorage
- **User Data Cleanup**: Removes user data from AsyncStorage
- **Onboarding Reset**: Clears onboarding status (forces re-onboarding)
- **Graceful Handling**: Always clears local data even if API call fails

```typescript
static async logout(): Promise<void> {
  try {
    // Try to call logout endpoint
    const token = await this.getToken();
    if (token) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    console.error('Logout API error:', error);
  } finally {
    // Always clear local data
    await this.clearAuthData();
  }
}

private static async clearAuthData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      this.TOKEN_KEY, 
      this.USER_KEY,
      'onboardingDone' // Also clear onboarding status on logout
    ]);
  } catch (error) {
    console.error('Clear auth data error:', error);
  }
}
```

### 4. ProfileService Data Cleanup
Located in: `/modules/profile/services/ProfileService.ts`

#### Features:
- Clears local profile data
- Clears user statistics
- Clears achievements
- Clears user settings

```typescript
static async clearUserData(): Promise<boolean> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_PROFILE,
      STORAGE_KEYS.USER_STATS,
      STORAGE_KEYS.USER_ACHIEVEMENTS,
      STORAGE_KEYS.USER_SETTINGS,
    ]);
    return true;
  } catch (error) {
    console.error('Error clearing user data:', error);
    return false;
  }
}
```

## Data Cleared on Logout

### AsyncStorage Keys Removed:
1. `@pulsezen_auth_token` - JWT authentication token
2. `@pulsezen_user_data` - User authentication data
3. `onboardingDone` - Onboarding completion status
4. `userProfile` - User profile data
5. `userStats` - User statistics
6. `userAchievements` - User achievements
7. `userSettings` - User preferences

### Memory State Reset:
1. `AuthContext.user` → `null`
2. `AuthContext.isAuthenticated` → `false`
3. Profile screen state cleared

## Navigation Flow After Logout

```
Logout Button → Confirmation Dialog → Data Cleanup → Welcome Screen
                     ↓
               User cancels → Stay on profile
                     ↓
               User confirms → Complete logout flow
```

## Error Handling

### Scenarios Covered:
1. **API Logout Fails**: Local data still cleared, user logged out locally
2. **Network Error**: Graceful fallback, doesn't prevent logout
3. **AsyncStorage Error**: Error logged, app continues
4. **General Errors**: User-friendly alert shown

### User Experience:
- Loading state during logout process
- Clear feedback on errors
- Always completes logout (even with errors)
- Smooth navigation transition

## Testing the Logout Flow

### Manual Test Steps:
1. **Login** → Navigate to profile → Tap "Sair"
2. **Verify Confirmation** → Should show confirmation dialog
3. **Cancel Test** → Tap "Cancelar" → Should stay on profile
4. **Logout Test** → Tap "Sair" → Should redirect to welcome
5. **State Test** → Check that app requires re-login
6. **Data Test** → Verify all user data is cleared

### API Test:
```bash
# Test logout endpoint
curl -X POST http://192.168.3.75:3333/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Expected response:
{"success":true,"message":"Logout successful. Please remove token from client storage."}
```

## Security Considerations

1. **Token Invalidation**: API invalidates token on server side
2. **Complete Cleanup**: All local data removed
3. **No Residual Data**: User must re-authenticate and re-onboard
4. **Graceful Handling**: No security leaks even on errors

## Future Enhancements

1. **Session Management**: Track active sessions
2. **Device Management**: Logout from specific devices
3. **Partial Logout**: Keep some user preferences
4. **Logout Reasons**: Track why users logout
