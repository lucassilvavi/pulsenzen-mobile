import { useBiometricAuth } from '@/context/BiometricAuthContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity
} from 'react-native';
import { Colors } from '../../constants/Colors';

interface BiometricLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  style?: any;
  compact?: boolean;
}

const BiometricLoginButton: React.FC<BiometricLoginButtonProps> = ({
  onSuccess,
  onError,
  disabled = false,
  style,
  compact = false,
}) => {
  const {
    isAvailable,
    isEnabled,
    isLoading,
    loginWithBiometric,
  } = useBiometricAuth();

  /**
   * Handle biometric login
   */
  const handleLogin = async () => {
    try {
      const success = await loginWithBiometric();
      
      if (success) {
        onSuccess?.();
      } else {
        onError?.('Biometric authentication failed');
      }
    } catch (error) {
      onError?.('An error occurred during biometric authentication');
    }
  };

  // Don't render if biometric is not available or enabled
  if (!isAvailable || !isEnabled) {
    return null;
  }

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactButton, style]}
        onPress={handleLogin}
        disabled={disabled || isLoading}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.primary[600]} />
        ) : (
          <Ionicons 
            name="finger-print" 
            size={24} 
            color={disabled ? Colors.gray[400] : Colors.primary[600]} 
          />
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.disabledButton,
        style
      ]}
      onPress={handleLogin}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <>
          <Ionicons name="finger-print" size={20} color="white" />
          <Text style={styles.buttonText}>Use Biometric</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary[600],
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    minHeight: 56,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  disabledButton: {
    opacity: 0.5,
  },
  compactButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
});

export default BiometricLoginButton;
