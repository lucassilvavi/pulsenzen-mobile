import { AppProvider } from '@/context/AppContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { MiniPlayer } from '@/modules/music/components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { Stack, usePathname, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Keep splash screen visible while loading resources
SplashScreen.preventAutoHideAsync();

// Component that handles navigation logic using AuthContext
function NavigationHandler({ children }: { children: React.ReactNode }) {
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkOnboardingStatus() {
      const done = await AsyncStorage.getItem('onboardingDone');
      const newStatus = done === 'true';
      setOnboardingDone(newStatus);
      console.log('Onboarding status checked:', { done, newStatus, isAuthenticated });
    }
    checkOnboardingStatus();
  }, [user, isAuthenticated]); // Re-check when user or auth status changes

  useEffect(() => {
    // Navigation logic based on auth and onboarding state
    console.log('Navigation check:', { isLoading, isAuthenticated, onboardingDone, pathname });
    
    if (!isLoading && onboardingDone !== null) {
      if (!isAuthenticated && !pathname.includes('/onboarding')) {
        // Not authenticated, redirect to auth onboarding
        console.log('Redirecting to welcome (not authenticated)');
        router.replace('/onboarding/welcome');
      } else if (isAuthenticated && !onboardingDone && !pathname.includes('/onboarding/setup')) {
        // Authenticated but onboarding not done, go to setup
        console.log('Redirecting to setup (authenticated but no onboarding)');
        router.replace('/onboarding/setup');
      } else if (isAuthenticated && onboardingDone && pathname.includes('/onboarding')) {
        // Authenticated and onboarded, go to main app
        console.log('Redirecting to home (authenticated and onboarded)');
        router.replace('/');
      }
    }
  }, [isLoading, isAuthenticated, onboardingDone, pathname, router]);

  if (isLoading || onboardingDone === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  // Load custom fonts
  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make API calls, etc.
        // Artificial delay for demo purposes
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady && fontsLoaded) {
      // Hide splash screen once everything is ready
      SplashScreen.hideAsync();
    }
  }, [appIsReady, fontsLoaded]);


  if (!appIsReady || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider initialMetrics={{
        frame: { x: 0, y: 0, width: 0, height: 0 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 }
      }}>
        <AuthProvider>
          <AppProvider>
            <NavigationHandler>
              {/* Using regular View instead of ThemedView to avoid potential issues */}
              <View style={[styles.container, { backgroundColor: 'white' }]}>
                <StatusBar style="auto" />
            {/* Stack Navigation */}
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' },
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen 
                name="profile" 
                options={{ 
                  headerShown: false,
                  presentation: 'modal'
                }} 
              />
              <Stack.Screen name="onboarding/welcome" options={{ headerShown: false, gestureEnabled: false }} />
              <Stack.Screen name="onboarding/auth" options={{ headerShown: false, gestureEnabled: false }} />
              <Stack.Screen name="onboarding/benefits" options={{ headerShown: false, gestureEnabled: false }} />
              <Stack.Screen name="onboarding/features" options={{ headerShown: false, gestureEnabled: false }} />
              <Stack.Screen name="onboarding/setup" options={{ headerShown: false, gestureEnabled: false }} />

              <Stack.Screen
                name="journal-entry"
                options={{
                  headerShown: false,
                  presentation: 'fullScreenModal'
                }} />

              <Stack.Screen
                name="breathing"
                options={{
                  headerShown: false,
                  presentation: 'fullScreenModal'
                }}
              />
              <Stack.Screen
                name="breathing-session"
                options={{
                  headerShown: false,
                  presentation: 'fullScreenModal'
                }}
              />

              <Stack.Screen
                name="sos"
                options={{
                  headerShown: false,
                  presentation: 'fullScreenModal'
                }}
              />

              <Stack.Screen
                name="journal"
                options={{
                  headerShown: false,
                  presentation: 'fullScreenModal'
                }}
              />

              {/* Music Module Routes */}
              <Stack.Screen
                name="souns"
                options={{
                  headerShown: false,
                  presentation: 'fullScreenModal'
                }}
              />

              <Stack.Screen
                name="playlists"
                options={{
                  headerShown: false,
                  presentation: 'fullScreenModal',
                }}
              />
              <Stack.Screen
                name="music-player"
                options={{
                  headerShown: false,
                  presentation: 'fullScreenModal',
                }}
              />
              <Stack.Screen
                name="category"
                options={{
                  headerShown: false,
                  presentation: 'fullScreenModal',
                }}
              />
            </Stack>
            {/* Mini Player - Aparece quando uma música está tocando */}
            <MiniPlayer />
          </View>
            </NavigationHandler>
          </AppProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
