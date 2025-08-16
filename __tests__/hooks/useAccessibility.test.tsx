import { act, renderHook } from '@testing-library/react-hooks';
import { AccessibilityInfo } from 'react-native';
import {
    useAccessibilityState,
    useReducedMotion,
    useScreenReader,
    useScreenReaderAnnouncement,
} from '../../../modules/journal/hooks/useAccessibility';

// Mock React Native AccessibilityInfo
jest.mock('react-native', () => ({
  AccessibilityInfo: {
    isScreenReaderEnabled: jest.fn(),
    isReduceMotionEnabled: jest.fn(),
    announceForAccessibility: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  Platform: {
    OS: 'ios',
  },
}));

const mockedAccessibilityInfo = AccessibilityInfo as jest.Mocked<typeof AccessibilityInfo>;

describe('Accessibility Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useAccessibilityState', () => {
    it('returns initial accessibility state', () => {
      const { result } = renderHook(() => useAccessibilityState());
      
      expect(result.current).toEqual({
        screenReaderEnabled: false,
        reduceMotionEnabled: false,
      });
    });

    it('updates state when accessibility settings change', async () => {
      mockedAccessibilityInfo.isScreenReaderEnabled.mockResolvedValue(true);
      mockedAccessibilityInfo.isReduceMotionEnabled.mockResolvedValue(true);

      const { result, waitForNextUpdate } = renderHook(() => useAccessibilityState());
      
      await waitForNextUpdate();
      
      expect(result.current.screenReaderEnabled).toBe(true);
      expect(result.current.reduceMotionEnabled).toBe(true);
    });
  });

  describe('useScreenReader', () => {
    it('returns false initially', () => {
      const { result } = renderHook(() => useScreenReader());
      
      expect(result.current).toBe(false);
    });

    it('returns true when screen reader is enabled', async () => {
      mockedAccessibilityInfo.isScreenReaderEnabled.mockResolvedValue(true);

      const { result, waitForNextUpdate } = renderHook(() => useScreenReader());
      
      await waitForNextUpdate();
      
      expect(result.current).toBe(true);
    });

    it('sets up event listeners for screen reader changes', () => {
      renderHook(() => useScreenReader());
      
      expect(mockedAccessibilityInfo.addEventListener).toHaveBeenCalledWith(
        'screenReaderChanged',
        expect.any(Function)
      );
    });

    it('cleans up event listeners on unmount', () => {
      const { unmount } = renderHook(() => useScreenReader());
      
      unmount();
      
      expect(mockedAccessibilityInfo.removeEventListener).toHaveBeenCalledWith(
        'screenReaderChanged',
        expect.any(Function)
      );
    });
  });

  describe('useReducedMotion', () => {
    it('returns false initially', () => {
      const { result } = renderHook(() => useReducedMotion());
      
      expect(result.current).toBe(false);
    });

    it('returns true when reduced motion is enabled', async () => {
      mockedAccessibilityInfo.isReduceMotionEnabled.mockResolvedValue(true);

      const { result, waitForNextUpdate } = renderHook(() => useReducedMotion());
      
      await waitForNextUpdate();
      
      expect(result.current).toBe(true);
    });

    it('sets up event listeners for reduced motion changes', () => {
      renderHook(() => useReducedMotion());
      
      expect(mockedAccessibilityInfo.addEventListener).toHaveBeenCalledWith(
        'reduceMotionChanged',
        expect.any(Function)
      );
    });
  });

  describe('useScreenReaderAnnouncement', () => {
    it('returns announcement function', () => {
      const { result } = renderHook(() => useScreenReaderAnnouncement());
      
      expect(typeof result.current).toBe('function');
    });

    it('makes announcements when called', () => {
      const { result } = renderHook(() => useScreenReaderAnnouncement());
      
      act(() => {
        result.current('Test announcement');
      });
      
      expect(mockedAccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'Test announcement'
      );
    });

    it('throttles rapid announcements', () => {
      jest.useFakeTimers();
      const { result } = renderHook(() => useScreenReaderAnnouncement());
      
      act(() => {
        result.current('First announcement');
        result.current('Second announcement');
        result.current('Third announcement');
      });
      
      // Only the first announcement should be made immediately
      expect(mockedAccessibilityInfo.announceForAccessibility).toHaveBeenCalledTimes(1);
      expect(mockedAccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'First announcement'
      );
      
      jest.useRealTimers();
    });
  });

  describe('Performance', () => {
    it('accessibility state hook renders quickly', () => {
      const startTime = performance.now();
      
      renderHook(() => useAccessibilityState());
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(10);
    });

    it('screen reader hook has minimal overhead', () => {
      const startTime = performance.now();
      
      renderHook(() => useScreenReader());
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(10);
    });
  });

  describe('Error Handling', () => {
    it('handles AccessibilityInfo errors gracefully', async () => {
      mockedAccessibilityInfo.isScreenReaderEnabled.mockRejectedValue(
        new Error('AccessibilityInfo error')
      );

      const { result } = renderHook(() => useScreenReader());
      
      // Should not throw and should return default value
      expect(result.current).toBe(false);
    });

    it('handles announcement errors gracefully', () => {
      mockedAccessibilityInfo.announceForAccessibility.mockImplementation(() => {
        throw new Error('Announcement failed');
      });

      const { result } = renderHook(() => useScreenReaderAnnouncement());
      
      expect(() => {
        act(() => {
          result.current('Test announcement');
        });
      }).not.toThrow();
    });
  });

  describe('Platform Compatibility', () => {
    it('works on iOS', () => {
      jest.doMock('react-native', () => ({
        ...jest.requireActual('react-native'),
        Platform: { OS: 'ios' },
      }));

      const { result } = renderHook(() => useScreenReader());
      expect(result.current).toBe(false);
    });

    it('works on Android', () => {
      jest.doMock('react-native', () => ({
        ...jest.requireActual('react-native'),
        Platform: { OS: 'android' },
      }));

      const { result } = renderHook(() => useScreenReader());
      expect(result.current).toBe(false);
    });
  });
});
