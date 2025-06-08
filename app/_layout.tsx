import { ThemedView } from '@/components/ThemedView';
import { AppProvider } from '@/context/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
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


  if (!appIsReady || !fontsLoaded || onboardingDone === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <AppProvider>
          <ThemedView style={styles.container}>
            <StatusBar style="auto" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' },
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="onboarding/welcome" options={{ headerShown: false, gestureEnabled: false }} />
              <Stack.Screen name="onboarding/benefits" options={{ headerShown: false, gestureEnabled: false }} />
              <Stack.Screen name="onboarding/features" options={{ headerShown: false, gestureEnabled: false }} />
              <Stack.Screen name="onboarding/setup" options={{ headerShown: false, gestureEnabled: false }} />
              <Stack.Screen name="breathing-session" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
              <Stack.Screen name="sleep-session" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
              <Stack.Screen name="sos-session" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
              <Stack.Screen name="journal-entry" options={{ headerShown: false }} />
              <Stack.Screen name="mood-entry" options={{ headerShown: false }} />
              <Stack.Screen name="settings" options={{ headerShown: false }} />
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
                    name="sos"
                    options={{
                      headerShown: true,
                      presentation: 'fullScreenModal',
                      title: 'SOS',
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
                    name="sleep"
                    options={{
                      headerShown: true,
                      presentation: 'fullScreenModal',
                      title: 'Dormir',
                      headerTransparent: true
                  
                    }}
                  />
            </Stack>
          </ThemedView>
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
