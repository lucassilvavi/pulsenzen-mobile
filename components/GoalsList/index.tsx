import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Card from '@/components/base/Card';
import { StyleSheet } from 'react-native';

export default function GoalsList({ goals }) {
  return (
    <Card style={styles.goalsCard}>
      {goals.map((goal, idx) => (
        <ThemedView key={goal.title}>
          <ThemedView style={styles.goalItem}>
            <ThemedView style={styles.goalInfo}>
              <ThemedText style={styles.goalTitle}>{goal.title}</ThemedText>
              <ThemedText style={styles.goalSubtitle}>{goal.subtitle}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.goalProgress}>
              <ThemedView style={styles.progressBar}>
                <ThemedView style={[styles.progressFill, { width: `${goal.progress * 100}%`, backgroundColor: goal.color }]} />
              </ThemedView>
              <ThemedText style={styles.progressText}>{goal.value}</ThemedText>
            </ThemedView>
          </ThemedView>
          {idx < goals.length - 1 && <ThemedView style={styles.goalDivider} />}
        </ThemedView>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  goalsCard: { padding: 5, marginBottom: 15 },
  goalItem: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  goalInfo: { flex: 1, marginRight: 15 },
  goalTitle: { fontWeight: '600', fontSize: 16, marginBottom: 3 },
  goalSubtitle: { fontSize: 14, opacity: 0.7 },
  goalProgress: { width: 120 },
  progressBar: { height: 8, backgroundColor: '#F5F5F5', borderRadius: 4, marginBottom: 5, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: 12, textAlign: 'right' },
  goalDivider: { height: 1, backgroundColor: '#E0E0E0', marginHorizontal: 15 },
});