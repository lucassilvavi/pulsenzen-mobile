import { AuthProvider } from '@/context/AuthContext';
import { AvatarProvider } from '@/context/AvatarContext';
import { BiometricAuthProvider } from '@/context/BiometricAuthContext';
import { MoodProvider } from '@/context/MoodContext';
import { SessionProvider } from '@/context/SessionContext';
import { UserDataProvider } from '@/context/UserDataContext';
import { useNavigationLogic } from '@/hooks/useNavigationLogic';
import { PredictionProvider } from '@/modules/prediction';
import { ToastProvider } from '@/modules/ui/toast/ToastContext';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Appearance, Platform, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Force light mode for the entire app (skip on web)
if (Platform.OS !== 'web') {
  Appearance.setColorScheme('light');
}

// Keep splash screen visible while loading resources
SplashScreen.preventAutoHideAsync();

// Navigation handler component with React.memo for performance
const NavigationHandler = memo(({ children }: { children: React.ReactNode }) => {
  const navigationLogic = useNavigationLogic();
  
  // Don't render children until navigation logic is ready
  if (!navigationLogic) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Inicializando navegação...</Text>
      </View>
    );
  }
  
  return <>{children}</>;
});

NavigationHandler.displayName = 'NavigationHandler';

export default function RootLayoutHybrid() {
  const [appIsReady, setAppIsReady] = useState(false);

  // Memoize the app preparation function to prevent re-creation
  const prepareApp = useCallback(async () => {
    try {
      // Simple delay to simulate loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAppIsReady(true);
    } catch (e) {
      console.error('❌ Complete Layout: App preparation failed', e);
      setAppIsReady(true); // Set to true anyway to prevent infinite loading
    }
  }, []);

  useEffect(() => {
    prepareApp();
  }, [prepareApp]);

  // Memoize the splash screen hiding effect
  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Carregando Acalmar...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <SessionProvider>
          <AuthProvider>
            <BiometricAuthProvider>
              <AvatarProvider>
                <UserDataProvider>
                  <MoodProvider>
                    <ToastProvider>
                      <PredictionProvider>
                  <NavigationHandler>
                    <View style={styles.container}>
                      <StatusBar style="dark" />
                      <Stack
                        screenOptions={{
                          headerShown: false,
                          contentStyle: { backgroundColor: 'white' },
                        }}
                    >
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                    <Stack.Screen name="onboarding/welcome" options={{ headerShown: false, gestureEnabled: false }} />
                    <Stack.Screen name="onboarding/auth" options={{ headerShown: false, gestureEnabled: false }} />
                    <Stack.Screen name="onboarding/forgot-password" options={{ headerShown: false }} />
                    <Stack.Screen name="onboarding/verify-code" options={{ headerShown: false }} />
                    <Stack.Screen name="onboarding/new-password" options={{ headerShown: false }} />
                    <Stack.Screen name="onboarding/personal-info" options={{ headerShown: false }} />
                    <Stack.Screen name="onboarding/terms" options={{ headerShown: false }} />
                    <Stack.Screen name="onboarding/privacy" options={{ headerShown: false }} />
                    <Stack.Screen name="onboarding/user-info" options={{ headerShown: false }} />
                    <Stack.Screen name="onboarding/permissions" options={{ headerShown: false }} />
                    <Stack.Screen name="onboarding/setup" options={{ headerShown: false }} />
                    <Stack.Screen name="onboarding/benefits" options={{ headerShown: false }} />
                    <Stack.Screen name="breathing" options={{ headerShown: false }} />
                    <Stack.Screen name="breathing-session" options={{ headerShown: false }} />
                    <Stack.Screen name="journal" options={{ headerShown: false }} />
                    <Stack.Screen name="journal-entry" options={{ headerShown: false }} />
                    <Stack.Screen name="journal-analytics" options={{ headerShown: false }} />
                    <Stack.Screen name="profile" options={{ headerShown: false }} />
                    <Stack.Screen name="sos" options={{ headerShown: false }} />
                    <Stack.Screen name="prediction-dashboard" options={{ headerShown: false }} />
                  </Stack>
                </View>
                  </NavigationHandler>
                      </PredictionProvider>
                    </ToastProvider>
                  </MoodProvider>
                </UserDataProvider>
              </AvatarProvider>
            </BiometricAuthProvider>
          </AuthProvider>
        </SessionProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
  },
});
