import Button from '@/components/base/Button';
import Card from '@/components/base/Card';
import CustomTextInput from '@/components/base/CustomTextInput';
import ScreenContainer from '@/components/base/ScreenContainer';
import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { fontSize, spacing } from '@/utils/responsive';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
  const { register, login, isLoading } = useAuth();
  
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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
          // For login, let NavigationHandler decide where to go based on onboarding status
          // Don't navigate manually - let the NavigationHandler in _layout handle it
        } else {
          // For registration, always go to setup (new users need onboarding)
          router.replace('/onboarding/benefits');
        }
      } else {
        Alert.alert('Erro', result.message);
      }
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert('Erro', 'Ocorreu um erro inesperado. Tente novamente.');
    }
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
              secureTextEntry
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

            <TouchableOpacity style={styles.toggleButton} onPress={toggleMode}>
              <ThemedText style={styles.toggleText}>
                {isLoginMode 
                  ? 'Não tem uma conta? Criar conta'
                  : 'Já tem uma conta? Entrar'
                }
              </ThemedText>
            </TouchableOpacity>
          </View>
        </Card>

        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            Ao continuar, você concorda com nossos{'\n'}
            Termos de Uso e Política de Privacidade
          </ThemedText>
        </View>
      </ScrollView>
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
  toggleButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  toggleText: {
    color: colors.primary.main,
    fontSize: fontSize.md,
    fontWeight: '600',
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
});
