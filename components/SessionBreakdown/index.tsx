import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { StyleSheet } from 'react-native';
import Card from '../base/Card';

export default function SessionBreakdown({ breakdown }) {
  return (
    <ThemedView style={styles.container}>
      <Card style={{ marginBottom: 100 }}>
      <ThemedText type="subtitle" style={styles.title}>Sessões</ThemedText>
      {breakdown.map((item, idx) => (
        <ThemedView key={item.label} style={[styles.item, { backgroundColor: item.bg }]}>
          <IconSymbol name={item.icon} size={24} color={item.color} />
          <ThemedText style={styles.label}>{item.label}</ThemedText>
          <ThemedText style={styles.value}>{item.value}</ThemedText>
        </ThemedView>
      ))}
      </Card>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { margin: 16 },
  title: { marginBottom: 8 },
  item: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, padding: 12, marginBottom: 8 },
  label: { flex: 1, marginLeft: 12 },
  value: { fontWeight: 'bold' },
});