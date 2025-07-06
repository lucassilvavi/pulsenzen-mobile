import Card from '@/components/base/Card';
import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { CopingStrategy } from '../types';
import { fontSize, spacing } from '@/utils/responsive';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface CopingStrategiesGridProps {
  strategies: CopingStrategy[];
  onStrategySelect: (strategy: CopingStrategy) => void;
  loading?: boolean;
}

export default function CopingStrategiesGrid({ 
  strategies, 
  onStrategySelect, 
  loading = false 
}: CopingStrategiesGridProps) {
  const renderStrategy = (item: CopingStrategy, index: number) => (
    <Card
      key={item.id}
      style={styles.strategyCard}
      onPress={() => onStrategySelect(item)}
    >
      <View style={styles.strategyContent}>
        <View style={styles.strategyHeader}>
          <ThemedText style={styles.strategyIcon}>{item.icon}</ThemedText>
          <View style={styles.categoryBadge}>
            <ThemedText style={styles.categoryText}>
              {getCategoryLabel(item.category)}
            </ThemedText>
          </View>
        </View>
        
        <ThemedText style={styles.strategyTitle}>
          {item.title}
        </ThemedText>
        
        <ThemedText style={styles.strategyDescription}>
          {item.description}
        </ThemedText>
        
        <View style={styles.strategyFooter}>
          <ThemedText style={styles.durationText}>
            {item.duration} min
          </ThemedText>
          <ThemedText style={styles.stepsCount}>
            {item.steps.length} passos
          </ThemedText>
        </View>
      </View>
    </Card>
  );

  const getCategoryLabel = (category: CopingStrategy['category']) => {
    const labels = {
      breathing: 'Respiração',
      grounding: 'Grounding',
      relaxation: 'Relaxamento',
      physical: 'Físico'
    };
    return labels[category];
  };

  const getCategoryColor = (category: CopingStrategy['category']) => {
    const colorMap = {
      breathing: colors.primary.light,
      grounding: colors.secondary.light,
      relaxation: colors.success.light,
      physical: colors.warning.light
    };
    return colorMap[category];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ThemedText style={styles.loadingText}>
          Carregando técnicas...
        </ThemedText>
      </View>
    );
  }

  // Organize strategies in pairs for grid layout
  const strategyPairs = [];
  for (let i = 0; i < strategies.length; i += 2) {
    strategyPairs.push(strategies.slice(i, i + 2));
  }

  return (
    <View style={styles.container}>
      <ThemedText style={styles.sectionTitle}>
        Técnicas de Alívio Rápido
      </ThemedText>
      
      <View style={styles.grid}>
        {strategyPairs.map((pair, pairIndex) => (
          <View key={pairIndex} style={styles.row}>
            {pair.map((strategy, index) => renderStrategy(strategy, index))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
    paddingBottom: spacing.lg,
  },
  row: {
    justifyContent: 'space-between',
  },
  strategyCard: {
    flex: 1,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.md,
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: colors.neutral.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  strategyContent: {
    alignItems: 'center',
  },
  strategyHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  strategyIcon: {
    fontSize: fontSize.xxl,
  },
  categoryBadge: {
    backgroundColor: colors.error.light,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: fontSize.xs,
    fontFamily: 'Inter-Medium',
    color: colors.error.dark,
  },
  strategyTitle: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Bold',
    color: colors.neutral.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  strategyDescription: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.text.secondary,
    textAlign: 'center',
    lineHeight: fontSize.sm * 1.4,
    marginBottom: spacing.sm,
  },
  strategyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.divider,
  },
  durationText: {
    fontSize: fontSize.xs,
    fontFamily: 'Inter-Medium',
    color: colors.error.main,
  },
  stepsCount: {
    fontSize: fontSize.xs,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.text.secondary,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.text.secondary,
  },
});
