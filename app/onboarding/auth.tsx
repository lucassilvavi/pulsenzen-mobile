import Button from '@/components/base/Button';
import Card from '@/components/base/Card';
import CustomTextInput from '@/components/base/CustomTextInput';
import ScreenContainer from '@/components/base/ScreenContainer';
import { BiometricLoginButton, BiometricSetup, useBiometricAuth } from '@/components/biometric';
import DebugConfigModal from '@/components/modals/DebugConfigModal';
import PrivacyModal from '@/components/modals/PrivacyModal';
import TermsModal from '@/components/modals/TermsModal';
import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { AppVersion } from '@/utils/AppVersion';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

const { height } = Dimensions.get('window');

export default function AuthScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const { register, login, isLoading, checkAuthStatus } = useAuth();
  
  const [isLoginMode, setIsLoginMode] = useState(mode === 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showDebugModal, setShowDebugModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Biometric authentication hook
  const {
    isAvailable: isBiometricAvailable,
    isEnabled: isBiometricEnabled,
    refreshState,
  } = useBiometricAuth();

  // Refresh biometric state when component mounts or when switching to login mode
  useEffect(() => {
    if (isLoginMode) {
      refreshState();
    }
  }, [isLoginMode, refreshState]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Senha deve ter pelo menos 8 caracteres';
    }

    if (!isLoginMode) {
      // Name validation for registration
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'Nome é obrigatório';
      }
      
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Sobrenome é obrigatório';
      }

      // Password confirmation
      if (!formData.password_confirmation) {
        newErrors.password_confirmation = 'Confirmação de senha é obrigatória';
      } else if (formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = 'Senhas não coincidem';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      let result;
      
      if (isLoginMode) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register({
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
          firstName: formData.firstName,
          lastName: formData.lastName,
        });
      }

      if (result.success) {
        if (isLoginMode) {
          // Check if user should be prompted for biometric setup
          if (isBiometricAvailable && !isBiometricEnabled) {
            setTimeout(() => {
              Alert.alert(
                '🔐 Segurança Aprimorada',
                'Quer habilitar autenticação biométrica para um acesso mais rápido e seguro?',
                [
                  { text: 'Agora não', style: 'cancel' },
                  { 
                    text: 'Configurar', 
                    onPress: () => setShowBiometricSetup(true)
                  }
                ]
              );
            }, 1000);
          }
          // For login, let NavigationHandler decide where to go based on onboarding status
          // Don't navigate manually - let the NavigationHandler in _layout handle it
        } else {
          // For registration, go to personal info collection (new users need onboarding)
          (router as any).replace('/onboarding/personal-info');
        }
      } else {
        // Use different alert types based on whether it's informational or an error
        if (result.isInformational) {
          // For informational messages (like "email already exists"), use a neutral alert
          Alert.alert('Informação', result.message, [{ text: 'OK', style: 'default' }]);
        } else {
          // For real errors, use error alert
          Alert.alert('Erro', result.message, [{ text: 'OK', style: 'cancel' }]);
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert('Erro', 'Ocorreu um erro inesperado. Tente novamente.');
    }
  };

  /**
   * Handle biometric login success
   */
  const handleBiometricSuccess = async () => {
    console.log('Biometric login successful');
    // Force auth context to refresh and recognize the new authentication state
    try {
      // Refresh the auth context to pick up the newly saved auth data
      await checkAuthStatus();
      // Navigation will be handled by NavigationHandler in _layout after context updates
    } catch (error) {
      console.error('Error refreshing auth state after biometric login:', error);
      // Fallback to direct navigation
      router.replace('/');
    }
  };

  /**
   * Handle biometric login error
   */
  const handleBiometricError = (error: string) => {
    console.error('Biometric login error:', error);
    // Don't show alert for user cancellation
    if (!error.toLowerCase().includes('cancel')) {
      Alert.alert('❌ Autenticação Biométrica Falhou', error);
    }
  };

  /**
   * Handle biometric setup completion
   */
  const handleBiometricSetupComplete = () => {
    Alert.alert(
      '🎉 Sucesso!',
      'Autenticação biométrica configurada com sucesso! Agora você pode fazer login de forma rápida e segura.',
      [{ text: 'Ótimo!' }]
    );
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setErrors({});
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      password_confirmation: '',
    });
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
        <View style={styles.header}>
          <ThemedText style={styles.title}>
            {isLoginMode ? 'Entrar' : 'Criar Conta'}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {isLoginMode 
              ? 'Acesse sua conta para continuar sua jornada'
              : 'Crie sua conta para começar sua jornada de bem-estar'
            }
          </ThemedText>
        </View>

        <Card style={styles.formCard}>
          <View style={styles.form}>
            {!isLoginMode && (
              <>
                <View style={styles.nameRow}>
                  <View style={styles.nameInput}>
                    <CustomTextInput
                      value={formData.firstName}
                      onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                      placeholder="Nome"
                      containerStyle={styles.input}
                      autoCapitalize="words"
                    />
                    {errors.firstName && (
                      <ThemedText style={styles.errorText}>{errors.firstName}</ThemedText>
                    )}
                  </View>
                  
                  <View style={styles.nameInput}>
                    <CustomTextInput
                      value={formData.lastName}
                      onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                      placeholder="Sobrenome"
                      containerStyle={styles.input}
                      autoCapitalize="words"
                    />
                    {errors.lastName && (
                      <ThemedText style={styles.errorText}>{errors.lastName}</ThemedText>
                    )}
                  </View>
                </View>
              </>
            )}

            <CustomTextInput
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="Email"
              containerStyle={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <ThemedText style={styles.errorText}>{errors.email}</ThemedText>
            )}

            <CustomTextInput
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              placeholder="Senha"
              containerStyle={styles.input}
              secureTextEntry={!showPassword}
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

            {!isLoginMode && (
              <>
                <CustomTextInput
                  value={formData.password_confirmation}
                  onChangeText={(text) => setFormData({ ...formData, password_confirmation: text })}
                  placeholder="Confirmar Senha"
                  containerStyle={styles.input}
                  secureTextEntry
                />
                {errors.password_confirmation && (
                  <ThemedText style={styles.errorText}>{errors.password_confirmation}</ThemedText>
                )}
              </>
            )}

            <Button
              label={isLoginMode ? 'Entrar' : 'Criar Conta'}
              onPress={handleSubmit}
              style={styles.submitButton}
              loading={isLoading}
              disabled={isLoading}
            />

            {/* Biometric Login Button - Only show on login mode */}
            {isLoginMode && isBiometricAvailable && isBiometricEnabled && (
              <>
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <ThemedText style={styles.dividerText}>ou</ThemedText>
                  <View style={styles.dividerLine} />
                </View>

                <BiometricLoginButton
                  onSuccess={handleBiometricSuccess}
                  onError={handleBiometricError}
                  disabled={isLoading}
                  style={styles.biometricButton}
                />
              </>
            )}

            <TouchableOpacity style={styles.toggleButton} onPress={toggleMode}>
              <ThemedText style={styles.toggleText}>
                {isLoginMode 
                  ? 'Não tem uma conta? Criar conta'
                  : 'Já tem uma conta? Entrar'
                }
              </ThemedText>
            </TouchableOpacity>

            {/* Debug Button - Always visible for troubleshooting */}
            <TouchableOpacity 
              style={styles.debugButton} 
              onPress={() => setShowDebugModal(true)}
            >
              <Ionicons name="bug" size={16} color={colors.neutral.text.secondary} />
              <ThemedText style={styles.debugText}>Debug Config</ThemedText>
            </TouchableOpacity>
          </View>
        </Card>

        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            Ao continuar, você concorda com nossos
          </ThemedText>
          <View style={styles.linksRow}>
            <TouchableOpacity onPress={() => setShowTermsModal(true)}>
              <ThemedText style={styles.linkText}>Termos de Uso</ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.footerText}> e </ThemedText>
            <TouchableOpacity onPress={() => setShowPrivacyModal(true)}>
              <ThemedText style={styles.linkText}>Política de Privacidade</ThemedText>
            </TouchableOpacity>
          </View>
          
          {/* App Version */}
          <View style={styles.versionContainer}>
            <ThemedText style={styles.versionText}>
              PulseZen {AppVersion.getSimpleVersion()}
            </ThemedText>
          </View>
        </View>

        {/* Biometric Setup Modal */}
        <BiometricSetup
          visible={showBiometricSetup}
          onClose={() => setShowBiometricSetup(false)}
          onSetupComplete={handleBiometricSetupComplete}
        />
      </ScrollView>
      
      <TermsModal
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
      
      <PrivacyModal
        visible={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
      
      <DebugConfigModal
        visible={showDebugModal}
        onClose={() => setShowDebugModal(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xl,
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
  nameRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  nameInput: {
    flex: 1,
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
  submitButton: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.neutral.divider,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    fontSize: fontSize.sm,
    color: colors.neutral.text.disabled,
  },
  biometricButton: {
    marginBottom: spacing.lg,
  },
  toggleButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  toggleText: {
    color: colors.primary.main,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  debugButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  debugText: {
    color: colors.neutral.text.secondary,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.disabled,
    textAlign: 'center',
    lineHeight: 20,
  },
  linksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  linkText: {
    fontSize: fontSize.sm,
    color: colors.primary.main,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  versionContainer: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  versionText: {
    fontSize: fontSize.xs,
    color: colors.neutral.text.disabled,
    fontWeight: '500',
  },
});
