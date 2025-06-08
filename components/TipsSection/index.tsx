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
    <Card style={[styles.card, style]}>
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
  },
  tipsList: {
    marginTop: 15,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    marginLeft: 10,
    flex: 1,
  },
});