import { ErrorBoundary } from '@/components/ErrorBoundary';
import SafeMiniPlayer from '@/components/SafeMiniPlayer';
import { AppProvider } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { useNavigationLogic } from '@/hooks/useNavigationLogic';
import { MusicProvider } from '@/modules/music/context/MusicContext';
import { logger } from '@/utils/secureLogger';
import { initializeStorage } from '@/utils/storageInit';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Keep splash screen visible while loading resources
SplashScreen.preventAutoHideAsync();

// Component that handles navigation logic using the custom hook
function NavigationHandler({ children }: { children: React.ReactNode }) {
  const { isNavigationReady } = useNavigationLogic();

  if (!isNavigationReady) {
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
        logger.info('RootLayout', 'Starting app initialization');
        
        // Initialize storage and clean up any corrupted data first
        const storageInitialized = await initializeStorage();
        
        if (!storageInitialized) {
          logger.warn('RootLayout', 'Storage initialization failed, some features may not work properly');
        }
        
        // Pre-load fonts, make API calls, etc.
        // Artificial delay for demo purposes
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        logger.info('RootLayout', 'App initialization completed successfully');
      } catch (e) {
        logger.error('RootLayout', 'App preparation failed', e as Error);
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
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaProvider initialMetrics={{
          frame: { x: 0, y: 0, width: 0, height: 0 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 }
        }}>
          <AuthProvider>
            <AppProvider>
              <MusicProvider>
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
            <SafeMiniPlayer />
          </View>
            </NavigationHandler>
            </MusicProvider>
          </AppProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
    </ErrorBoundary>
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
