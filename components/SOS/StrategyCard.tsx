import Card from '@/components/base/Card';
import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { CopingStrategy } from '@/types/sos';
import { fontSize, spacing } from '@/utils/responsive';
import { StyleSheet, View } from 'react-native';

interface StrategyCardProps {
  strategy: CopingStrategy;
  onPress: (strategy: CopingStrategy) => void;
}

export default function StrategyCard({ strategy, onPress }: StrategyCardProps) {
  return (
    <Card
      style={styles.card}
      onPress={() => onPress(strategy)}
    >
      <View style={styles.content}>
        <View style={styles.icon}>
          <ThemedText style={styles.emoji}>
            {strategy.icon}
          </ThemedText>
        </View>
        <View style={styles.info}>
          <ThemedText style={styles.title}>
            {strategy.title}
          </ThemedText>
          <ThemedText style={styles.description}>
            {strategy.description}
          </ThemedText>
          <ThemedText style={styles.duration}>
            {strategy.duration} minutos
          </ThemedText>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '48%',
    marginBottom: spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
  },
  content: {
    padding: spacing.md,
    alignItems: 'center',
  },
  icon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.error.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  emoji: {
    fontSize: 24,
  },
  info: {
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-SemiBold',
    color: colors.error.main,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
    lineHeight: fontSize.sm * 1.3,
  },
  duration: {
    fontSize: fontSize.xs,
    fontFamily: 'Inter-Medium',
    color: colors.error.dark,
    textAlign: 'center',
  },
});
