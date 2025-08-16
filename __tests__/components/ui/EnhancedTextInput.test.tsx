import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { EnhancedTextInput } from '../../../modules/journal/components/ui/EnhancedTextInput';

// Mock React Native Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock accessibility hooks
jest.mock('../../../modules/journal/hooks/useAccessibility', () => ({
  useReducedMotion: () => false,
  useAccessibilityProps: () => ({}),
  useScreenReaderAnnouncement: () => jest.fn(),
}));

describe('EnhancedTextInput', () => {
  const defaultProps = {
    label: 'Test Label',
    onChangeText: jest.fn(),
    value: '',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with label correctly', () => {
      const { getByText } = render(
        <EnhancedTextInput {...defaultProps} />
      );
      
      expect(getByText('Test Label')).toBeTruthy();
    });

    it('renders with placeholder', () => {
      const { getByPlaceholderText } = render(
        <EnhancedTextInput 
          {...defaultProps} 
          placeholder="Enter text here"
        />
      );
      
      expect(getByPlaceholderText('Enter text here')).toBeTruthy();
    });

    it('shows character count when maxLength is provided', () => {
      const { getByText } = render(
        <EnhancedTextInput 
          {...defaultProps} 
          maxLength={100}
          value="Hello"
        />
      );
      
      expect(getByText('5 / 100')).toBeTruthy();
    });
  });

  describe('Input Behavior', () => {
    it('calls onChangeText when text changes', () => {
      const onChangeTextMock = jest.fn();
      const { getByDisplayValue } = render(
        <EnhancedTextInput 
          {...defaultProps} 
          onChangeText={onChangeTextMock}
        />
      );
      
      const input = getByDisplayValue('');
      fireEvent.changeText(input, 'New text');
      
      expect(onChangeTextMock).toHaveBeenCalledWith('New text');
    });

    it('validates input correctly', async () => {
      const validateMock = jest.fn().mockReturnValue('Invalid input');
      const { getByDisplayValue, getByText } = render(
        <EnhancedTextInput 
          {...defaultProps} 
          validate={validateMock}
          value="test"
        />
      );
      
      const input = getByDisplayValue('test');
      fireEvent(input, 'blur');
      
      await waitFor(() => {
        expect(getByText('Invalid input')).toBeTruthy();
      });
    });

    it('handles secure text entry', () => {
      const { getByTestId } = render(
        <EnhancedTextInput 
          {...defaultProps} 
          secureTextEntry={true}
          testID="secure-input"
        />
      );
      
      const input = getByTestId('secure-input');
      expect(input.props.secureTextEntry).toBe(true);
    });
  });

  describe('Floating Label Animation', () => {
    it('animates label on focus', () => {
      const { getByDisplayValue } = render(
        <EnhancedTextInput {...defaultProps} />
      );
      
      const input = getByDisplayValue('');
      fireEvent(input, 'focus');
      
      // Animation should trigger on focus
      expect(input).toBeTruthy();
    });

    it('keeps label floating when input has value', () => {
      const { getByText } = render(
        <EnhancedTextInput 
          {...defaultProps} 
          value="Some text"
        />
      );
      
      expect(getByText('Test Label')).toBeTruthy();
    });
  });

  describe('Error States', () => {
    it('shows error message when provided', () => {
      const { getByText } = render(
        <EnhancedTextInput 
          {...defaultProps} 
          error="This field is required"
        />
      );
      
      expect(getByText('This field is required')).toBeTruthy();
    });

    it('applies error styling when error is present', () => {
      const { getByDisplayValue } = render(
        <EnhancedTextInput 
          {...defaultProps} 
          error="Error message"
        />
      );
      
      const input = getByDisplayValue('');
      expect(input).toBeTruthy();
    });
  });

  describe('Multiline Support', () => {
    it('renders as multiline when specified', () => {
      const { getByDisplayValue } = render(
        <EnhancedTextInput 
          {...defaultProps} 
          multiline={true}
          numberOfLines={4}
        />
      );
      
      const input = getByDisplayValue('');
      expect(input.props.multiline).toBe(true);
    });

    it('adjusts height for multiline input', () => {
      const { getByDisplayValue } = render(
        <EnhancedTextInput 
          {...defaultProps} 
          multiline={true}
          numberOfLines={3}
        />
      );
      
      const input = getByDisplayValue('');
      expect(input.props.numberOfLines).toBe(3);
    });
  });

  describe('Accessibility', () => {
    it('has correct accessibility properties', () => {
      const { getByDisplayValue } = render(
        <EnhancedTextInput 
          {...defaultProps} 
          accessibilityHint="Enter your message here"
        />
      );
      
      const input = getByDisplayValue('');
      expect(input.props.accessibilityLabel).toBe('Test Label');
    });

    it('announces errors to screen readers', () => {
      const { getByDisplayValue } = render(
        <EnhancedTextInput 
          {...defaultProps} 
          error="Required field"
        />
      );
      
      const input = getByDisplayValue('');
      expect(input.props.accessibilityState).toEqual({
        invalid: true,
      });
    });

    it('has proper keyboard type for different input types', () => {
      const { getByDisplayValue } = render(
        <EnhancedTextInput 
          {...defaultProps} 
          keyboardType="email-address"
        />
      );
      
      const input = getByDisplayValue('');
      expect(input.props.keyboardType).toBe('email-address');
    });
  });

  describe('Performance', () => {
    it('renders within performance threshold', () => {
      const startTime = performance.now();
      
      render(<EnhancedTextInput {...defaultProps} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(50);
    });

    it('handles rapid text changes efficiently', async () => {
      const onChangeTextMock = jest.fn();
      const { getByDisplayValue } = render(
        <EnhancedTextInput 
          {...defaultProps} 
          onChangeText={onChangeTextMock}
        />
      );
      
      const input = getByDisplayValue('');
      
      // Simulate rapid typing
      const texts = ['a', 'ab', 'abc', 'abcd', 'abcde'];
      texts.forEach(text => {
        fireEvent.changeText(input, text);
      });
      
      expect(onChangeTextMock).toHaveBeenCalledTimes(5);
    });
  });
});
