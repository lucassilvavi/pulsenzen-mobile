import { ThemedText } from '@/components/ThemedText';
import React from 'react';
import { TextInput as RNTextInput, StyleSheet, TextInputProps, TextStyle, View, ViewStyle } from 'react-native';

interface CustomTextInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <ThemedText style={styles.label}>{label}</ThemedText>}
      
      <View style={[
        styles.inputContainer,
        error ? styles.inputError : null,
      ]}>
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
        
        <RNTextInput
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeftIcon : null,
            rightIcon ? styles.inputWithRightIcon : null,
            inputStyle
          ]}
          placeholderTextColor="#9E9E9E"
          {...props}
        />
        
        {rightIcon && (
          <View style={styles.rightIconContainer}>
            {onRightIconPress ? (
              <View onTouchEnd={onRightIconPress}>
                {rightIcon}
              </View>
            ) : (
              rightIcon
            )}
          </View>
        )}
      </View>
      
      {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#F44336',
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#212121',
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  leftIconContainer: {
    paddingLeft: 16,
  },
  rightIconContainer: {
    paddingRight: 16,
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
});

export default CustomTextInput;
