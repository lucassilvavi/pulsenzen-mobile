import { ScrollView, StyleSheet, View, TouchableOpacity, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ThemedText } from '@/components/ThemedText';
import ScreenContainer from '@/components/base/ScreenContainer';
import Button from '@/components/base/Button';
import Card from '@/components/base/Card';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

export default function TermsAgreementScreen() {
  const router = useRouter();
  const { markOnboardingComplete } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    age: false,
  });

  const allAgreed = agreements.terms && agreements.privacy && agreements.age;

  const toggleAgreement = (key: keyof typeof agreements) => {
    setAgreements(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const openTerms = () => {
    router.push('/onboarding/terms');
  };

  const openPrivacy = () => {
    router.push('/onboarding/privacy');
  };

  const handleContinue = async () => {
    if (!allAgreed) {
      Alert.alert(
        'Aceitar Termos',
        'Por favor, aceite todos os termos para continuar.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsLoading(true);
      
      // Mark onboarding as complete
      await markOnboardingComplete();
      
      // Navigate to main app
      router.replace('/');
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert(
        'Erro',
        'Ocorreu um erro ao finalizar o cadastro. Tente novamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <ThemedText style={styles.logo}>🧘‍♀️</ThemedText>
          </View>
          <ThemedText style={styles.title}>
            Últimos detalhes
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Para começar sua jornada de bem-estar, precisamos que você aceite nossos termos
          </ThemedText>
        </View>

        <View style={styles.agreementContainer}>
          <Card style={styles.agreementCard}>
            <TouchableOpacity 
              style={styles.checkboxRow}
              onPress={() => toggleAgreement('terms')}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, agreements.terms && styles.checkboxChecked]}>
                {agreements.terms && (
                  <Ionicons name="checkmark" size={16} color={colors.neutral.background} />
                )}
              </View>
              <View style={styles.checkboxText}>
                <ThemedText style={styles.agreementText}>
                  Li e aceito os{' '}
                  <ThemedText style={styles.linkText} onPress={openTerms}>
                    Termos de Uso
                  </ThemedText>
                </ThemedText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.checkboxRow}
              onPress={() => toggleAgreement('privacy')}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, agreements.privacy && styles.checkboxChecked]}>
                {agreements.privacy && (
                  <Ionicons name="checkmark" size={16} color={colors.neutral.background} />
                )}
              </View>
              <View style={styles.checkboxText}>
                <ThemedText style={styles.agreementText}>
                  Li e aceito a{' '}
                  <ThemedText style={styles.linkText} onPress={openPrivacy}>
                    Política de Privacidade
                  </ThemedText>
                  {' '}e o tratamento dos meus dados pessoais conforme a LGPD
                </ThemedText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.checkboxRow}
              onPress={() => toggleAgreement('age')}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, agreements.age && styles.checkboxChecked]}>
                {agreements.age && (
                  <Ionicons name="checkmark" size={16} color={colors.neutral.background} />
                )}
              </View>
              <View style={styles.checkboxText}>
                <ThemedText style={styles.agreementText}>
                  Confirmo que tenho 13 anos ou mais
                </ThemedText>
              </View>
            </TouchableOpacity>
          </Card>

          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.success.main} />
              <ThemedText style={styles.infoTitle}>Seus dados estão seguros</ThemedText>
            </View>
            <ThemedText style={styles.infoText}>
              • Criptografia de ponta a ponta para proteger suas informações
            </ThemedText>
            <ThemedText style={styles.infoText}>
              • Dados armazenados apenas no seu dispositivo
            </ThemedText>
            <ThemedText style={styles.infoText}>
              • Conformidade total com a LGPD
            </ThemedText>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Começar agora!"
          onPress={handleContinue}
          disabled={!allAgreed}
          loading={isLoading}
          style={[
            styles.continueButton,
            !allAgreed && styles.disabledButton,
          ]}
        />
        
        <View style={styles.progressContainer}>
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={[styles.progressDot, styles.activeDot]} />
        </View>
      </View>
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
    marginBottom: spacing.xl,
  },
  logoContainer: {
    backgroundColor: `${colors.primary.main}20`,
    padding: spacing.lg,
    borderRadius: 50,
    marginBottom: spacing.md,
  },
  logo: {
    fontSize: 32,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.neutral.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.neutral.text.secondary,
    textAlign: 'center',
    lineHeight: fontSize.md * 1.4,
    paddingHorizontal: spacing.md,
  },
  agreementContainer: {
    marginBottom: spacing.xl,
  },
  agreementCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.neutral.divider,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  checkboxText: {
    flex: 1,
  },
  agreementText: {
    fontSize: fontSize.md,
    color: colors.neutral.text.primary,
    lineHeight: fontSize.md * 1.4,
  },
  linkText: {
    color: colors.primary.main,
    textDecorationLine: 'underline',
  },
  infoCard: {
    backgroundColor: `${colors.success.main}10`,
    padding: spacing.lg,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.success.main,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.success.main,
    marginLeft: spacing.sm,
  },
  infoText: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.secondary,
    marginBottom: spacing.xs,
    paddingLeft: spacing.md,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
  continueButton: {
    backgroundColor: colors.primary.main,
    marginBottom: spacing.lg,
  },
  disabledButton: {
    backgroundColor: colors.neutral.divider,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral.divider,
  },
  activeDot: {
    backgroundColor: colors.primary.main,
  },
});