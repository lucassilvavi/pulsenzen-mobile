import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StyleSheet, TextStyle, View, ViewStyle } from 'react-native';

type Stat = {
  value: string | number;
  label: string;
};

type StatsBarProps = {
  stats: Stat[];
  style?: ViewStyle;
  valueStyle?: TextStyle;
  labelStyle?: TextStyle;
  dividerColor?: string;
};

export default function StatsBar({
  stats,
  style,
  valueStyle,
  labelStyle,
  dividerColor = '#E0E0E0',
}: StatsBarProps) {
  return (
    <ThemedView style={[styles.statsContainer, style]}>
      {stats.map((stat, idx) => (
        <View key={stat.label} style={styles.statWrapper}>
          <ThemedView style={styles.statItem}>
            <ThemedText style={[styles.statValue, valueStyle]}>{stat.value}</ThemedText>
            <ThemedText style={[styles.statLabel, labelStyle]}>{stat.label}</ThemedText>
          </ThemedView>
          {idx < stats.length - 1 && (
            <View style={[styles.statDivider, { backgroundColor: dividerColor }]} />
          )}
        </View>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    minWidth: 60,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  statDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 12,
  },
});