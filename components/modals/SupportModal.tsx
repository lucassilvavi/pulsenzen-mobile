import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Button from '@/components/base/Button';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Alert,
    Linking,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

interface SupportModalProps {
  visible: boolean;
  onClose: () => void;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: '1',
    question: 'Como faço para alterar meu perfil?',
    answer: 'Vá para a tela de Perfil e toque em "Editar Perfil". Você pode alterar seu nome, email e foto.',
  },
  {
    id: '2',
    question: 'Como ativar a autenticação biométrica?',
    answer: 'Na tela de Perfil, vá para a seção "Segurança" e ative a opção de autenticação biométrica.',
  },
  {
    id: '3',
    question: 'Meus dados estão seguros?',
    answer: 'Sim, todos os seus dados são criptografados e armazenados de forma segura seguindo as melhores práticas de segurança.',
  },
  {
    id: '4',
    question: 'Como excluir minha conta?',
    answer: 'Vá para Perfil > Privacidade > Excluir Todos os Dados. Esta ação é permanente e não pode ser desfeita.',
  },
  {
    id: '5',
    question: 'O aplicativo funciona offline?',
    answer: 'Algumas funcionalidades como respiração guiada funcionam offline, mas você precisa estar conectado para sincronizar dados.',
  },
  {
    id: '6',
    question: 'Como reportar um bug?',
    answer: 'Use o formulário de contato abaixo ou envie um email para support@pulsezen.com com detalhes do problema.',
  },
];

