import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle, TextStyle } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';
import * as Haptics from 'expo-haptics';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  backgroundColor?: string;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  labelStyle,
  leftIcon,
  rightIcon,
  backgroundColor,
  fullWidth = false,
}) => {
  const handlePress = () => {
    if (disabled) return;
    
    // Provide haptic feedback on button press
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (onPress) {
      onPress();
    }
  };

  // Determine button styles based on variant and size
  const getButtonStyles = () => {
    let buttonStyles = [styles.button];
    
    // Add variant styles
    switch (variant) {
      case 'primary':
        buttonStyles.push(styles.primaryButton);
        if (backgroundColor) {
          buttonStyles.push({ backgroundColor });
        }
        break;
      case 'secondary':
        buttonStyles.push(styles.secondaryButton);
        break;
      case 'outline':
        buttonStyles.push(styles.outlineButton);
        break;
      case 'text':
        buttonStyles.push(styles.textButton);
        break;
    }
    
    // Add size styles
    switch (size) {
      case 'small':
        buttonStyles.push(styles.smallButton);
        break;
      case 'medium':
        buttonStyles.push(styles.mediumButton);
        break;
      case 'large':
        buttonStyles.push(styles.largeButton);
        break;
    }
    
    // Add disabled styles
    if (disabled) {
      buttonStyles.push(styles.disabledButton);
    }
    
    // Add full width style
    if (fullWidth) {
      buttonStyles.push(styles.fullWidth);
    }
    
    return buttonStyles;
  };

  // Determine label styles based on variant and size
  const getLabelStyles = () => {
    let textStyles = [styles.label];
    
    // Add variant styles
    switch (variant) {
      case 'primary':
        textStyles.push(styles.primaryLabel);
        break;
      case 'secondary':
        textStyles.push(styles.secondaryLabel);
        break;
      case 'outline':
        textStyles.push(styles.outlineLabel);
        break;
      case 'text':
        textStyles.push(styles.textLabel);
        break;
    }
    
    // Add size styles
    switch (size) {
      case 'small':
        textStyles.push(styles.smallLabel);
        break;
      case 'medium':
        textStyles.push(styles.mediumLabel);
        break;
      case 'large':
        textStyles.push(styles.largeLabel);
        break;
    }
    
    // Add disabled styles
    if (disabled) {
      textStyles.push(styles.disabledLabel);
    }
    
    return textStyles;
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyles(), style]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.contentContainer}>
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
        <ThemedText style={[...getLabelStyles(), labelStyle]}>{label}</ThemedText>
        {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#2196F3',
  },
  secondaryButton: {
    backgroundColor: '#E3F2FD',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  textButton: {
    backgroundColor: 'transparent',
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  disabledButton: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIconContainer: {
    marginRight: 8,
  },
  rightIconContainer: {
    marginLeft: 8,
  },
  label: {
    fontWeight: '600',
  },
  primaryLabel: {
    color: '#FFFFFF',
  },
  secondaryLabel: {
    color: '#2196F3',
  },
  outlineLabel: {
    color: '#2196F3',
  },
  textLabel: {
    color: '#2196F3',
  },
  smallLabel: {
    fontSize: 14,
  },
  mediumLabel: {
    fontSize: 16,
  },
  largeLabel: {
    fontSize: 18,
  },
  disabledLabel: {
    opacity: 0.7,
  },
});

export default Button;
