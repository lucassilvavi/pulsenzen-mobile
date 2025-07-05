interface VolumeManagerInterface {
  addVolumeListener?: (callback: (result: any) => void) => void;
  getVolume?: () => Promise<{ volume: number }>;
  setVolume?: (volume: number, options?: any) => Promise<void>;
}

let VolumeManager: VolumeManagerInterface | null = null;

// Try to import VolumeManager, but handle gracefully if it fails
try {
  VolumeManager = require('react-native-volume-manager').default;
} catch (error) {
  console.log('react-native-volume-manager not available, using fallback mode');
  VolumeManager = null;
}

class SystemVolumeService {
  private listeners: ((volume: number) => void)[] = [];
  private fallbackVolume: number = 1.0;
  private isNativeVolumeAvailable: boolean = false;

  constructor() {
    this.checkNativeVolumeAvailability();
    this.setupVolumeListener();
  }

  private async checkNativeVolumeAvailability() {
    try {
      if (VolumeManager && VolumeManager.getVolume) {
        await VolumeManager.getVolume();
        this.isNativeVolumeAvailable = true;
        console.log('Native system volume control is available');
      }
    } catch (error) {
      this.isNativeVolumeAvailable = false;
      console.log('Native system volume control not available, using app-only volume control');
    }
  }

  private setupVolumeListener() {
    try {
      if (VolumeManager && VolumeManager.addVolumeListener && this.isNativeVolumeAvailable) {
        // Listen to volume changes from hardware buttons
        VolumeManager.addVolumeListener((result: any) => {
          const volume = result.volume;
          this.fallbackVolume = volume;
          this.notifyListeners(volume);
        });
      }
    } catch (error) {
      console.log('Volume listener not available, using fallback');
    }
  }

  async getSystemVolume(): Promise<number> {
    try {
      if (VolumeManager && VolumeManager.getVolume && this.isNativeVolumeAvailable) {
        const result = await VolumeManager.getVolume();
        this.fallbackVolume = result.volume;
        return result.volume;
      }
    } catch (error) {
      console.error('Failed to get system volume:', error);
    }
    return this.fallbackVolume;
  }

  async setSystemVolume(volume: number): Promise<void> {
    try {
      // Clamp volume between 0 and 1
      const clampedVolume = Math.max(0, Math.min(1, volume));
      this.fallbackVolume = clampedVolume;
      
      if (VolumeManager && VolumeManager.setVolume && this.isNativeVolumeAvailable) {
        await VolumeManager.setVolume(clampedVolume, {
          type: 'music', // Set music volume specifically
          showUI: false  // Don't show system volume UI
        });
      }
      
      // Always notify listeners even in fallback mode
      this.notifyListeners(clampedVolume);
    } catch (error) {
      console.error('Failed to set system volume:', error);
      // Still update fallback volume and notify
      this.notifyListeners(this.fallbackVolume);
    }
  }

  async showSystemVolumeUI(volume: number): Promise<void> {
    try {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      this.fallbackVolume = clampedVolume;
      
      if (VolumeManager && VolumeManager.setVolume && this.isNativeVolumeAvailable) {
        await VolumeManager.setVolume(clampedVolume, {
          type: 'music',
          showUI: true  // Show system volume UI
        });
      }
      
      // Always notify listeners
      this.notifyListeners(clampedVolume);
    } catch (error) {
      console.error('Failed to set system volume with UI:', error);
      // Still update fallback volume and notify
      this.notifyListeners(this.fallbackVolume);
    }
  }

  isSystemVolumeControlAvailable(): boolean {
    return this.isNativeVolumeAvailable;
  }

  addVolumeListener(listener: (volume: number) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(volume: number) {
    this.listeners.forEach(listener => listener(volume));
  }

  cleanup() {
    // VolumeManager handles cleanup automatically
    this.listeners = [];
  }
}

export default new SystemVolumeService();