export function SupportModal({
  visible,
  onClose,
}: SupportModalProps) {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const openEmail = () => {
    const subject = encodeURIComponent('Suporte PulseZen - Ajuda');
    const body = encodeURIComponent(`Olá equipe do PulseZen,

Preciso de ajuda com:

[Descreva seu problema aqui]

Informações do dispositivo:
- Versão do app: 1.0.0
- Sistema: ${Platform.OS}

Obrigado!`);
    
    Linking.openURL(`mailto:support@pulsezen.com?subject=${subject}&body=${body}`)
      .catch(() => {
        Alert.alert(
          'Erro',
          'Não foi possível abrir o cliente de email. Tente enviar um email manualmente para: support@pulsezen.com'
        );
      });
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent('Olá! Preciso de ajuda com o aplicativo PulseZen.');
    Linking.openURL(`whatsapp://send?phone=5511999999999&text=${message}`)
      .catch(() => {
        Alert.alert(
          'WhatsApp não encontrado',
          'WhatsApp não está instalado. Você pode nos contatar pelo email: support@pulsezen.com'
        );
      });
  };

  const openWebsite = () => {
    Linking.openURL('https://pulsezen.com/support')
      .catch(() => {
        Alert.alert('Erro', 'Não foi possível abrir o link.');
      });
  };

  const openDocumentation = () => {
    Linking.openURL('https://docs.pulsezen.com')
      .catch(() => {
        Alert.alert('Erro', 'Não foi possível abrir a documentação.');
      });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.neutral.text.primary} />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Suporte</ThemedText>
          <View style={styles.headerRight} />
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Contact Options */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Entre em Contato</ThemedText>
            
            <TouchableOpacity style={styles.contactItem} onPress={openEmail}>
              <View style={styles.contactIcon}>
                <Ionicons name="mail-outline" size={24} color={colors.primary.main} />
              </View>
              <View style={styles.contactInfo}>
                <ThemedText style={styles.contactLabel}>Email</ThemedText>
                <ThemedText style={styles.contactDescription}>support@pulsezen.com</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.neutral.text.disabled} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={openWhatsApp}>
              <View style={styles.contactIcon}>
                <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
              </View>
              <View style={styles.contactInfo}>
                <ThemedText style={styles.contactLabel}>WhatsApp</ThemedText>
                <ThemedText style={styles.contactDescription}>+55 (11) 99999-9999</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.neutral.text.disabled} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={openWebsite}>
              <View style={styles.contactIcon}>
                <Ionicons name="globe-outline" size={24} color={colors.primary.main} />
              </View>
              <View style={styles.contactInfo}>
                <ThemedText style={styles.contactLabel}>Site de Suporte</ThemedText>
                <ThemedText style={styles.contactDescription}>pulsezen.com/support</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.neutral.text.disabled} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={openDocumentation}>
              <View style={styles.contactIcon}>
                <Ionicons name="book-outline" size={24} color={colors.primary.main} />
              </View>
              <View style={styles.contactInfo}>
                <ThemedText style={styles.contactLabel}>Documentação</ThemedText>
                <ThemedText style={styles.contactDescription}>docs.pulsezen.com</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.neutral.text.disabled} />
            </TouchableOpacity>
          </View>

          {/* FAQ Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Perguntas Frequentes</ThemedText>
            
            {FAQ_DATA.map((item) => (
              <View key={item.id} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleFAQ(item.id)}
                >
                  <ThemedText style={styles.faqQuestionText}>{item.question}</ThemedText>
                  <Ionicons
                    name={expandedFAQ === item.id ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={colors.neutral.text.disabled}
                  />
                </TouchableOpacity>
                
                {expandedFAQ === item.id && (
                  <View style={styles.faqAnswer}>
                    <ThemedText style={styles.faqAnswerText}>{item.answer}</ThemedText>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* App Information */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Informações do App</ThemedText>
            
            <View style={styles.infoItem}>
              <ThemedText style={styles.infoLabel}>Versão</ThemedText>
              <ThemedText style={styles.infoValue}>1.0.0</ThemedText>
            </View>
            
            <View style={styles.infoItem}>
              <ThemedText style={styles.infoLabel}>Última atualização</ThemedText>
              <ThemedText style={styles.infoValue}>Outubro 2025</ThemedText>
            </View>
            
            <View style={styles.infoItem}>
              <ThemedText style={styles.infoLabel}>Desenvolvido por</ThemedText>
              <ThemedText style={styles.infoValue}>PulseZen Team</ThemedText>
            </View>
          </View>

          {/* Emergency Contact */}
          <View style={styles.emergencySection}>
            <View style={styles.emergencyHeader}>
              <Ionicons name="warning" size={20} color={colors.warning.main} />
              <ThemedText style={styles.emergencyTitle}>Emergência</ThemedText>
            </View>
            <ThemedText style={styles.emergencyText}>
              Se você está passando por uma crise de saúde mental, procure ajuda imediatamente:
              {'\n\n'}🆘 CVV - 188 (24h gratuito)
              {'\n'}🏥 SAMU - 192
              {'\n'}🚓 Emergência - 190
            </ThemedText>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            label="Fechar"
            onPress={onClose}
            style={styles.closeButtonAction}
          />
        </View>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingTop: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.divider,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-SemiBold',
    color: colors.neutral.text.primary,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-SemiBold',
    color: colors.primary.main,
    marginBottom: spacing.md,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.divider,
  },
  contactIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Medium',
    color: colors.neutral.text.primary,
    marginBottom: spacing.xs,
  },
  contactDescription: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.text.secondary,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.divider,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: fontSize.md,
    fontFamily: 'Inter-Medium',
    color: colors.neutral.text.primary,
    marginRight: spacing.md,
  },
  faqAnswer: {
    paddingBottom: spacing.md,
    paddingLeft: spacing.md,
  },
  faqAnswerText: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.text.secondary,
    lineHeight: 22,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.divider,
  },
  infoLabel: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Medium',
    color: colors.neutral.text.primary,
  },
  infoValue: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.text.secondary,
  },
  emergencySection: {
    backgroundColor: colors.warning.light,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emergencyTitle: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-SemiBold',
    color: colors.warning.main,
    marginLeft: spacing.sm,
  },
  emergencyText: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.text.primary,
    lineHeight: 20,
  },
  actions: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  closeButtonAction: {
    width: '100%',
  },
});