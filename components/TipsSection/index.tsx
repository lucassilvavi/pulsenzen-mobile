import Card from '@/components/base/Card';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { StyleSheet } from 'react-native';

type Tip = string;

type TipsSectionProps = {
  title: string;
  tips: Tip[];
  style?: object;
};

export default function TipsSection({ title, tips, style }: TipsSectionProps) {
  return (
    <Card style={[styles.card, style] as any}>
      <ThemedText type="subtitle">{title}</ThemedText>
      <ThemedView style={styles.tipsList}>
        {tips.map((tip, idx) => (
          <ThemedView style={styles.tipItem} key={idx}>
            <IconSymbol name="checkmark.circle.fill" size={20} color="#4CAF50" />
            <ThemedText style={styles.tipText}>{tip}</ThemedText>
          </ThemedView>
        ))}
      </ThemedView>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
  },
  tipsList: {
    marginTop: 15,
    backgroundColor: '#E3F2FD',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#E3F2FD',

  },
  tipText: {
    marginLeft: 10,
    flex: 1,
    fontWeight: '500',
  },
});