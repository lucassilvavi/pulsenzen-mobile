import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Image, StyleSheet } from 'react-native';

export default function AchievementsGrid({ achievements }) {
  return (
    <ThemedView style={styles.grid}>
      <ThemedText type="subtitle" style={styles.title}>Conquistas</ThemedText>
      <ThemedView style={styles.row}>
        {achievements.map((ach, idx) => (
          <ThemedView key={idx} style={styles.item}>
            <Image source={ach.icon} style={styles.icon} />
            <ThemedText style={styles.label}>{ach.label}</ThemedText>
          </ThemedView>
        ))}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  grid: { margin: 16 },
  title: { marginBottom: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  item: { alignItems: 'center', width: 80, margin: 8 },
  icon: { width: 48, height: 48, marginBottom: 6 },
  label: { fontSize: 12, textAlign: 'center' },
});