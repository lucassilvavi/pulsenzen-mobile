import Button from '@/components/base/Button';
import Card from '@/components/base/Card';
import CustomTextInput from '@/components/base/CustomTextInput';
import ScreenContainer from '@/components/base/ScreenContainer';
import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import API_CONFIG from '../../config/api';

const { height } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = () => {
    if (!email.trim()) {
      setError('Email é obrigatório');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email inválido');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleSendCode = async () => {
    if (!validateEmail()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/password-reset/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert(
          'Código enviado! 📧',
          'Verifique seu email e digite o código de 6 dígitos na próxima tela.',
          [
            {
              text: 'OK',
              onPress: () => {
                router.push({
                  pathname: '/onboarding/verify-code',
                  params: { email: email.toLowerCase().trim() },
                });
              },
            },
          ]
        );
      } else {
        setError(data.message || 'Email não encontrado');
      }
    } catch (error) {
      console.error('Error sending reset code:', error);
      Alert.alert('Erro', 'Não foi possível enviar o código. Tente novamente.');
    } finally {
      setLoading(false);
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
          <ThemedText style={styles.title}>Recuperar Senha</ThemedText>
          <ThemedText style={styles.subtitle}>
            Digite seu email e enviaremos um código de verificação
          </ThemedText>
        </View>

        <Card style={styles.formCard}>
          <View style={styles.form}>
            <CustomTextInput
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError('');
              }}
              placeholder="Email"
              containerStyle={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            {error && (
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            )}

            <Button
              label="Enviar Código"
              onPress={handleSendCode}
              style={styles.submitButton}
              loading={loading}
              disabled={loading}
            />

            <TouchableOpacity 
              style={styles.backToLoginButton} 
              onPress={() => router.back()}
              disabled={loading}
            >
              <ThemedText style={styles.backToLoginText}>
                Voltar para o login
              </ThemedText>
            </TouchableOpacity>
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
  backToLoginButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  backToLoginText: {
    color: colors.primary.main,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
