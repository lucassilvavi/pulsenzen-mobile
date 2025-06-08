import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StyleSheet } from 'react-native';

export default function MoodTracking({ mood }) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>Humor</ThemedText>
      <ThemedText style={styles.summary}>{mood.summary}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { margin: 16, padding: 16, backgroundColor: '#F5F5F5', borderRadius: 12 },
  title: { marginBottom: 8 },
  summary: { fontSize: 14, opacity: 0.8 },
});