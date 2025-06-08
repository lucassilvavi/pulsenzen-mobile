import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Card from '@/components/base/Card';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { StyleSheet } from 'react-native';

type Strategy = {
  key: string;
  icon: { name: string; color: string; bg: string };
  title: string;
  description: string;
};

type CopingStrategiesProps = {
  strategies: Strategy[];
  title?: string;
  style?: any;
};

export default function CopingStrategies({
  strategies,
  title = 'Estratégias de Enfrentamento',
  style,
}: CopingStrategiesProps) {
  return (
    <ThemedView style={[styles.sectionContainer, style]}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>{title}</ThemedText>
      <ThemedView style={styles.strategiesContainer}>
        {strategies.map(strategy => (
          <Card key={strategy.key} style={styles.strategyCard}>
            <ThemedView style={[styles.strategyIcon, { backgroundColor: strategy.icon.bg }]}>
              <IconSymbol name={strategy.icon.name} size={24} color={strategy.icon.color} />
            </ThemedView>
            <ThemedText style={styles.strategyTitle}>{strategy.title}</ThemedText>
            <ThemedText style={styles.strategyText}>{strategy.description}</ThemedText>
          </Card>
        ))}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    marginBottom: 15,
  },
  strategiesContainer: {
    marginBottom: 20,
     backgroundColor: 'transparent',
  },
  strategyCard: {
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  strategyIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  strategyTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 5,
  },
  strategyText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});