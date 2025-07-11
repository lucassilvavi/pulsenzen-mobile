import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  USER_PROFILE: 'user_profile',
  MOOD_ENTRIES: 'mood_entries',
  JOURNAL_ENTRIES: 'journal_entries',
  MEDITATION_SESSIONS: 'meditation_sessions',
  BREATHING_SESSIONS: 'breathing_sessions',
  SLEEP_SESSIONS: 'sleep_sessions',
  APP_SETTINGS: 'app_settings',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  STREAK_DATA: 'streak_data',
  ACHIEVEMENTS: 'achievements',
};

// User profile storage
export const saveUserProfile = async (profile: any) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    return true;
  } catch (error) {
    console.error('Error saving user profile:', error);
    return false;
  }
};

export const getUserProfile = async () => {
  try {
    const profileData = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return profileData ? JSON.parse(profileData) : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Mood entries storage
export const saveMoodEntry = async (entry: any) => {
  try {
    const existingEntries = await getMoodEntries();
    const updatedEntries = [...(existingEntries || []), entry];
    await AsyncStorage.setItem(STORAGE_KEYS.MOOD_ENTRIES, JSON.stringify(updatedEntries));
    return true;
  } catch (error) {
    console.error('Error saving mood entry:', error);
    return false;
  }
};

export const getMoodEntries = async () => {
  try {
    const entries = await AsyncStorage.getItem(STORAGE_KEYS.MOOD_ENTRIES);
    return entries ? JSON.parse(entries) : [];
  } catch (error) {
    console.error('Error getting mood entries:', error);
    return [];
  }
};

// Journal entries storage
export const saveJournalEntry = async (entry: any) => {
  try {
    const existingEntries = await getJournalEntries();
    
    // Check if entry already exists (for updates)
    const entryIndex = existingEntries.findIndex((e: any) => e.id === entry.id);
    
    let updatedEntries;
    if (entryIndex >= 0) {
      // Update existing entry
      updatedEntries = [...existingEntries];
      updatedEntries[entryIndex] = entry;
    } else {
      // Add new entry
      updatedEntries = [...existingEntries, entry];
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.JOURNAL_ENTRIES, JSON.stringify(updatedEntries));
    return true;
  } catch (error) {
    console.error('Error saving journal entry:', error);
    return false;
  }
};

export const getJournalEntries = async () => {
  try {
    const entries = await AsyncStorage.getItem(STORAGE_KEYS.JOURNAL_ENTRIES);
    return entries ? JSON.parse(entries) : [];
  } catch (error) {
    console.error('Error getting journal entries:', error);
    return [];
  }
};

export const getJournalEntryById = async (id: any) => {
  try {
    const entries = await getJournalEntries();
    return entries.find((entry: any) => entry.id === id) || null;
  } catch (error) {
    console.error('Error getting journal entry by id:', error);
    return null;
  }
};

export const deleteJournalEntry = async (id: any) => {
  try {
    const entries = await getJournalEntries();
    const updatedEntries = entries.filter((entry: any) => entry.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.JOURNAL_ENTRIES, JSON.stringify(updatedEntries));
    return true;
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    return false;
  }
};

// Session tracking
export const saveSession = async (sessionType: any, sessionData: any) => {
  try {
    let storageKey;
    
    switch (sessionType) {
      case 'meditation':
        storageKey = STORAGE_KEYS.MEDITATION_SESSIONS;
        break;
      case 'breathing':
        storageKey = STORAGE_KEYS.BREATHING_SESSIONS;
        break;
      case 'sleep':
        storageKey = STORAGE_KEYS.SLEEP_SESSIONS;
        break;
      default:
        throw new Error('Invalid session type');
    }
    
    const existingSessions = await getSessions(sessionType);
    const updatedSessions = [...existingSessions, sessionData];
    
    await AsyncStorage.setItem(storageKey, JSON.stringify(updatedSessions));
    
    // Update streak data
    await updateStreak();
    
    return true;
  } catch (error) {
    console.error(`Error saving ${sessionType} session:`, error);
    return false;
  }
};

export const getSessions = async (sessionType: any) => {
  try {
    let storageKey;
    
    switch (sessionType) {
      case 'meditation':
        storageKey = STORAGE_KEYS.MEDITATION_SESSIONS;
        break;
      case 'breathing':
        storageKey = STORAGE_KEYS.BREATHING_SESSIONS;
        break;
      case 'sleep':
        storageKey = STORAGE_KEYS.SLEEP_SESSIONS;
        break;
      default:
        throw new Error('Invalid session type');
    }
    
    const sessions = await AsyncStorage.getItem(storageKey);
    return sessions ? JSON.parse(sessions) : [];
  } catch (error) {
    console.error(`Error getting ${sessionType} sessions:`, error);
    return [];
  }
};

// App settings
export const saveAppSettings = async (settings: any) => {
  try {
    const existingSettings = await getAppSettings();
    const updatedSettings = { ...existingSettings, ...settings };
    await AsyncStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(updatedSettings));
    return true;
  } catch (error) {
    console.error('Error saving app settings:', error);
    return false;
  }
};

export const getAppSettings = async () => {
  try {
    const settings = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
    return settings ? JSON.parse(settings) : {};
  } catch (error) {
    console.error('Error getting app settings:', error);
    return {};
  }
};

// Onboarding status
export const setOnboardingCompleted = async (completed = true) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, JSON.stringify(completed));
    return true;
  } catch (error) {
    console.error('Error setting onboarding status:', error);
    return false;
  }
};

