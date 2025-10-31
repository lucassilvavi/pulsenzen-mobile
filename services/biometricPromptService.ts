import AsyncStorage from '@react-native-async-storage/async-storage';

const BIOMETRIC_PROMPT_KEY = '@pulsezen:shouldShowBiometricPrompt';

export class BiometricPromptService {
  /**
   * Mark that biometric prompt should be shown
   */
  static async setShouldShowPrompt(shouldShow: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(BIOMETRIC_PROMPT_KEY, shouldShow ? 'true' : 'false');
    } catch (error) {
      console.error('Error setting biometric prompt flag:', error);
    }
  }

  /**
   * Check if biometric prompt should be shown
   */
  static async getShouldShowPrompt(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(BIOMETRIC_PROMPT_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Error getting biometric prompt flag:', error);
      return false;
    }
  }

  /**
   * Clear the prompt flag
   */
  static async clearPromptFlag(): Promise<void> {
    try {
      await AsyncStorage.removeItem(BIOMETRIC_PROMPT_KEY);
    } catch (error) {
      console.error('Error clearing biometric prompt flag:', error);
    }
  }
}
