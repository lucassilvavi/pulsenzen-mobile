import Button from '@/components/base/Button';
import Card from '@/components/base/Card';
import CustomTextInput from '@/components/base/CustomTextInput';
import ScreenContainer from '@/components/base/ScreenContainer';
import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Dimensions,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import API_CONFIG from '../../config/api';

const { height } = Dimensions.get('window');

// Web-compatible alert helper
const showConfirmAlert = (
  title: string,
  message: string,
  options: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }>
) => {
  if (Platform.OS === 'web') {
    const confirmed = window.confirm(`${title}\n\n${message}`);
    if (confirmed) {
      const confirmOption = options.find(opt => opt.style !== 'cancel');
      if (confirmOption?.onPress) {
        confirmOption.onPress();
      }
    } else {
      const cancelOption = options.find(opt => opt.style === 'cancel');
      if (cancelOption?.onPress) {
        cancelOption.onPress();
      }
    }
  } else {
    Alert.alert(title, message, options);
  }
};

export default function NewPasswordScreen() {
  const router = useRouter();
  const { email, code } = useLocalSearchParams<{ email: string; code: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  const validatePassword = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 8) {
      newErrors.password = 'A senha deve ter pelo menos 8 caracteres';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validatePassword()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/password-reset/reset-with-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code,
          password,
          password_confirmation: confirmPassword,
        }),
      });

      const data = await response.json();

      console.log('Password reset response:', data);

      if (data.success) {
        console.log('Password reset successful, showing alert...');
        
        showConfirmAlert(
          'Senha redefinida! ✅',
          'Sua senha foi alterada com sucesso. Você já pode fazer login.',
          [
            {
              text: 'OK',
              onPress: () => {
                router.replace('/onboarding/auth');
              },
            },
          ]
        );
      } else {
        console.log('Password reset failed:', data.message);
        Alert.alert('Erro', data.message || 'Não foi possível alterar a senha');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      Alert.alert('Erro', 'Não foi possível alterar a senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return '';
    if (password.length < 8) return 'Fraca';
    if (password.length < 12) return 'Média';
    return 'Forte';
  };

  const getPasswordStrengthColor = () => {
    const strength = getPasswordStrength();
    if (strength === 'Fraca') return colors.error.main;
    if (strength === 'Média') return '#ffa500';
    return colors.success.main;
  };

  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  return (
    <ScreenContainer
      gradientColors={colors.gradients.primary}
      gradientHeight={height * 0.3}
    >
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Ionicons name="arrow-back" size={24} color={colors.neutral.text.primary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <ThemedText style={styles.title}>Nova Senha</ThemedText>
          <ThemedText style={styles.subtitle}>
            Crie uma senha forte para proteger sua conta
          </ThemedText>
        </View>

        <Card style={styles.formCard}>
          <View style={styles.form}>
            <CustomTextInput
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors({ ...errors, password: undefined });
              }}
              placeholder="Nova senha"
              containerStyle={styles.input}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!loading}
              rightIcon={
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color={colors.neutral.text.disabled} 
                  />
                </TouchableOpacity>
              }
            />
            {errors.password && (
              <ThemedText style={styles.errorText}>{errors.password}</ThemedText>
            )}

            {/* Password Strength */}
            {password.length > 0 && (
              <View style={styles.strengthContainer}>
                <ThemedText style={styles.strengthLabel}>Força da senha:</ThemedText>
                <ThemedText style={[styles.strengthText, { color: getPasswordStrengthColor() }]}>
                  {getPasswordStrength()}
                </ThemedText>
              </View>
            )}

            <CustomTextInput
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setErrors({ ...errors, confirmPassword: undefined });
              }}
              placeholder="Confirmar nova senha"
              containerStyle={styles.input}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              editable={!loading}
              rightIcon={
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.passwordToggle}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color={colors.neutral.text.disabled} 
                  />
                </TouchableOpacity>
              }
            />
            {errors.confirmPassword && (
              <ThemedText style={styles.errorText}>{errors.confirmPassword}</ThemedText>
            )}

            {/* Password Match Indicator */}
            {passwordsMatch && (
              <View style={styles.matchContainer}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success.main} />
                <ThemedText style={styles.matchText}>Senhas coincidem</ThemedText>
              </View>
            )}

            {/* Password Requirements */}
            <View style={styles.requirementsContainer}>
              <ThemedText style={styles.requirementsTitle}>Requisitos da senha:</ThemedText>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={password.length >= 8 ? "checkmark-circle" : "close-circle"} 
                  size={16} 
                  color={password.length >= 8 ? colors.success.main : colors.neutral.text.disabled} 
                />
                <ThemedText style={styles.requirementText}>Mínimo 8 caracteres</ThemedText>
              </View>
            </View>

            <Button
              label="Redefinir Senha"
              onPress={handleResetPassword}
              style={styles.submitButton}
              loading={loading}
              disabled={loading}
            />
          </View>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral.background,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.sm,
    color: colors.neutral.text.primary,
  },
  subtitle: {
    fontSize: fontSize.md,
    textAlign: 'center',
    color: colors.neutral.text.secondary,
    lineHeight: 24,
  },
  formCard: {
    marginBottom: spacing.lg,
  },
  form: {
    padding: spacing.lg,
  },
  input: {
    marginBottom: spacing.sm,
  },
  passwordToggle: {
    padding: spacing.xs,
  },
  errorText: {
    color: colors.error.main,
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  strengthLabel: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.secondary,
  },
  strengthText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  matchText: {
    fontSize: fontSize.sm,
    color: colors.success.main,
    fontWeight: '500',
  },
  requirementsContainer: {
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.neutral.divider,
    borderRadius: 8,
  },
  requirementsTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.sm,
    color: colors.neutral.text.primary,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  requirementText: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.secondary,
  },
  submitButton: {
    marginTop: spacing.md,
  },
});
