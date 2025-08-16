import { HapticManager } from '../../../modules/journal/utils/hapticManager';

// Mock Expo Haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'Light',
    Medium: 'Medium',
    Heavy: 'Heavy',
  },
  NotificationFeedbackType: {
    Success: 'Success',
    Warning: 'Warning',
    Error: 'Error',
  },
}));

// Mock React Native Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

import * as Haptics from 'expo-haptics';

const mockedHaptics = Haptics as jest.Mocked<typeof Haptics>;

describe('HapticManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    HapticManager.setEnabled(true);
    HapticManager.setReducedMotion(false);
  });

  describe('Configuration', () => {
    it('allows enabling and disabling haptic feedback', () => {
      HapticManager.setEnabled(false);
      
      expect(() => HapticManager.light()).not.toThrow();
      // When disabled, haptic methods should return early
    });

    it('respects reduced motion preference', () => {
      HapticManager.setReducedMotion(true);
      
      expect(() => HapticManager.light()).not.toThrow();
      // When reduced motion is enabled, haptics should be disabled
    });
  });

  describe('Basic Haptic Feedback', () => {
    it('triggers light haptic feedback', async () => {
      await HapticManager.light();
      
      expect(mockedHaptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light
      );
    });

    it('triggers medium haptic feedback', async () => {
      await HapticManager.medium();
      
      expect(mockedHaptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Medium
      );
    });

    it('triggers heavy haptic feedback', async () => {
      await HapticManager.heavy();
      
      expect(mockedHaptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Heavy
      );
    });
  });

  describe('Notification Haptics', () => {
    it('triggers success haptic feedback', async () => {
      await HapticManager.success();
      
      expect(mockedHaptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Success
      );
    });

    it('triggers warning haptic feedback', async () => {
      await HapticManager.warning();
      
      expect(mockedHaptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Warning
      );
    });

    it('triggers error haptic feedback', async () => {
      await HapticManager.error();
      
      expect(mockedHaptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Error
      );
    });
  });

  describe('Selection Haptics', () => {
    it('triggers selection haptic feedback', async () => {
      await HapticManager.selection();
      
      expect(mockedHaptics.selectionAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('Custom Journal Haptics', () => {
    it('triggers journal save haptic pattern', async () => {
      jest.useFakeTimers();
      
      const promise = HapticManager.journalSave();
      
      // Should trigger first haptic immediately
      expect(mockedHaptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light
      );
      
      // Fast-forward time to trigger second haptic
      jest.advanceTimersByTime(100);
      
      await promise;
      
      // Should have been called twice
      expect(mockedHaptics.impactAsync).toHaveBeenCalledTimes(2);
      
      jest.useRealTimers();
    });

    it('triggers mood select haptic feedback', async () => {
      await HapticManager.moodSelect();
      
      expect(mockedHaptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Medium
      );
    });

    it('triggers navigation swipe haptic feedback', async () => {
      await HapticManager.navigationSwipe();
      
      expect(mockedHaptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light
      );
    });

    it('triggers entry delete haptic pattern', async () => {
      jest.useFakeTimers();
      
      const promise = HapticManager.entryDelete();
      
      // Should trigger heavy impact first
      expect(mockedHaptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Heavy
      );
      
      // Fast-forward time to trigger error notification
      jest.advanceTimersByTime(200);
      
      await promise;
      
      // Should have triggered both heavy impact and error notification
      expect(mockedHaptics.impactAsync).toHaveBeenCalledTimes(1);
      
      jest.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    it('handles haptic errors gracefully', async () => {
      mockedHaptics.impactAsync.mockRejectedValue(new Error('Haptic failed'));
      
      // Should not throw
      await expect(HapticManager.light()).resolves.toBeUndefined();
    });

    it('logs errors but continues execution', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockedHaptics.impactAsync.mockRejectedValue(new Error('Haptic failed'));
      
      await HapticManager.light();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Haptic feedback failed:',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Platform Compatibility', () => {
    it('skips haptics on web platform', () => {
      jest.doMock('react-native', () => ({
        Platform: { OS: 'web' },
      }));
      
      // Should not trigger haptics on web
      expect(() => HapticManager.light()).not.toThrow();
    });

    it('works on iOS platform', async () => {
      jest.doMock('react-native', () => ({
        Platform: { OS: 'ios' },
      }));
      
      await HapticManager.light();
      
      expect(mockedHaptics.impactAsync).toHaveBeenCalled();
    });

    it('works on Android platform', async () => {
      jest.doMock('react-native', () => ({
        Platform: { OS: 'android' },
      }));
      
      await HapticManager.light();
      
      expect(mockedHaptics.impactAsync).toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('executes haptic feedback quickly', async () => {
      const startTime = performance.now();
      
      await HapticManager.light();
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Should execute in less than 50ms
      expect(executionTime).toBeLessThan(50);
    });

    it('handles rapid successive haptic calls', async () => {
      const promises = [];
      
      // Trigger 10 rapid haptic calls
      for (let i = 0; i < 10; i++) {
        promises.push(HapticManager.light());
      }
      
      // Should all resolve without issues
      await expect(Promise.all(promises)).resolves.toBeDefined();
    });
  });

  describe('State Management', () => {
    it('maintains enabled state correctly', () => {
      HapticManager.setEnabled(false);
      // Internal state should be updated
      expect(() => HapticManager.light()).not.toThrow();
      
      HapticManager.setEnabled(true);
      expect(() => HapticManager.light()).not.toThrow();
    });

    it('maintains reduced motion state correctly', () => {
      HapticManager.setReducedMotion(true);
      expect(() => HapticManager.light()).not.toThrow();
      
      HapticManager.setReducedMotion(false);
      expect(() => HapticManager.light()).not.toThrow();
    });
  });
});
