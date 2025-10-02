import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACHIEVEMENTS, DEFAULT_SETTINGS, STORAGE_KEYS } from '../constants';
import { Achievement, UserProfile, UserSettings, UserStats } from '../types';

export class ProfileService {
  // User Profile Methods
  static async getUserProfile(): Promise<UserProfile | null> {
    try {
      const profileData = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return profileData ? JSON.parse(profileData) : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  static async saveUserProfile(profile: UserProfile): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
      return true;
    } catch (error) {
      console.error('Error saving user profile:', error);
      return false;
    }
  }

  static async updateUserProfile(updates: Partial<UserProfile>): Promise<boolean> {
    try {
      const currentProfile = await this.getUserProfile();
      if (!currentProfile) return false;

      const updatedProfile = {
        ...currentProfile,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      return await this.saveUserProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  }

  // Avatar Methods
  static async getUserAvatar(): Promise<string | null> {
    try {
      const avatarUri = await AsyncStorage.getItem(STORAGE_KEYS.USER_AVATAR);
      return avatarUri;
    } catch (error) {
      console.error('Error getting user avatar:', error);
      return null;
    }
  }

  static async saveUserAvatar(avatarUri: string | null): Promise<boolean> {
    try {
      if (avatarUri) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_AVATAR, avatarUri);
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_AVATAR);
      }
      return true;
    } catch (error) {
      console.error('Error saving user avatar:', error);
      return false;
    }
  }

  // User Stats Methods
  static async getUserStats(): Promise<UserStats | null> {
    try {
      const statsData = await AsyncStorage.getItem(STORAGE_KEYS.USER_STATS);
      return statsData ? JSON.parse(statsData) : null;
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  }

  static async saveUserStats(stats: UserStats): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(stats));
      return true;
    } catch (error) {
      console.error('Error saving user stats:', error);
      return false;
    }
  }

  static async updateUserStats(updates: Partial<UserStats>): Promise<boolean> {
    try {
      const currentStats = await this.getUserStats();
      const updatedStats = {
        streakDays: 0,
        completedSessions: 0,
        totalMinutes: 0,
        ...currentStats,
        ...updates,
        lastActivity: new Date().toISOString(),
      };

      return await this.saveUserStats(updatedStats);
    } catch (error) {
      console.error('Error updating user stats:', error);
      return false;
    }
  }

  static async incrementUserStats(increments: Partial<UserStats>): Promise<boolean> {
    try {
      const currentStats = await this.getUserStats();
      const baseStats = {
        streakDays: 0,
        completedSessions: 0,
        totalMinutes: 0,
        totalJournalEntries: 0,
        totalMoodEntries: 0,
        ...currentStats,
      };

      const updatedStats = {
        ...baseStats,
        streakDays: baseStats.streakDays + (increments.streakDays || 0),
        completedSessions: baseStats.completedSessions + (increments.completedSessions || 0),
        totalMinutes: baseStats.totalMinutes + (increments.totalMinutes || 0),
        totalJournalEntries: baseStats.totalJournalEntries + (increments.totalJournalEntries || 0),
        totalMoodEntries: baseStats.totalMoodEntries + (increments.totalMoodEntries || 0),
        lastActivity: new Date().toISOString(),
      };

      return await this.saveUserStats(updatedStats);
    } catch (error) {
      console.error('Error incrementing user stats:', error);
      return false;
    }
  }

  // Achievements Methods
  static async getUserAchievements(): Promise<Achievement[]> {
    try {
      const achievementsData = await AsyncStorage.getItem(STORAGE_KEYS.USER_ACHIEVEMENTS);
      const result = achievementsData ? JSON.parse(achievementsData) : ACHIEVEMENTS;
      // Ensure we always return an array
      return Array.isArray(result) ? result : ACHIEVEMENTS;
    } catch (error) {
      console.error('Error getting user achievements:', error);
      return ACHIEVEMENTS;
    }
  }

  static async saveUserAchievements(achievements: Achievement[]): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_ACHIEVEMENTS, JSON.stringify(achievements));
      return true;
    } catch (error) {
      console.error('Error saving user achievements:', error);
      return false;
    }
  }

  static async unlockAchievement(achievementId: string): Promise<boolean> {
    try {
      const achievements = await this.getUserAchievements();
      const updatedAchievements = achievements.map(achievement => 
        achievement.id === achievementId 
          ? { ...achievement, isLocked: false, unlockedAt: new Date().toISOString() }
          : achievement
      );

      return await this.saveUserAchievements(updatedAchievements);
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      return false;
    }
  }

  static async checkAchievements(stats: UserStats): Promise<string[]> {
    try {
      const achievements = await this.getUserAchievements();
      const newlyUnlocked: string[] = [];

      for (const achievement of achievements) {
        if (achievement.isLocked) {
          let shouldUnlock = false;

          switch (achievement.condition.type) {
            case 'streak':
              shouldUnlock = stats.streakDays >= achievement.condition.target;
              break;
            case 'sessions':
              shouldUnlock = stats.completedSessions >= achievement.condition.target;
              break;
            case 'minutes':
              shouldUnlock = stats.totalMinutes >= achievement.condition.target;
              break;
            case 'journals':
              shouldUnlock = (stats.totalJournalEntries || 0) >= achievement.condition.target;
              break;
            case 'moods':
              shouldUnlock = (stats.totalMoodEntries || 0) >= achievement.condition.target;
              break;
          }

          if (shouldUnlock) {
            await this.unlockAchievement(achievement.id);
            newlyUnlocked.push(achievement.id);
          }
        }
      }

      return newlyUnlocked;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }

  // Settings Methods
  static async getUserSettings(): Promise<UserSettings> {
    try {
      const settingsData = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
      return settingsData ? JSON.parse(settingsData) : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error getting user settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  static async saveUserSettings(settings: UserSettings): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Error saving user settings:', error);
      return false;
    }
  }

  static async updateUserSettings(updates: Partial<UserSettings>): Promise<boolean> {
    try {
      const currentSettings = await this.getUserSettings();
      const updatedSettings = {
        ...currentSettings,
        ...updates,
      };

      return await this.saveUserSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating user settings:', error);
      return false;
    }
  }

  // Utility Methods
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

  static async initializeUserData(name: string, email: string): Promise<UserProfile | null> {
    try {
      const profile: UserProfile = {
        id: Date.now().toString(),
        name,
        email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const stats: UserStats = {
        streakDays: 0,
        completedSessions: 0,
        totalMinutes: 0,
        totalJournalEntries: 0,
        totalMoodEntries: 0,
      };

      await Promise.all([
        this.saveUserProfile(profile),
        this.saveUserStats(stats),
        this.saveUserAchievements(ACHIEVEMENTS),
        this.saveUserSettings(DEFAULT_SETTINGS),
      ]);

      return profile;
    } catch (error) {
      console.error('Error initializing user data:', error);
      return null;
    }
  }
}
