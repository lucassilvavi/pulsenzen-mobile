import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function TermsModal({ visible, onClose }: TermsModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.neutral.text.primary} />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Termos de Uso</ThemedText>
          <ThemedText style={styles.subtitle}>
            Acalmar - Aplicativo de Bem-estar Mental
          </ThemedText>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>1. Aceite dos Termos</ThemedText>
            <ThemedText style={styles.text}>
              Ao usar o Acalmar, você concorda com estes Termos de Uso. Se não concordar, 
              não use o aplicativo.
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>2. Descrição do Serviço</ThemedText>
            <ThemedText style={styles.text}>
              O Acalmar é um aplicativo de bem-estar mental que oferece:
            </ThemedText>
            <ThemedText style={styles.bulletText}>• Exercícios de respiração guiada</ThemedText>
            <ThemedText style={styles.bulletText}>• Diário de humor e reflexões</ThemedText>
            <ThemedText style={styles.bulletText}>• Monitoramento de bem-estar emocional</ThemedText>
            <ThemedText style={styles.bulletText}>• Técnicas de mindfulness e relaxamento</ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>3. Não é Substituto Médico</ThemedText>
            <ThemedText style={styles.text}>
              <ThemedText style={styles.emphasis}>IMPORTANTE:</ThemedText> O Acalmar é uma
              ferramenta de apoio ao bem-estar e NÃO substitui tratamento médico profissional. 
              Em caso de crise ou pensamentos de autolesão, procure ajuda médica imediata ou 
              ligue para o CVV (188).
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>4. Coleta e Uso de Dados</ThemedText>
            <ThemedText style={styles.text}>
              Coletamos apenas os dados necessários para personalizar sua experiência:
            </ThemedText>
            <ThemedText style={styles.bulletText}>• Informações de registro (nome, email)</ThemedText>
            <ThemedText style={styles.bulletText}>• Dados de humor e bem-estar (para análises pessoais)</ThemedText>
            <ThemedText style={styles.bulletText}>• Preferências de uso do aplicativo</ThemedText>
            <ThemedText style={styles.text}>
              Seus dados são criptografados e armazenados com segurança, conforme nossa Política de Privacidade.
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>5. Responsabilidades do Usuário</ThemedText>
            <ThemedText style={styles.text}>
              Você se compromete a:
            </ThemedText>
            <ThemedText style={styles.bulletText}>• Usar o aplicativo de forma responsável</ThemedText>
            <ThemedText style={styles.bulletText}>• Manter suas credenciais seguras</ThemedText>
            <ThemedText style={styles.bulletText}>• Não compartilhar dados pessoais sensíveis</ThemedText>
            <ThemedText style={styles.bulletText}>• Procurar ajuda profissional quando necessário</ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>6. Modificações</ThemedText>
            <ThemedText style={styles.text}>
              Podemos atualizar estes termos ocasionalmente. Você será notificado sobre 
              mudanças significativas e poderá revisar os termos atualizados no aplicativo.
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>7. Contato</ThemedText>
            <ThemedText style={styles.text}>
              Para dúvidas sobre estes termos, entre em contato: acalmarapp@gmail.com
            </ThemedText>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.divider,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: spacing.lg,
    top: spacing.lg,
    zIndex: 1,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.neutral.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.neutral.text.secondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.primary.main,
    marginBottom: spacing.sm,
  },
  text: {
    fontSize: fontSize.md,
    color: colors.neutral.text.primary,
    lineHeight: fontSize.md * 1.5,
    marginBottom: spacing.sm,
  },
  bulletText: {
    fontSize: fontSize.md,
    color: colors.neutral.text.primary,
    lineHeight: fontSize.md * 1.5,
    marginLeft: spacing.md,
    marginBottom: spacing.xs,
  },
  emphasis: {
    fontWeight: 'bold',
    color: colors.error.main,
  },
});