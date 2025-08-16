import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    AccessibilityRole,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    interpolate,
    interpolateColor,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import {
    useAccessibilityProps,
    useLiveRegion,
    useReducedMotion,
    useScreenReaderAnnouncement
} from '../../hooks/useAccessibility';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface EnhancedTextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: 'off' | 'username' | 'password' | 'email' | 'name' | 'tel' | 'street-address' | 'postal-code' | 'cc-number';
  error?: string;
  helperText?: string;
  disabled?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  showCharacterCount?: boolean;
  autoFocus?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  testID?: string;
}

/**
 * Enhanced text input with animations, accessibility, and rich features
 */
export const EnhancedTextInput: React.FC<EnhancedTextInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoComplete,
  error,
  helperText,
  disabled = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  showCharacterCount = false,
  autoFocus = false,
  onFocus,
  onBlur,
  testID,
}) => {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showSecure, setShowSecure] = useState(secureTextEntry);
  
  const focusScale = useSharedValue(1);
  const labelPosition = useSharedValue(value ? 1 : 0);
  const borderColor = useSharedValue(0);
  const announceToScreenReader = useScreenReaderAnnouncement();
  const isReducedMotion = useReducedMotion();

  // Live region for error announcements
  useLiveRegion(error || '', 'assertive');

  const accessibilityProps = useAccessibilityProps({
    label: `${label} input field`,
    hint: error ? `Error: ${error}` : helperText,
    role: 'none' as AccessibilityRole, // Let TextInput handle its own role
    state: {
      disabled,
      busy: false,
    },
  });

  useEffect(() => {
    if (value) {
      labelPosition.value = withSpring(1);
    } else if (!isFocused) {
      labelPosition.value = withSpring(0);
    }
  }, [value, isFocused]);

  useEffect(() => {
    if (error) {
      borderColor.value = withTiming(2); // Error state
    } else if (isFocused) {
      borderColor.value = withTiming(1); // Focused state
    } else {
      borderColor.value = withTiming(0); // Default state
    }
  }, [error, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    if (!isReducedMotion) {
      focusScale.value = withSpring(1.02);
      labelPosition.value = withSpring(1);
    }
    announceToScreenReader(`${label} focused`);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!isReducedMotion) {
      focusScale.value = withSpring(1);
    }
    if (!value) {
      labelPosition.value = withSpring(0);
    }
    onBlur?.();
  };

  const handleTextChange = (text: string) => {
    onChangeText(text);
    
    // Announce character count for accessibility
    if (showCharacterCount && maxLength) {
      const remaining = maxLength - text.length;
      if (remaining <= 10 && remaining > 0) {
        announceToScreenReader(`${remaining} characters remaining`);
      } else if (remaining === 0) {
        announceToScreenReader('Character limit reached');
      }
    }
  };

  const toggleSecureEntry = () => {
    setShowSecure(!showSecure);
    announceToScreenReader(showSecure ? 'Password hidden' : 'Password visible');
  };

  // Focus gesture for better touch targets
  const focusGesture = Gesture.Tap()
    .onEnd(() => {
      runOnJS(() => {
        inputRef.current?.focus();
      })();
    });

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: focusScale.value }],
  }));

  const labelStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      labelPosition.value,
      [0, 1],
      [multiline ? 20 : 16, -8]
    );
    
    const scale = interpolate(
      labelPosition.value,
      [0, 1],
      [1, 0.85]
    );

    return {
      transform: [
        { translateY },
        { scale },
      ],
    };
  });

  const borderStyle = useAnimatedStyle(() => {
    const colors = ['#E5E5EA', '#007AFF', '#FF3B30']; // default, focused, error
    const color = interpolateColor(
      borderColor.value,
      [0, 1, 2],
      colors
    );

    return {
      borderColor: color,
      borderWidth: borderColor.value > 0 ? 2 : 1,
    };
  });

  const characterCount = value ? value.length : 0;
  const isNearLimit = maxLength && characterCount > maxLength * 0.8;
  const isOverLimit = maxLength && characterCount > maxLength;

  return (
    <View style={styles.container}>
      {/* Floating Label */}
      <Animated.View style={[styles.labelContainer, labelStyle]}>
        <Text style={[
          styles.label,
          isFocused && styles.labelFocused,
          error && styles.labelError,
        ]}>
          {label}
        </Text>
      </Animated.View>

      {/* Input Container */}
      <GestureDetector gesture={focusGesture}>
        <Animated.View style={[styles.inputContainer, containerStyle, borderStyle]}>
          {/* Left Icon */}
          {leftIcon && (
            <View style={styles.leftIconContainer}>
              <Ionicons
                name={leftIcon}
                size={20}
                color={isFocused ? '#007AFF' : '#8E8E93'}
              />
            </View>
          )}

          {/* Text Input */}
          <AnimatedTextInput
            ref={inputRef}
            style={[
              styles.input,
              multiline && styles.multilineInput,
              leftIcon && styles.inputWithLeftIcon,
              (rightIcon || secureTextEntry) && styles.inputWithRightIcon,
            ]}
            value={value}
            onChangeText={handleTextChange}
            placeholder={isFocused ? '' : placeholder}
            placeholderTextColor="#C7C7CC"
            multiline={multiline}
            numberOfLines={multiline ? numberOfLines : 1}
            maxLength={maxLength}
            secureTextEntry={showSecure}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoComplete={autoComplete}
            editable={!disabled}
            autoFocus={autoFocus}
            onFocus={handleFocus}
            onBlur={handleBlur}
            testID={testID}
            {...accessibilityProps}
          />

          {/* Right Icon / Secure Toggle */}
          {(rightIcon || secureTextEntry) && (
            <Pressable
              style={styles.rightIconContainer}
              onPress={secureTextEntry ? toggleSecureEntry : onRightIconPress}
              accessible={true}
              accessibilityLabel={
                secureTextEntry 
                  ? (showSecure ? 'Show password' : 'Hide password')
                  : 'Action button'
              }
              accessibilityRole="button"
            >
              <Ionicons
                name={
                  secureTextEntry 
                    ? (showSecure ? 'eye-off-outline' : 'eye-outline')
                    : rightIcon!
                }
                size={20}
                color={isFocused ? '#007AFF' : '#8E8E93'}
              />
            </Pressable>
          )}
        </Animated.View>
      </GestureDetector>

      {/* Helper Text / Error / Character Count */}
      <View style={styles.bottomContainer}>
        <View style={styles.messageContainer}>
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : helperText ? (
            <Text style={styles.helperText}>{helperText}</Text>
          ) : null}
        </View>

        {showCharacterCount && maxLength && (
          <Text style={[
            styles.characterCount,
            isNearLimit ? styles.characterCountWarning : null,
            isOverLimit ? styles.characterCountError : null,
          ]}>
            {characterCount}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  labelContainer: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  labelFocused: {
    color: '#007AFF',
  },
  labelError: {
    color: '#FF3B30',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    minHeight: 48,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1C1C1E',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  leftIconContainer: {
    paddingLeft: 16,
    paddingRight: 8,
    justifyContent: 'center',
  },
  rightIconContainer: {
    paddingRight: 16,
    paddingLeft: 8,
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  messageContainer: {
    flex: 1,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '500',
  },
  helperText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  characterCount: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 8,
  },
  characterCountWarning: {
    color: '#FF9500',
  },
  characterCountError: {
    color: '#FF3B30',
    fontWeight: '600',
  },
});
