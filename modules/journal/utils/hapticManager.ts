import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Enhanced haptic feedback system with reduced motion support
 */
export class HapticManager {
  private static isEnabled = true;
  private static reducedMotion = false;

  /**
   * Enable or disable haptic feedback globally
   */
  static setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  /**
   * Set reduced motion preference
   */
  static setReducedMotion(reduced: boolean) {
    this.reducedMotion = reduced;
  }

  /**
   * Light haptic feedback for subtle interactions
   */
  static async light() {
    if (!this.shouldPlayHaptic()) return;
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Medium haptic feedback for standard interactions
   */
  static async medium() {
    if (!this.shouldPlayHaptic()) return;
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Heavy haptic feedback for important interactions
   */
  static async heavy() {
    if (!this.shouldPlayHaptic()) return;
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Success haptic feedback
   */
  static async success() {
    if (!this.shouldPlayHaptic()) return;
    
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Warning haptic feedback
   */
  static async warning() {
    if (!this.shouldPlayHaptic()) return;
    
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Error haptic feedback
   */
  static async error() {
    if (!this.shouldPlayHaptic()) return;
    
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Selection haptic feedback for UI selections
   */
  static async selection() {
    if (!this.shouldPlayHaptic()) return;
    
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Custom haptic pattern for journal-specific interactions
   */
  static async journalSave() {
    if (!this.shouldPlayHaptic()) return;
    
    try {
      // Double light tap for save confirmation
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setTimeout(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, 100);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Haptic feedback for mood selection
   */
  static async moodSelect() {
    if (!this.shouldPlayHaptic()) return;
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Haptic feedback for navigation gestures
   */
  static async navigationSwipe() {
    if (!this.shouldPlayHaptic()) return;
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Haptic feedback for entry deletion
   */
  static async entryDelete() {
    if (!this.shouldPlayHaptic()) return;
    
    try {
      // Heavy impact followed by error notification
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setTimeout(async () => {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }, 200);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Check if haptic feedback should be played
   */
  private static shouldPlayHaptic(): boolean {
    if (!this.isEnabled) return false;
    if (this.reducedMotion) return false;
    if (Platform.OS === 'web') return false;
    
    return true;
  }
}

/**
 * Hook for haptic feedback in React components
 */
export const useHaptics = () => {
  return {
    light: HapticManager.light,
    medium: HapticManager.medium,
    heavy: HapticManager.heavy,
    success: HapticManager.success,
    warning: HapticManager.warning,
    error: HapticManager.error,
    selection: HapticManager.selection,
    journalSave: HapticManager.journalSave,
    moodSelect: HapticManager.moodSelect,
    navigationSwipe: HapticManager.navigationSwipe,
    entryDelete: HapticManager.entryDelete,
  };
};
