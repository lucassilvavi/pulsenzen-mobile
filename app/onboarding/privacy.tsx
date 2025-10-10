import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import ScreenContainer from '@/components/base/ScreenContainer';
import Button from '@/components/base/Button';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  const handleAccept = () => {
    router.back();
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Política de Privacidade</ThemedText>
        <ThemedText style={styles.subtitle}>
          Como protegemos seus dados pessoais
        </ThemedText>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>1. Introdução</ThemedText>
          <ThemedText style={styles.text}>
            Sua privacidade é fundamental para nós. Esta política explica como coletamos, 
            usamos e protegemos suas informações pessoais no PulseZen.
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>2. Informações Coletadas</ThemedText>
          <ThemedText style={styles.text}>
            <ThemedText style={styles.emphasis}>Informações de Conta:</ThemedText>
          </ThemedText>
          <ThemedText style={styles.bulletText}>• Nome e email (para login)</ThemedText>
          <ThemedText style={styles.bulletText}>• Data de nascimento (opcional)</ThemedText>
          <ThemedText style={styles.bulletText}>• Preferências do app</ThemedText>

          <ThemedText style={styles.text}>
            <ThemedText style={styles.emphasis}>Dados de Bem-estar:</ThemedText>
          </ThemedText>
          <ThemedText style={styles.bulletText}>• Registros de humor e emoções</ThemedText>
          <ThemedText style={styles.bulletText}>• Sessões de respiração e meditação</ThemedText>
          <ThemedText style={styles.bulletText}>• Anotações pessoais no diário</ThemedText>
          <ThemedText style={styles.bulletText}>• Padrões de uso do aplicativo</ThemedText>

          <ThemedText style={styles.text}>
            <ThemedText style={styles.emphasis}>Dados Técnicos:</ThemedText>
          </ThemedText>
          <ThemedText style={styles.bulletText}>• Tipo de dispositivo e sistema operacional</ThemedText>
          <ThemedText style={styles.bulletText}>• Logs de erro para melhorias</ThemedText>
          <ThemedText style={styles.bulletText}>• Dados de uso anônimos</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>3. Como Usamos seus Dados</ThemedText>
          <ThemedText style={styles.text}>
            Seus dados são usados exclusivamente para:
          </ThemedText>
          <ThemedText style={styles.bulletText}>• Personalizar sua experiência no app</ThemedText>
          <ThemedText style={styles.bulletText}>• Gerar insights sobre seu bem-estar</ThemedText>
          <ThemedText style={styles.bulletText}>• Melhorar nossos serviços</ThemedText>
          <ThemedText style={styles.bulletText}>• Enviar lembretes e notificações (se permitido)</ThemedText>
          <ThemedText style={styles.bulletText}>• Garantir a segurança do aplicativo</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>4. Proteção de Dados Sensíveis</ThemedText>
          <ThemedText style={styles.text}>
            <ThemedText style={styles.emphasis}>Dados de saúde mental são especialmente protegidos:</ThemedText>
          </ThemedText>
          <ThemedText style={styles.bulletText}>• Criptografia de ponta a ponta</ThemedText>
          <ThemedText style={styles.bulletText}>• Armazenamento seguro em servidores certificados</ThemedText>
          <ThemedText style={styles.bulletText}>• Acesso restrito apenas à equipe autorizada</ThemedText>
          <ThemedText style={styles.bulletText}>• Backups automatizados e seguros</ThemedText>
          <ThemedText style={styles.bulletText}>• Conformidade com LGPD e regulamentações de saúde</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>5. Compartilhamento de Dados</ThemedText>
          <ThemedText style={styles.text}>
            <ThemedText style={styles.emphasis}>NÃO compartilhamos</ThemedText> seus dados pessoais 
            ou de saúde mental com terceiros, exceto:
          </ThemedText>
          <ThemedText style={styles.bulletText}>• Com seu consentimento explícito</ThemedText>
          <ThemedText style={styles.bulletText}>• Por ordem judicial</ThemedText>
          <ThemedText style={styles.bulletText}>• Em situações de emergência (risco de vida)</ThemedText>
          <ThemedText style={styles.bulletText}>• Dados agregados e anônimos para pesquisa</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>6. Seus Direitos</ThemedText>
          <ThemedText style={styles.text}>
            Você tem direito a:
          </ThemedText>
          <ThemedText style={styles.bulletText}>• Acessar seus dados pessoais</ThemedText>
          <ThemedText style={styles.bulletText}>• Corrigir informações incorretas</ThemedText>
          <ThemedText style={styles.bulletText}>• Excluir seus dados (direito ao esquecimento)</ThemedText>
          <ThemedText style={styles.bulletText}>• Exportar seus dados</ThemedText>
          <ThemedText style={styles.bulletText}>• Retirar consentimento a qualquer momento</ThemedText>
          <ThemedText style={styles.bulletText}>• Receber cópia de seus dados</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>7. Retenção de Dados</ThemedText>
          <ThemedText style={styles.text}>
            Mantemos seus dados apenas pelo tempo necessário para fornecer nossos serviços. 
            Dados de bem-estar são mantidos por até 3 anos após a última atividade, 
            ou até você solicitar a exclusão.
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>8. Cookies e Tecnologias</ThemedText>
          <ThemedText style={styles.text}>
            Usamos tecnologias locais para melhorar sua experiência:
          </ThemedText>
          <ThemedText style={styles.bulletText}>• Armazenamento local para preferências</ThemedText>
          <ThemedText style={styles.bulletText}>• Analytics para melhorar o app</ThemedText>
          <ThemedText style={styles.bulletText}>• Cache para melhor performance</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>9. Menores de Idade</ThemedText>
          <ThemedText style={styles.text}>
            O PulseZen é destinado a usuários maiores de 13 anos. Para menores entre 13-18 anos, 
            é necessário consentimento dos responsáveis para coleta de dados.
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>10. Alterações na Política</ThemedText>
          <ThemedText style={styles.text}>
            Podemos atualizar esta política periodicamente. Mudanças importantes serão 
            comunicadas com 30 dias de antecedência através do aplicativo.
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>11. Contato</ThemedText>
          <ThemedText style={styles.text}>
            Para exercer seus direitos ou esclarecer dúvidas sobre privacidade:
          </ThemedText>
          <ThemedText style={styles.bulletText}>• Email: privacidade@pulsezen.com</ThemedText>
          <ThemedText style={styles.bulletText}>• DPO: dpo@pulsezen.com</ThemedText>
          <ThemedText style={styles.bulletText}>• Telefone: (11) 1234-5678</ThemedText>
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            Última atualização: Outubro de 2025
          </ThemedText>
          <ThemedText style={styles.footerText}>
            Versão 1.0 - Conforme LGPD (Lei 13.709/2018)
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
    color: colors.primary.main,
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
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  buttonContainer: {
    paddingVertical: spacing.lg,
  },
  acceptButton: {
    backgroundColor: colors.primary.main,
  },
});