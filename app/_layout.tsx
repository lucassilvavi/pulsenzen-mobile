// Import View directly from react-native instead of ThemedView
import MiniPlayer from '@/components/MiniPlayer';
import { AppProvider } from '@/context/AppContext';
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

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();


  // Load custom fonts
  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
  });

  useEffect(() => {

    async function checkOnboarding() {
      const done = await AsyncStorage.getItem('onboardingDone');
      setOnboardingDone(done === 'true');
    }
    checkOnboarding();

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

  useEffect(() => {
    // Redireciona para o onboarding apenas se não estiver concluído
    if (appIsReady && fontsLoaded && onboardingDone === false) {
      router.replace('/onboarding/welcome');
    }
  }, [appIsReady, fontsLoaded, onboardingDone, router]);


  if (!appIsReady || !fontsLoaded || onboardingDone === null) {
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
        <AppProvider>
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
                  headerShown: true,
                  presentation: 'modal',
                  title: 'Perfil',
                  headerTransparent: true
                }} 
              />
              <Stack.Screen name="onboarding/welcome" options={{ headerShown: false, gestureEnabled: false }} />
              <Stack.Screen name="onboarding/benefits" options={{ headerShown: false, gestureEnabled: false }} />
              <Stack.Screen name="onboarding/features" options={{ headerShown: false, gestureEnabled: false }} />
              <Stack.Screen name="onboarding/setup" options={{ headerShown: false, gestureEnabled: false }} />

              <Stack.Screen name="mood-entry" options={{ headerShown: false }} />
              <Stack.Screen
                name="journal-entry"
                options={{
                  headerShown: true,
                  presentation: 'fullScreenModal',
                  title: 'Tema do Diário',
                  headerTransparent: true
                }} />

              <Stack.Screen
                name="breathing"
                options={{
                  headerShown: true,
                  presentation: 'fullScreenModal',
                  title: 'Respiração',
                  headerTransparent: true

                }}
              />
              <Stack.Screen
                name="breathing-session"
                options={{
                  headerShown: true,
                  presentation: 'fullScreenModal',
                  title: '',
                  headerTransparent: true

                }}
              />

              <Stack.Screen
                name="sos"
                options={{
                  headerShown: true,
                  presentation: 'fullScreenModal',
                  title: '',
                  headerTransparent: true
                }}
              />

              <Stack.Screen
                name="journal"
                options={{
                  headerShown: true,
                  presentation: 'fullScreenModal',
                  title: 'Diário',
                  headerTransparent: true

                }}
              />

              <Stack.Screen
                name="souns"
                options={{
                  headerShown: true,
                  presentation: 'fullScreenModal',
                  title: 'Sons',
                  headerTransparent: true

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
            {/* Não mostramos o mini-player na própria tela do player ou em telas de onboarding */}
            {!pathname.includes('music-player') && !pathname.includes('onboarding') && (
              <MiniPlayer />
            )}
          </View>
        </AppProvider>
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
