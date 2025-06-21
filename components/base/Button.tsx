import { ThemedText } from '@/components/ThemedText';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

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

  const buttonStyles = [...getButtonStyles(), style];
  const labelTextStyles = [...getLabelStyles(), labelStyle];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {leftIcon && !label && !rightIcon ? (
        // Centraliza o ícone se não houver label
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>{leftIcon}</View>
      ) : (
        <>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <ThemedText style={labelTextStyles}>{label}</ThemedText>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </>
      )}
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
  iconLeft: {
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRight: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Button;
