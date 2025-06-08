import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { getUserProfile, getAppSettings, isOnboardingCompleted, getStreakData } from '@/utils/storage';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Define the shape of our app context
interface AppContextType {
  isLoading: boolean;
  userProfile: any;
  appSettings: any;
  onboardingCompleted: boolean;
  streakData: any;
  updateUserProfile: (profile: any) => void;
  updateAppSettings: (settings: any) => void;
  setOnboardingComplete: (completed: boolean) => void;
  refreshStreakData: () => Promise<void>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// Create the context with default values
const AppContext = createContext<AppContextType>({
  isLoading: true,
  userProfile: null,
  appSettings: {},
  onboardingCompleted: false,
  streakData: { currentStreak: 0, longestStreak: 0, lastActiveDate: null, activeDays: [] },
  updateUserProfile: () => {},
  updateAppSettings: () => {},
  setOnboardingComplete: () => {},
  refreshStreakData: async () => {},
  theme: 'light',
  toggleTheme: () => {},
});

// Custom hook to use the app context
export const useAppContext = () => useContext(AppContext);

// Provider component that wraps the app
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [appSettings, setAppSettings] = useState({});
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [streakData, setStreakData] = useState({ 
    currentStreak: 0, 
    longestStreak: 0,
    lastActiveDate: null,
    activeDays: []
  });
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Load fonts and initial data
  useEffect(() => {
    async function loadResourcesAndData() {
      try {
        // Load fonts
        await Font.loadAsync({
          'Inter-Regular': require('@/assets/fonts/Inter-Regular.ttf'),
          'Inter-Medium': require('@/assets/fonts/Inter-Medium.ttf'),
          'Inter-SemiBold': require('@/assets/fonts/Inter-SemiBold.ttf'),
          'Inter-Bold': require('@/assets/fonts/Inter-Bold.ttf'),
        });

        // Load data from storage
        const [profileData, settingsData, onboardingStatus, userStreakData] = await Promise.all([
          getUserProfile(),
          getAppSettings(),
          isOnboardingCompleted(),
          getStreakData(),
        ]);

        // Update state with loaded data
        setUserProfile(profileData);
        setAppSettings(settingsData);
        setOnboardingCompleted(onboardingStatus);
        setStreakData(userStreakData);

        // Set theme based on settings or default to light
        if (settingsData?.theme) {
          setTheme(settingsData.theme);
        }
      } catch (e) {
        console.warn('Error loading resources:', e);
      } finally {
        setIsLoading(false);
        // Hide splash screen once everything is loaded
        SplashScreen.hideAsync();
      }
    }

    loadResourcesAndData();
  }, []);

  // Update user profile
  const updateUserProfile = (profile: any) => {
    setUserProfile(profile);
  };

  // Update app settings
  const updateAppSettings = (settings: any) => {
    setAppSettings(prevSettings => ({
      ...prevSettings,
      ...settings,
    }));
  };

  // Set onboarding complete
  const setOnboardingComplete = (completed: boolean) => {
    setOnboardingCompleted(completed);
  };

  // Refresh streak data
  const refreshStreakData = async () => {
    const data = await getStreakData();
    setStreakData(data);
  };

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    updateAppSettings({ theme: newTheme });
  };

  // Context value
  const contextValue: AppContextType = {
    isLoading,
    userProfile,
    appSettings,
    onboardingCompleted,
    streakData,
    updateUserProfile,
    updateAppSettings,
    setOnboardingComplete,
    refreshStreakData,
    theme,
    toggleTheme,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
