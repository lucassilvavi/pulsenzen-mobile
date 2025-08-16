import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { EnhancedButton } from '../../../modules/journal/components/ui/EnhancedButton';

// Mock React Native Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock Haptics
jest.mock('../../../modules/journal/utils/hapticManager', () => ({
  HapticManager: {
    light: jest.fn(),
    medium: jest.fn(),
    heavy: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
  },
  useHaptics: () => ({
    light: jest.fn(),
    medium: jest.fn(),
    heavy: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
  }),
}));

// Mock accessibility hooks
jest.mock('../../../modules/journal/hooks/useAccessibility', () => ({
  useReducedMotion: () => false,
  useAccessibilityProps: () => ({}),
}));

describe('EnhancedButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with title correctly', () => {
      const { getByText } = render(
        <EnhancedButton title="Test Button" onPress={() => {}} />
      );
      
      expect(getByText('Test Button')).toBeTruthy();
    });

    it('renders with correct accessibility props', () => {
      const { getByRole } = render(
        <EnhancedButton 
          title="Accessible Button" 
          onPress={() => {}} 
          accessibilityHint="This button performs a test action"
        />
      );
      
      const button = getByRole('button');
      expect(button).toBeTruthy();
      expect(button.props.accessibilityLabel).toBe('Accessible Button');
    });

    it('applies correct variant styles', () => {
      const { getByTestId } = render(
        <EnhancedButton 
          title="Primary Button" 
          variant="primary"
          onPress={() => {}} 
          testID="primary-button"
        />
      );
      
      const button = getByTestId('primary-button');
      expect(button).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('calls onPress when pressed', async () => {
      const onPressMock = jest.fn();
      const { getByText } = render(
        <EnhancedButton title="Clickable Button" onPress={onPressMock} />
      );
      
      const button = getByText('Clickable Button');
      fireEvent.press(button);
      
      expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('does not call onPress when disabled', () => {
      const onPressMock = jest.fn();
      const { getByText } = render(
        <EnhancedButton 
          title="Disabled Button" 
          onPress={onPressMock} 
          disabled={true}
        />
      );
      
      const button = getByText('Disabled Button');
      fireEvent.press(button);
      
      expect(onPressMock).not.toHaveBeenCalled();
    });

    it('shows loading state correctly', () => {
      const { getByTestId } = render(
        <EnhancedButton 
          title="Loading Button" 
          onPress={() => {}} 
          loading={true}
          testID="loading-button"
        />
      );
      
      expect(getByTestId('loading-button')).toBeTruthy();
    });
  });

  describe('Variants', () => {
    const variants = ['primary', 'secondary', 'ghost', 'danger'] as const;
    
    variants.forEach(variant => {
      it(`renders ${variant} variant correctly`, () => {
        const { getByText } = render(
          <EnhancedButton 
            title={`${variant} Button`} 
            variant={variant}
            onPress={() => {}} 
          />
        );
        
        expect(getByText(`${variant} Button`)).toBeTruthy();
      });
    });
  });

  describe('Sizes', () => {
    const sizes = ['small', 'medium', 'large'] as const;
    
    sizes.forEach(size => {
      it(`renders ${size} size correctly`, () => {
        const { getByText } = render(
          <EnhancedButton 
            title={`${size} Button`} 
            size={size}
            onPress={() => {}} 
          />
        );
        
        expect(getByText(`${size} Button`)).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('has correct accessibility role', () => {
      const { getByRole } = render(
        <EnhancedButton title="Accessible Button" onPress={() => {}} />
      );
      
      expect(getByRole('button')).toBeTruthy();
    });

    it('announces loading state to screen readers', () => {
      const { getByLabelText } = render(
        <EnhancedButton 
          title="Loading Button" 
          onPress={() => {}} 
          loading={true}
        />
      );
      
      expect(getByLabelText('Loading Button, loading')).toBeTruthy();
    });

    it('announces disabled state to screen readers', () => {
      const { getByText } = render(
        <EnhancedButton 
          title="Disabled Button" 
          onPress={() => {}} 
          disabled={true}
        />
      );
      
      const button = getByText('Disabled Button');
      expect(button.props.accessibilityState?.disabled).toBe(true);
    });
  });

  describe('Performance', () => {
    it('renders within performance threshold', () => {
      const startTime = performance.now();
      
      render(
        <EnhancedButton title="Performance Test" onPress={() => {}} />
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render in less than 50ms
      expect(renderTime).toBeLessThan(50);
    });

    it('handles multiple rapid presses gracefully', async () => {
      const onPressMock = jest.fn();
      const { getByText } = render(
        <EnhancedButton title="Rapid Press Test" onPress={onPressMock} />
      );
      
      const button = getByText('Rapid Press Test');
      
      // Simulate rapid presses
      for (let i = 0; i < 10; i++) {
        fireEvent.press(button);
      }
      
      await waitFor(() => {
        expect(onPressMock).toHaveBeenCalledTimes(10);
      });
    });
  });
});
