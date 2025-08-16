import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Dimensions } from 'react-native';
import { EnhancedModal } from '../../../components/enhanced/EnhancedModal';
import { AccessibilityProvider } from '../../../context/AccessibilityContext';

// Mock dependencies
jest.mock('expo-haptics');
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

const mockHaptics = Haptics as jest.Mocked<typeof Haptics>;

// Mock Dimensions
const mockDimensions = {
  width: 375,
  height: 812,
};

jest.spyOn(Dimensions, 'get').mockReturnValue(mockDimensions);

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

describe('EnhancedModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('renders correctly when visible', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedModal
          visible={true}
          onClose={jest.fn()}
          testID="test-modal"
        >
          <div>Modal Content</div>
        </EnhancedModal>
      );

      expect(getByTestId('test-modal')).toBeTruthy();
    });

    it('does not render when not visible', () => {
      const { queryByTestId } = renderWithAccessibility(
        <EnhancedModal
          visible={false}
          onClose={jest.fn()}
          testID="test-modal"
        >
          <div>Modal Content</div>
        </EnhancedModal>
      );

      expect(queryByTestId('test-modal')).toBeNull();
    });

    it('calls onClose when close button is pressed', async () => {
      const onCloseMock = jest.fn();
      
      const { getByTestId } = renderWithAccessibility(
        <EnhancedModal
          visible={true}
          onClose={onCloseMock}
          testID="test-modal"
          showCloseButton
        >
          <div>Modal Content</div>
        </EnhancedModal>
      );

      const closeButton = getByTestId('test-modal-close-button');
      fireEvent.press(closeButton);

      await waitFor(() => {
        expect(onCloseMock).toHaveBeenCalledTimes(1);
      });
    });

    it('calls onClose when backdrop is pressed', async () => {
      const onCloseMock = jest.fn();
      
      const { getByTestId } = renderWithAccessibility(
        <EnhancedModal
          visible={true}
          onClose={onCloseMock}
          testID="test-modal"
          dismissOnBackdropPress
        >
          <div>Modal Content</div>
        </EnhancedModal>
      );

      const backdrop = getByTestId('test-modal-backdrop');
      fireEvent.press(backdrop);

      await waitFor(() => {
        expect(onCloseMock).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Animation Types', () => {
    it('handles slide animation type', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedModal
          visible={true}
          onClose={jest.fn()}
          testID="test-modal"
          animationType="slide"
        >
          <div>Modal Content</div>
        </EnhancedModal>
      );

      expect(getByTestId('test-modal')).toBeTruthy();
    });

    it('handles fade animation type', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedModal
          visible={true}
          onClose={jest.fn()}
          testID="test-modal"
          animationType="fade"
        >
          <div>Modal Content</div>
        </EnhancedModal>
      );

      expect(getByTestId('test-modal')).toBeTruthy();
    });

    it('handles scale animation type', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedModal
          visible={true}
          onClose={jest.fn()}
          testID="test-modal"
          animationType="scale"
        >
          <div>Modal Content</div>
        </EnhancedModal>
      );

      expect(getByTestId('test-modal')).toBeTruthy();
    });
  });

  describe('Size Variants', () => {
    it('handles small size variant', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedModal
          visible={true}
          onClose={jest.fn()}
          testID="test-modal"
          size="small"
        >
          <div>Modal Content</div>
        </EnhancedModal>
      );

      const modal = getByTestId('test-modal');
      expect(modal).toBeTruthy();
    });

    it('handles large size variant', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedModal
          visible={true}
          onClose={jest.fn()}
          testID="test-modal"
          size="large"
        >
          <div>Modal Content</div>
        </EnhancedModal>
      );

      const modal = getByTestId('test-modal');
      expect(modal).toBeTruthy();
    });

    it('handles fullscreen size variant', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedModal
          visible={true}
          onClose={jest.fn()}
          testID="test-modal"
          size="fullscreen"
        >
          <div>Modal Content</div>
        </EnhancedModal>
      );

      const modal = getByTestId('test-modal');
      expect(modal).toBeTruthy();
    });
  });

  describe('Accessibility Features', () => {
    it('has correct accessibility role and label', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedModal
          visible={true}
          onClose={jest.fn()}
          testID="test-modal"
          accessibilityLabel="Settings Modal"
        >
          <div>Modal Content</div>
        </EnhancedModal>
      );

      const modal = getByTestId('test-modal');
      expect(modal.props.accessibilityRole).toBe('dialog');
      expect(modal.props.accessibilityLabel).toBe('Settings Modal');
    });

    it('sets modal view manager when visible', async () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedModal
          visible={true}
          onClose={jest.fn()}
          testID="test-modal"
        >
          <div>Modal Content</div>
        </EnhancedModal>
      );

      const modal = getByTestId('test-modal');
      expect(modal.props.accessibilityViewIsModal).toBe(true);
    });

    it('respects reduced motion preferences', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedModal
          visible={true}
          onClose={jest.fn()}
          testID="test-modal"
          animationType="slide"
        >
          <div>Modal Content</div>
        </EnhancedModal>,
        { reducedMotion: true }
      );

      expect(getByTestId('test-modal')).toBeTruthy();
    });

    it('supports high contrast mode', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedModal
          visible={true}
          onClose={jest.fn()}
          testID="test-modal"
        >
          <div>Modal Content</div>
        </EnhancedModal>,
        { highContrast: true }
      );

      expect(getByTestId('test-modal')).toBeTruthy();
    });
  });

  describe('Haptic Feedback', () => {
    it('triggers haptic feedback on open', async () => {
      renderWithAccessibility(
        <EnhancedModal
          visible={true}
          onClose={jest.fn()}
          testID="test-modal"
          enableHaptics
        >
          <div>Modal Content</div>
        </EnhancedModal>
      );

      await waitFor(() => {
        expect(mockHaptics.impactAsync).toHaveBeenCalledWith(
          Haptics.ImpactFeedbackStyle.Light
        );
      });
    });

    it('triggers haptic feedback on close', async () => {
      const onCloseMock = jest.fn();
      
      const { getByTestId } = renderWithAccessibility(
        <EnhancedModal
          visible={true}
          onClose={onCloseMock}
          testID="test-modal"
          enableHaptics
          showCloseButton
        >
          <div>Modal Content</div>
        </EnhancedModal>
      );

      const closeButton = getByTestId('test-modal-close-button');
      fireEvent.press(closeButton);

      await waitFor(() => {
        expect(mockHaptics.impactAsync).toHaveBeenCalledWith(
          Haptics.ImpactFeedbackStyle.Light
        );
      });
    });

    it('does not trigger haptic feedback when disabled', async () => {
      const onCloseMock = jest.fn();
      
      const { getByTestId } = renderWithAccessibility(
        <EnhancedModal
          visible={true}
          onClose={onCloseMock}
          testID="test-modal"
          enableHaptics={false}
          showCloseButton
        >
          <div>Modal Content</div>
        </EnhancedModal>
      );

      const closeButton = getByTestId('test-modal-close-button');
      fireEvent.press(closeButton);

      await waitFor(() => {
        expect(onCloseMock).toHaveBeenCalledTimes(1);
      });

      expect(mockHaptics.impactAsync).not.toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('renders efficiently with complex content', () => {
      const startTime = performance.now();
      
      const complexContent = (
        <div>
          {Array.from({ length: 100 }, (_, i) => (
            <div key={i}>Item {i}</div>
          ))}
        </div>
      );

      const { getByTestId } = renderWithAccessibility(
        <EnhancedModal
          visible={true}
          onClose={jest.fn()}
          testID="test-modal"
        >
          {complexContent}
        </EnhancedModal>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(getByTestId('test-modal')).toBeTruthy();
      expect(renderTime).toBeLessThan(100); // Should render in under 100ms
    });

    it('handles rapid open/close operations', async () => {
      const onCloseMock = jest.fn();
      let visible = true;

      const { rerender, getByTestId, queryByTestId } = renderWithAccessibility(
        <EnhancedModal
          visible={visible}
          onClose={onCloseMock}
          testID="test-modal"
        >
          <div>Modal Content</div>
        </EnhancedModal>
      );

      // Rapid open/close
      for (let i = 0; i < 10; i++) {
        visible = !visible;
        rerender(
          <AccessibilityProvider value={{ reducedMotion: false, highContrast: false, fontSize: 16 }}>
            <EnhancedModal
              visible={visible}
              onClose={onCloseMock}
              testID="test-modal"
            >
              <div>Modal Content</div>
            </EnhancedModal>
          </AccessibilityProvider>
        );

        if (visible) {
          expect(getByTestId('test-modal')).toBeTruthy();
        } else {
          expect(queryByTestId('test-modal')).toBeNull();
        }
      }
    });
  });

  describe('Error Handling', () => {
    it('handles missing onClose gracefully', () => {
      expect(() => {
        renderWithAccessibility(
          <EnhancedModal
            visible={true}
            onClose={undefined as any}
            testID="test-modal"
          >
            <div>Modal Content</div>
          </EnhancedModal>
        );
      }).not.toThrow();
    });

    it('handles invalid animation type gracefully', () => {
      expect(() => {
        renderWithAccessibility(
          <EnhancedModal
            visible={true}
            onClose={jest.fn()}
            testID="test-modal"
            animationType={'invalid' as any}
          >
            <div>Modal Content</div>
          </EnhancedModal>
        );
      }).not.toThrow();
    });

    it('handles missing children gracefully', () => {
      expect(() => {
        renderWithAccessibility(
          <EnhancedModal
            visible={true}
            onClose={jest.fn()}
            testID="test-modal"
          >
            {null}
          </EnhancedModal>
        );
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('handles very small screen sizes', () => {
      jest.spyOn(Dimensions, 'get').mockReturnValue({
        width: 200,
        height: 300,
      });

      const { getByTestId } = renderWithAccessibility(
        <EnhancedModal
          visible={true}
          onClose={jest.fn()}
          testID="test-modal"
          size="large"
        >
          <div>Modal Content</div>
        </EnhancedModal>
      );

      expect(getByTestId('test-modal')).toBeTruthy();
    });

    it('handles very large screen sizes', () => {
      jest.spyOn(Dimensions, 'get').mockReturnValue({
        width: 1920,
        height: 1080,
      });

      const { getByTestId } = renderWithAccessibility(
        <EnhancedModal
          visible={true}
          onClose={jest.fn()}
          testID="test-modal"
          size="small"
        >
          <div>Modal Content</div>
        </EnhancedModal>
      );

      expect(getByTestId('test-modal')).toBeTruthy();
    });

    it('handles orientation changes', async () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedModal
          visible={true}
          onClose={jest.fn()}
          testID="test-modal"
        >
          <div>Modal Content</div>
        </EnhancedModal>
      );

      // Simulate orientation change
      jest.spyOn(Dimensions, 'get').mockReturnValue({
        width: 812,
        height: 375,
      });

      // Modal should still be visible and functional
      expect(getByTestId('test-modal')).toBeTruthy();
    });
  });
});
