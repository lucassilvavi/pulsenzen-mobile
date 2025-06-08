import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StyleSheet } from 'react-native';

export default function StatsOverview({ stats }) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>Resumo</ThemedText>
      <ThemedView style={styles.row}>
        <ThemedView style={styles.stat}>
          <ThemedText style={styles.value}>{stats.totalTime}</ThemedText>
          <ThemedText style={styles.label}>Tempo total</ThemedText>
        </ThemedView>
        <ThemedView style={styles.stat}>
          <ThemedText style={styles.value}>{stats.activeDays}</ThemedText>
          <ThemedText style={styles.label}>Dias ativos</ThemedText>
        </ThemedView>
        <ThemedView style={styles.stat}>
          <ThemedText style={styles.value}>{stats.streak}</ThemedText>
          <ThemedText style={styles.label}>Sequência</ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { margin: 16, marginBottom: 0,  backgroundColor: 'transparent', },
  title: { marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between',  backgroundColor: 'transparent', },
  stat: { alignItems: 'center', flex: 1,  backgroundColor: 'transparent', },
  value: { fontSize: 18, fontWeight: 'bold' },
  label: { fontSize: 12, opacity: 0.7 },
});