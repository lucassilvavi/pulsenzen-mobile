import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import ScreenContainer from '@/components/base/ScreenContainer';
import Button from '@/components/base/Button';
import Card from '@/components/base/Card';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';

const BENEFITS = [
  {
    icon: 'heart-outline',
    title: 'Reduza a Ansiedade',
    description: 'Técnicas de respiração validadas cientificamente para reduzir stress em minutos',
    stat: '87% menos ansiedade',
    color: colors.success.main,
  },
  {
    icon: 'moon-outline', 
    title: 'Durma Melhor',
    description: 'Exercícios de relaxamento que preparam sua mente para uma noite tranquila',
    stat: '92% melhor sono',
    color: colors.primary.main,
  },
  {
    icon: 'trending-up-outline',
    title: 'Mais Foco e Produtividade',
    description: 'Meditações rápidas que cabem na sua rotina e aumentam sua concentração',
    stat: '78% mais foco',
    color: colors.warning.main,
  },
];

export default function BenefitsScreen() {
  const router = useRouter();

  const handleContinue = () => {
    router.push('/onboarding/terms-agreement');
  };

  const handleSkip = () => {
    router.replace('/');
  };

  return (
    <ScreenContainer style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <ThemedText style={styles.logo}>🧘‍♀️</ThemedText>
          </View>
          <ThemedText style={styles.title}>
            Transforme seu bem-estar em apenas 5 minutos por dia
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Descubra por que milhares de pessoas escolhem o PulseZen
          </ThemedText>
        </View>

        <View style={styles.benefitsContainer}>
          {BENEFITS.map((benefit, index) => (
            <Card key={index} style={styles.benefitCard}>
              <View style={styles.benefitContent}>
                <View style={[styles.iconContainer, { backgroundColor: `${benefit.color}15` }]}>
                  <Ionicons 
                    name={benefit.icon as any}
                    size={32} 
                    color={benefit.color}
                  />
                </View>
                <View style={styles.benefitText}>
                  <ThemedText style={styles.benefitTitle}>
                    {benefit.title}
                  </ThemedText>
                  <ThemedText style={styles.benefitDescription}>
                    {benefit.description}
                  </ThemedText>
                  <ThemedText style={styles.benefitStat}>
                    {benefit.stat}
                  </ThemedText>
                </View>
              </View>
            </Card>
          ))}
        </View>

        <View style={styles.footer}>
          <Button
            label="Vamos começar!"
            onPress={handleContinue}
            style={styles.continueButton}
          />
          
          <TouchableOpacity onPress={handleSkip}>
            <ThemedText style={styles.skipText}>
              Pular configuração
            </ThemedText>
          </TouchableOpacity>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressDot} />
            <View style={styles.progressDot} />
            <View style={[styles.progressDot, styles.activeDot]} />
            <View style={styles.progressDot} />
          </View>
        </View>

        <View style={styles.note}>
          <ThemedText style={styles.noteText}>
            ✨ Começar é grátis. Cancele quando quiser.
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
    marginBottom: spacing.xl,
  },
  logoContainer: {
    backgroundColor: colors.primary.light,
    padding: spacing.lg,
    borderRadius: 50,
    marginBottom: spacing.lg,
  },
  logo: {
    fontSize: 40,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.md,
    color: colors.primary.main,
    lineHeight: fontSize.xl * 1.2,
    paddingHorizontal: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    textAlign: 'center',
    color: colors.neutral.text.secondary,
    lineHeight: fontSize.md * 1.4,
  },
  benefitsContainer: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  benefitCard: {
    marginBottom: spacing.sm,
  },
  benefitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.neutral.text.primary,
    marginBottom: spacing.xs,
  },
  benefitDescription: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.secondary,
    lineHeight: fontSize.sm * 1.4,
    marginBottom: spacing.xs,
  },
  benefitStat: {
    fontSize: fontSize.sm,
    color: colors.primary.main,
    fontWeight: '600',
  },
  statsContainer: {
    marginBottom: spacing.xl,
  },
  statsTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.neutral.text.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statItem: {
    alignItems: 'center',
    minWidth: '30%',
  },
  statNumber: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.primary.main,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.secondary,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  continueButton: {
    backgroundColor: colors.primary.main,
    marginBottom: spacing.lg,
  },
  skipText: {
    fontSize: fontSize.md,
    color: colors.neutral.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
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
  note: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  noteText: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.disabled,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});