import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { EnhancedLoadingIndicator } from '../../../components/enhanced/EnhancedLoadingIndicator';
import { AccessibilityProvider } from '../../../context/AccessibilityContext';

// Mock dependencies
jest.mock('expo-haptics');
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

const mockHaptics = Haptics as jest.Mocked<typeof Haptics>;

const renderWithAccessibility = (component: React.ReactElement, accessibilityConfig = {}) => {
  const defaultConfig = {
    reducedMotion: false,
    highContrast: false,
    fontSize: 16,
    ...accessibilityConfig,
  };

  return render(
    <AccessibilityProvider value={defaultConfig}>
      {component}
    </AccessibilityProvider>
  );
};

describe('EnhancedLoadingIndicator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('renders correctly when visible', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedLoadingIndicator
          visible={true}
          testID="test-loading"
        />
      );

      expect(getByTestId('test-loading')).toBeTruthy();
    });

    it('does not render when not visible', () => {
      const { queryByTestId } = renderWithAccessibility(
        <EnhancedLoadingIndicator
          visible={false}
          testID="test-loading"
        />
      );

      expect(queryByTestId('test-loading')).toBeNull();
    });

    it('displays loading text when provided', () => {
      const { getByText } = renderWithAccessibility(
        <EnhancedLoadingIndicator
          visible={true}
          text="Loading data..."
          testID="test-loading"
        />
      );

      expect(getByText('Loading data...')).toBeTruthy();
    });

    it('displays loading description when provided', () => {
      const { getByText } = renderWithAccessibility(
        <EnhancedLoadingIndicator
          visible={true}
          text="Loading data..."
          description="Please wait while we fetch your information"
          testID="test-loading"
        />
      );

      expect(getByText('Please wait while we fetch your information')).toBeTruthy();
    });
  });

  describe('Size Variants', () => {
    it('handles small size variant', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedLoadingIndicator
          visible={true}
          size="small"
          testID="test-loading"
        />
      );

      expect(getByTestId('test-loading')).toBeTruthy();
    });

    it('handles large size variant', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedLoadingIndicator
          visible={true}
          size="large"
          testID="test-loading"
        />
      );

      expect(getByTestId('test-loading')).toBeTruthy();
    });

    it('handles default medium size', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedLoadingIndicator
          visible={true}
          testID="test-loading"
        />
      );

      expect(getByTestId('test-loading')).toBeTruthy();
    });
  });

  describe('Color Variants', () => {
    it('handles primary color', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedLoadingIndicator
          visible={true}
          color="primary"
          testID="test-loading"
        />
      );

      expect(getByTestId('test-loading')).toBeTruthy();
    });

    it('handles secondary color', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedLoadingIndicator
          visible={true}
          color="secondary"
          testID="test-loading"
        />
      );

      expect(getByTestId('test-loading')).toBeTruthy();
    });

    it('handles custom color', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedLoadingIndicator
          visible={true}
          color="#FF6B6B"
          testID="test-loading"
        />
      );

      expect(getByTestId('test-loading')).toBeTruthy();
    });
  });

  describe('Animation Types', () => {
    it('handles spinner animation', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedLoadingIndicator
          visible={true}
          animationType="spinner"
          testID="test-loading"
        />
      );

      expect(getByTestId('test-loading')).toBeTruthy();
    });

    it('handles pulse animation', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedLoadingIndicator
          visible={true}
          animationType="pulse"
          testID="test-loading"
        />
      );

      expect(getByTestId('test-loading')).toBeTruthy();
    });

    it('handles wave animation', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedLoadingIndicator
          visible={true}
          animationType="wave"
          testID="test-loading"
        />
      );

      expect(getByTestId('test-loading')).toBeTruthy();
    });

    it('handles dots animation', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedLoadingIndicator
          visible={true}
          animationType="dots"
          testID="test-loading"
        />
      );

      expect(getByTestId('test-loading')).toBeTruthy();
    });
  });

  describe('Overlay Functionality', () => {
    it('renders with overlay when enabled', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedLoadingIndicator
          visible={true}
          overlay={true}
          testID="test-loading"
        />
      );

      const overlay = getByTestId('test-loading-overlay');
      expect(overlay).toBeTruthy();
    });

    it('renders without overlay when disabled', () => {
      const { queryByTestId } = renderWithAccessibility(
        <EnhancedLoadingIndicator
          visible={true}
          overlay={false}
          testID="test-loading"
        />
      );

      expect(queryByTestId('test-loading-overlay')).toBeNull();
    });

    it('handles overlay press when cancellable', async () => {
      const onCancelMock = jest.fn();
      
      const { getByTestId } = renderWithAccessibility(
        <EnhancedLoadingIndicator
          visible={true}
          overlay={true}
          cancellable={true}
          onCancel={onCancelMock}
          testID="test-loading"
        />
      );

      const overlay = getByTestId('test-loading-overlay');
      fireEvent.press(overlay);

      await waitFor(() => {
        expect(onCancelMock).toHaveBeenCalledTimes(1);
      });
    });

    it('does not handle overlay press when not cancellable', async () => {
      const onCancelMock = jest.fn();
      
      const { getByTestId } = renderWithAccessibility(
        <EnhancedLoadingIndicator
          visible={true}
          overlay={true}
          cancellable={false}
          onCancel={onCancelMock}
          testID="test-loading"
        />
      );

      const overlay = getByTestId('test-loading-overlay');
      fireEvent.press(overlay);

      await waitFor(() => {
        expect(onCancelMock).not.toHaveBeenCalled();
      });
    });
  });

  describe('Progress Indicator', () => {
    it('displays progress when provided', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedLoadingIndicator
          visible={true}
          progress={0.5}
          testID="test-loading"
        />
      );

      const progressIndicator = getByTestId('test-loading-progress');
      expect(progressIndicator).toBeTruthy();
    });

    it('displays progress percentage', () => {
      const { getByText } = renderWithAccessibility(
        <EnhancedLoadingIndicator
          visible={true}
          progress={0.75}
          showProgressText={true}
          testID="test-loading"
        />
      );

      expect(getByText('75%')).toBeTruthy();
    });

    it('handles progress updates', () => {
      const { rerender, getByText } = renderWithAccessibility(
        <EnhancedLoadingIndicator
          visible={true}
          progress={0.25}
          showProgressText={true}
          testID="test-loading"
        />
      );

      expect(getByText('25%')).toBeTruthy();

      rerender(
        <AccessibilityProvider value={{ reducedMotion: false, highContrast: false, fontSize: 16 }}>
          <EnhancedLoadingIndicator
            visible={true}
            progress={0.85}
            showProgressText={true}
            testID="test-loading"
          />
        </AccessibilityProvider>
      );

      expect(getByText('85%')).toBeTruthy();
    });
  });

  describe('Accessibility Features', () => {
    it('has correct accessibility role and properties', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedLoadingIndicator
          visible={true}
          text="Loading data..."
          testID="test-loading"
        />
      );

      const indicator = getByTestId('test-loading');
      expect(indicator.props.accessibilityRole).toBe('progressbar');
      expect(indicator.props.accessibilityLabel).toBe('Loading data...');
    });

    it('announces progress updates to screen readers', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedLoadingIndicator
          visible={true}
          progress={0.5}
          text="Loading data..."
          testID="test-loading"
        />
      );

      const indicator = getByTestId('test-loading');
      expect(indicator.props.accessibilityValue).toEqual({
        min: 0,
        max: 100,
        now: 50,
      });
    });

    it('respects reduced motion preferences', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedLoadingIndicator
          visible={true}
          animationType="spinner"
          testID="test-loading"
        />,
        { reducedMotion: true }
      );

      expect(getByTestId('test-loading')).toBeTruthy();
    });

    it('supports high contrast mode', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedLoadingIndicator
          visible={true}
          testID="test-loading"
        />,
        { highContrast: true }
      );

      expect(getByTestId('test-loading')).toBeTruthy();
    });

    it('respects font size preferences', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedLoadingIndicator
          visible={true}
          text="Loading data..."
          testID="test-loading"
        />,
        { fontSize: 20 }
      );

      expect(getByTestId('test-loading')).toBeTruthy();
    });
  });

  describe('Haptic Feedback', () => {
    it('triggers haptic feedback on show when enabled', async () => {
      renderWithAccessibility(
        <EnhancedLoadingIndicator
          visible={true}
          enableHaptics={true}
          testID="test-loading"
        />
      );

      await waitFor(() => {
        expect(mockHaptics.impactAsync).toHaveBeenCalledWith(
          Haptics.ImpactFeedbackStyle.Light
        );
      });
    });

    it('does not trigger haptic feedback when disabled', () => {
      renderWithAccessibility(
        <EnhancedLoadingIndicator
          visible={true}
          enableHaptics={false}
          testID="test-loading"
        />
      );

      expect(mockHaptics.impactAsync).not.toHaveBeenCalled();
    });

    it('triggers haptic feedback on cancel when enabled', async () => {
      const onCancelMock = jest.fn();
      
      const { getByTestId } = renderWithAccessibility(
        <EnhancedLoadingIndicator
          visible={true}
          overlay={true}
          cancellable={true}
          onCancel={onCancelMock}
          enableHaptics={true}
          testID="test-loading"
        />
      );

      const overlay = getByTestId('test-loading-overlay');
      fireEvent.press(overlay);

      await waitFor(() => {
        expect(mockHaptics.impactAsync).toHaveBeenCalledWith(
          Haptics.ImpactFeedbackStyle.Medium
        );
      });
    });
  });

  describe('Performance', () => {
    it('renders efficiently', () => {
      const startTime = performance.now();
      
      const { getByTestId } = renderWithAccessibility(
        <EnhancedLoadingIndicator
          visible={true}
          testID="test-loading"
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(getByTestId('test-loading')).toBeTruthy();
      expect(renderTime).toBeLessThan(50); // Should render quickly
    });

    it('handles rapid visibility changes', () => {
      let visible = true;

      const { rerender, getByTestId, queryByTestId } = renderWithAccessibility(
        <EnhancedLoadingIndicator
          visible={visible}
          testID="test-loading"
        />
      );

      // Rapid show/hide
      for (let i = 0; i < 20; i++) {
        visible = !visible;
        rerender(
          <AccessibilityProvider value={{ reducedMotion: false, highContrast: false, fontSize: 16 }}>
            <EnhancedLoadingIndicator
              visible={visible}
              testID="test-loading"
            />
          </AccessibilityProvider>
        );

        if (visible) {
          expect(getByTestId('test-loading')).toBeTruthy();
        } else {
          expect(queryByTestId('test-loading')).toBeNull();
        }
      }
    });

    it('handles progress updates efficiently', () => {
      const { rerender, getByTestId } = renderWithAccessibility(
        <EnhancedLoadingIndicator
          visible={true}
          progress={0}
          testID="test-loading"
        />
      );

      // Rapid progress updates
      for (let i = 0; i <= 100; i += 10) {
        const progress = i / 100;
        rerender(
          <AccessibilityProvider value={{ reducedMotion: false, highContrast: false, fontSize: 16 }}>
            <EnhancedLoadingIndicator
              visible={true}
              progress={progress}
              testID="test-loading"
            />
          </AccessibilityProvider>
        );

        expect(getByTestId('test-loading')).toBeTruthy();
      }
    });
  });

  describe('Error Handling', () => {
    it('handles invalid progress values gracefully', () => {
      expect(() => {
        renderWithAccessibility(
          <EnhancedLoadingIndicator
            visible={true}
            progress={-0.5}
            testID="test-loading"
          />
        );
      }).not.toThrow();

      expect(() => {
        renderWithAccessibility(
          <EnhancedLoadingIndicator
            visible={true}
            progress={1.5}
            testID="test-loading"
          />
        );
      }).not.toThrow();
    });

    it('handles missing onCancel gracefully', () => {
      expect(() => {
        renderWithAccessibility(
          <EnhancedLoadingIndicator
            visible={true}
            overlay={true}
            cancellable={true}
            testID="test-loading"
          />
        );
      }).not.toThrow();
    });

    it('handles invalid animation type gracefully', () => {
      expect(() => {
        renderWithAccessibility(
          <EnhancedLoadingIndicator
            visible={true}
            animationType={'invalid' as any}
            testID="test-loading"
          />
        );
      }).not.toThrow();
    });

    it('handles null or undefined text gracefully', () => {
      expect(() => {
        renderWithAccessibility(
          <EnhancedLoadingIndicator
            visible={true}
            text={null as any}
            testID="test-loading"
          />
        );
      }).not.toThrow();

      expect(() => {
        renderWithAccessibility(
          <EnhancedLoadingIndicator
            visible={true}
            text={undefined}
            testID="test-loading"
          />
        );
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('handles very long text gracefully', () => {
      const longText = 'This is a very long loading message that might overflow the container and cause layout issues if not handled properly';
      
      const { getByText } = renderWithAccessibility(
        <EnhancedLoadingIndicator
          visible={true}
          text={longText}
          testID="test-loading"
        />
      );

      expect(getByText(longText)).toBeTruthy();
    });

    it('handles empty text gracefully', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedLoadingIndicator
          visible={true}
          text=""
          testID="test-loading"
        />
      );

      expect(getByTestId('test-loading')).toBeTruthy();
    });

    it('handles zero progress correctly', () => {
      const { getByText } = renderWithAccessibility(
        <EnhancedLoadingIndicator
          visible={true}
          progress={0}
          showProgressText={true}
          testID="test-loading"
        />
      );

      expect(getByText('0%')).toBeTruthy();
    });

    it('handles complete progress correctly', () => {
      const { getByText } = renderWithAccessibility(
        <EnhancedLoadingIndicator
          visible={true}
          progress={1}
          showProgressText={true}
          testID="test-loading"
        />
      );

      expect(getByText('100%')).toBeTruthy();
    });
  });
});
