import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface PrivacyModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function PrivacyModal({ visible, onClose }: PrivacyModalProps) {
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
          <ThemedText style={styles.title}>Política de Privacidade</ThemedText>
          <ThemedText style={styles.subtitle}>
            PulseZen - Aplicativo de Bem-estar Mental
          </ThemedText>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>1. Informações Gerais</ThemedText>
            <ThemedText style={styles.text}>
              Esta Política de Privacidade descreve como coletamos, usamos e protegemos 
              suas informações pessoais no PulseZen, em conformidade com a LGPD 
              (Lei Geral de Proteção de Dados).
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>2. Dados Coletados</ThemedText>
            <ThemedText style={styles.text}>
              <ThemedText style={styles.emphasis}>Dados de Cadastro:</ThemedText>
            </ThemedText>
            <ThemedText style={styles.bulletText}>• Nome e sobrenome</ThemedText>
            <ThemedText style={styles.bulletText}>• Email</ThemedText>
            <ThemedText style={styles.bulletText}>• Data de nascimento</ThemedText>
            <ThemedText style={styles.bulletText}>• Identidade de gênero</ThemedText>
            
            <ThemedText style={styles.text}>
              <ThemedText style={styles.emphasis}>Dados de Bem-estar:</ThemedText>
            </ThemedText>
            <ThemedText style={styles.bulletText}>• Registros de humor diários</ThemedText>
            <ThemedText style={styles.bulletText}>• Sessões de respiração realizadas</ThemedText>
            <ThemedText style={styles.bulletText}>• Preferências de atividades</ThemedText>
            <ThemedText style={styles.bulletText}>• Histórico de uso do aplicativo</ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>3. Finalidade dos Dados</ThemedText>
            <ThemedText style={styles.text}>
              Utilizamos seus dados para:
            </ThemedText>
            <ThemedText style={styles.bulletText}>• Personalizar sua experiência no aplicativo</ThemedText>
            <ThemedText style={styles.bulletText}>• Gerar insights sobre seu bem-estar</ThemedText>
            <ThemedText style={styles.bulletText}>• Oferecer exercícios e conteúdos relevantes</ThemedText>
            <ThemedText style={styles.bulletText}>• Melhorar nossos serviços</ThemedText>
            <ThemedText style={styles.bulletText}>• Comunicar atualizações importantes</ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>4. Armazenamento e Segurança</ThemedText>
            <ThemedText style={styles.text}>
              <ThemedText style={styles.emphasis}>Onde:</ThemedText> Dados armazenados localmente no seu dispositivo 
              e em servidores seguros no Brasil.
            </ThemedText>
            <ThemedText style={styles.text}>
              <ThemedText style={styles.emphasis}>Como:</ThemedText> Utilizamos criptografia de ponta a ponta 
              para proteger suas informações.
            </ThemedText>
            <ThemedText style={styles.text}>
              <ThemedText style={styles.emphasis}>Por quanto tempo:</ThemedText> Mantemos seus dados enquanto 
              você usar o aplicativo. Você pode solicitar exclusão a qualquer momento.
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>5. Seus Direitos (LGPD)</ThemedText>
            <ThemedText style={styles.text}>
              Você tem direito a:
            </ThemedText>
            <ThemedText style={styles.bulletText}>• <ThemedText style={styles.emphasis}>Acesso:</ThemedText> Saber quais dados temos sobre você</ThemedText>
            <ThemedText style={styles.bulletText}>• <ThemedText style={styles.emphasis}>Correção:</ThemedText> Corrigir dados incorretos</ThemedText>
            <ThemedText style={styles.bulletText}>• <ThemedText style={styles.emphasis}>Exclusão:</ThemedText> Solicitar remoção dos seus dados</ThemedText>
            <ThemedText style={styles.bulletText}>• <ThemedText style={styles.emphasis}>Portabilidade:</ThemedText> Exportar seus dados</ThemedText>
            <ThemedText style={styles.bulletText}>• <ThemedText style={styles.emphasis}>Revogação:</ThemedText> Retirar consentimento a qualquer momento</ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>6. Compartilhamento</ThemedText>
            <ThemedText style={styles.text}>
              <ThemedText style={styles.emphasis}>NÃO compartilhamos</ThemedText> seus dados pessoais com terceiros, 
              exceto quando:
            </ThemedText>
            <ThemedText style={styles.bulletText}>• Exigido por lei</ThemedText>
            <ThemedText style={styles.bulletText}>• Para proteger segurança de usuários</ThemedText>
            <ThemedText style={styles.bulletText}>• Com seu consentimento explícito</ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>7. Cookies e Tecnologias</ThemedText>
            <ThemedText style={styles.text}>
              Utilizamos apenas tecnologias essenciais para o funcionamento do aplicativo. 
              Não utilizamos cookies de rastreamento ou publicidade.
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>8. Contato e Exercício de Direitos</ThemedText>
            <ThemedText style={styles.text}>
              Para exercer seus direitos ou esclarecer dúvidas sobre privacidade:
            </ThemedText>
            <ThemedText style={styles.bulletText}>• Email: privacidade@pulsezen.com</ThemedText>
            <ThemedText style={styles.bulletText}>• DPO (Encarregado de Dados): dpo@pulsezen.com</ThemedText>
            <ThemedText style={styles.text}>
              Responderemos em até 15 dias conforme previsto na LGPD.
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>9. Atualizações</ThemedText>
            <ThemedText style={styles.text}>
              Esta política pode ser atualizada. Notificaremos sobre mudanças significativas 
              e disponibilizaremos a versão atualizada no aplicativo.
            </ThemedText>
            <ThemedText style={styles.text}>
              <ThemedText style={styles.emphasis}>Última atualização:</ThemedText> Outubro de 2025
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
    color: colors.primary.main,
  },
});