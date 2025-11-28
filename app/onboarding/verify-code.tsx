import Button from '@/components/base/Button';
import Card from '@/components/base/Card';
import ScreenContainer from '@/components/base/ScreenContainer';
import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import API_CONFIG from '../../config/api';

const { height } = Dimensions.get('window');

// Web-compatible alert helper
const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function VerifyCodeScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Focus on first input when screen loads
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 300);
  }, []);

  const handleCodeChange = (text: string, index: number) => {
    // Only allow numbers
    if (text && !/^\d+$/.test(text)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits are entered
    if (text && index === 5 && newCode.every((digit) => digit !== '')) {
      handleVerifyCode(newCode.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async (codeString?: string) => {
    const fullCode = codeString || code.join('');

    if (fullCode.length !== 6) {
      Alert.alert('Atenção', 'Por favor, digite o código de 6 dígitos');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/password-reset/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code: fullCode,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push({
          pathname: '/onboarding/new-password',
          params: { email, code: fullCode },
        });
      } else {
        showAlert('Código inválido', data.message || 'Código incorreto ou expirado');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      showAlert('Erro', 'Não foi possível verificar o código. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/password-reset/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        showAlert('Código reenviado! 📧', 'Verifique seu email novamente.');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        showAlert('Erro', data.message || 'Não foi possível reenviar o código');
      }
    } catch (error) {
      console.error('Error resending code:', error);
      showAlert('Erro', 'Não foi possível reenviar o código. Tente novamente.');
    } finally {
      setResending(false);
    }
  };

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
          <ThemedText style={styles.title}>Verificar Código</ThemedText>
          <ThemedText style={styles.subtitle}>
            Enviamos um código de 6 dígitos para{'\n'}
            <ThemedText style={styles.emailText}>{email}</ThemedText>
          </ThemedText>
        </View>

        <Card style={styles.formCard}>
          <View style={styles.form}>
            {/* Code Inputs */}
            <View style={styles.codeContainer}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  style={[styles.codeInput, digit && styles.codeInputFilled]}
                  value={digit}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  editable={!loading && !resending}
                  selectTextOnFocus
                />
              ))}
            </View>

            <Button
              label="Verificar Código"
              onPress={() => handleVerifyCode()}
              style={styles.submitButton}
              loading={loading}
              disabled={loading || code.some((digit) => !digit)}
            />

            {/* Resend Code */}
            <View style={styles.resendContainer}>
              <ThemedText style={styles.resendLabel}>Não recebeu o código?</ThemedText>
              <TouchableOpacity
                onPress={handleResendCode}
                disabled={loading || resending}
                style={styles.resendButtonContainer}
              >
                <ThemedText style={[styles.resendButtonText, (loading || resending) && styles.resendButtonDisabled]}>
                  {resending ? 'Reenviando...' : 'Reenviar'}
                </ThemedText>
              </TouchableOpacity>
            </View>
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
  emailText: {
    fontWeight: '600',
    color: colors.primary.contrast,
  },
  formCard: {
    marginBottom: spacing.lg,
  },
  form: {
    padding: spacing.lg,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  codeInput: {
    width: 50,
    height: 60,
    backgroundColor: colors.neutral.background,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary.main,
    borderWidth: 2,
    borderColor: colors.neutral.divider,
  },
  codeInputFilled: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.light,
  },
  submitButton: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  resendLabel: {
    color: colors.neutral.text.secondary,
    fontSize: fontSize.sm,
  },
  resendButtonContainer: {
    padding: spacing.xs,
  },
  resendButtonText: {
    color: colors.primary.main,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
});
