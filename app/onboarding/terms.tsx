import { ThemedText } from '@/components/ThemedText';
import Button from '@/components/base/Button';
import ScreenContainer from '@/components/base/ScreenContainer';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function TermsOfServiceScreen() {
  const router = useRouter();

  const handleAccept = () => {
    router.back();
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Termos de Uso</ThemedText>
        <ThemedText style={styles.subtitle}>
          PulseZen - Aplicativo de Bem-estar Mental
        </ThemedText>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>1. Aceite dos Termos</ThemedText>
          <ThemedText style={styles.text}>
            Ao usar o PulseZen, você concorda com estes Termos de Uso. Se não concordar, 
            não use o aplicativo.
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>2. Descrição do Serviço</ThemedText>
          <ThemedText style={styles.text}>
            O PulseZen é um aplicativo de bem-estar mental que oferece:
          </ThemedText>
          <ThemedText style={styles.bulletText}>• Exercícios de respiração guiada</ThemedText>
          <ThemedText style={styles.bulletText}>• Diário de humor e reflexões</ThemedText>
          <ThemedText style={styles.bulletText}>• Monitoramento de bem-estar emocional</ThemedText>
          <ThemedText style={styles.bulletText}>• Técnicas de mindfulness e relaxamento</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>3. Não é Substituto Médico</ThemedText>
          <ThemedText style={styles.text}>
            <ThemedText style={styles.emphasis}>IMPORTANTE:</ThemedText> O PulseZen é uma 
            ferramenta de apoio ao bem-estar e NÃO substitui tratamento médico profissional. 
            Em caso de crise ou pensamentos de autolesão, procure ajuda médica imediata ou 
            ligue para o CVV (188).
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>4. Privacidade e Dados</ThemedText>
          <ThemedText style={styles.text}>
            Seus dados pessoais e informações de saúde são protegidos conforme nossa 
            Política de Privacidade. Não compartilhamos informações pessoais sem seu 
            consentimento explícito.
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>5. Uso Responsável</ThemedText>
          <ThemedText style={styles.text}>
            Você se compromete a:
          </ThemedText>
          <ThemedText style={styles.bulletText}>• Usar o app apenas para fins pessoais</ThemedText>
          <ThemedText style={styles.bulletText}>• Fornecer informações precisas</ThemedText>
          <ThemedText style={styles.bulletText}>• Não compartilhar suas credenciais</ThemedText>
          <ThemedText style={styles.bulletText}>• Respeitar outros usuários</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>6. Limitação de Responsabilidade</ThemedText>
          <ThemedText style={styles.text}>
            O PulseZen não se responsabiliza por decisões tomadas com base nas informações 
            do aplicativo. O app é fornecido "como está" para apoio ao bem-estar pessoal.
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>7. Modificações</ThemedText>
          <ThemedText style={styles.text}>
            Podemos atualizar estes termos periodicamente. Mudanças significativas serão 
            comunicadas através do aplicativo.
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>8. Contato</ThemedText>
          <ThemedText style={styles.text}>
            Dúvidas sobre estes termos? Entre em contato: suporte@pulsezen.com
          </ThemedText>
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            Última atualização: Outubro de 2025
          </ThemedText>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          label="Entendi e Aceito"
          onPress={handleAccept}
          style={styles.acceptButton}
        />
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
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.sm,
    color: colors.primary.main,
  },
  subtitle: {
    fontSize: fontSize.md,
    textAlign: 'center',
    color: colors.neutral.text.secondary,
  },
  content: {
    flex: 1,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    marginBottom: spacing.sm,
    color: colors.primary.main,
  },
  text: {
    fontSize: fontSize.md,
    lineHeight: fontSize.md * 1.5,
    color: colors.neutral.text.primary,
    marginBottom: spacing.sm,
  },
  bulletText: {
    fontSize: fontSize.md,
    lineHeight: fontSize.md * 1.5,
    color: colors.neutral.text.primary,
    marginLeft: spacing.md,
    marginBottom: spacing.xs,
  },
  emphasis: {
    fontWeight: 'bold',
    color: colors.error.main,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.disabled,
    fontStyle: 'italic',
  },
  buttonContainer: {
    paddingVertical: spacing.lg,
  },
  acceptButton: {
    backgroundColor: colors.primary.main,
  },
});