export const isOnboardingCompleted = async () => {
  try {
    const status = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
    return status ? JSON.parse(status) : false;
  } catch (error) {
    console.error('Error getting onboarding status:', error);
    return false;
  }
};

// Streak tracking
export const getStreakData = async () => {
  try {
    const streakData = await AsyncStorage.getItem(STORAGE_KEYS.STREAK_DATA);
    return streakData ? JSON.parse(streakData) : { 
      currentStreak: 0, 
      longestStreak: 0,
      lastActiveDate: null,
      activeDays: []
    };
  } catch (error) {
    console.error('Error getting streak data:', error);
    return { 
      currentStreak: 0, 
      longestStreak: 0,
      lastActiveDate: null,
      activeDays: []
    };
  }
};

export const updateStreak = async () => {
  try {
    const streakData = await getStreakData();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // If already logged activity today, no need to update
    if (streakData.lastActiveDate === today) {
      return streakData;
    }
    
    // Check if last activity was yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    let newStreakData = { ...streakData };
    
    if (streakData.lastActiveDate === yesterdayStr) {
      // Continuing streak
      newStreakData.currentStreak += 1;
    } else if (streakData.lastActiveDate !== today) {
      // Streak broken
      newStreakData.currentStreak = 1;
    }
    
    // Update longest streak if needed
    if (newStreakData.currentStreak > newStreakData.longestStreak) {
      newStreakData.longestStreak = newStreakData.currentStreak;
    }
    
    // Update last active date
    newStreakData.lastActiveDate = today;
    
    // Update active days
    if (!newStreakData.activeDays.includes(today)) {
      newStreakData.activeDays.push(today);
    }
    
    // Save updated streak data
    await AsyncStorage.setItem(STORAGE_KEYS.STREAK_DATA, JSON.stringify(newStreakData));
    
    return newStreakData;
  } catch (error) {
    console.error('Error updating streak:', error);
    return null;
  }
};

// Achievements
export const getAchievements = async () => {
  try {
    const achievements = await AsyncStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    return achievements ? JSON.parse(achievements) : [];
  } catch (error) {
    console.error('Error getting achievements:', error);
    return [];
  }
};

export const unlockAchievement = async (achievementId: any) => {
  try {
    const achievements = await getAchievements();
    
    // Check if achievement already unlocked
    if (achievements.includes(achievementId)) {
      return true;
    }
    
    // Add new achievement
    const updatedAchievements = [...achievements, achievementId];
    await AsyncStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(updatedAchievements));
    
    return true;
  } catch (error) {
    console.error('Error unlocking achievement:', error);
    return false;
  }
};

// Clear all data (for logout or reset)
export const clearAllData = async () => {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
    return true;
  } catch (error) {
    console.error('Error clearing all data:', error);
    return false;
  }
};
