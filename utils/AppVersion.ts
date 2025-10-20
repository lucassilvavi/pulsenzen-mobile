import { Platform } from 'react-native';
import Constants from 'expo-constants';

export class AppVersion {
  /**
   * Get the app version from Expo Constants
   */
  static getVersion(): string {
    try {
      return Constants.expoConfig?.version || (Constants.manifest as any)?.version || '1.0.5';
    } catch (error) {
      console.warn('Could not get app version:', error);
      return '1.0.5'; // fallback version
    }
  }

  /**
   * Get the build number/version code
   */
  static getBuildNumber(): string {
    try {
      if (Platform.OS === 'ios') {
        return Constants.expoConfig?.ios?.buildNumber || '1';
      } else if (Platform.OS === 'android') {
        return String(Constants.expoConfig?.android?.versionCode || 1);
      }
      return '1';
    } catch (error) {
      console.warn('Could not get build number:', error);
      return '1';
    }
  }

  /**
   * Get formatted version string (e.g., "1.0.5 (1)")
   */
  static getFormattedVersion(): string {
    const version = this.getVersion();
    const build = this.getBuildNumber();
    return `v${version} (${build})`;
  }

  /**
   * Get simple version string (e.g., "v1.0.5")
   */
  static getSimpleVersion(): string {
    return `v${this.getVersion()}`;
  }
}