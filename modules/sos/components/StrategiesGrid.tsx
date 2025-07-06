import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { CopingStrategy } from '../types';
import { fontSize, spacing } from '@/utils/responsive';
import { StyleSheet, View } from 'react-native';
import StrategyCard from './StrategyCard';

interface StrategiesGridProps {
  strategies: CopingStrategy[];
  onStrategyPress: (strategy: CopingStrategy) => void;
  title?: string;
}

export default function StrategiesGrid({ 
  strategies, 
  onStrategyPress, 
  title = "Técnicas de Alívio Rápido" 
}: StrategiesGridProps) {
  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>
        {title}
      </ThemedText>
      <View style={styles.grid}>
        {strategies.map((strategy) => (
          <StrategyCard
            key={strategy.id}
            strategy={strategy}
            onPress={onStrategyPress}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-Bold',
    color: colors.error.main,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
