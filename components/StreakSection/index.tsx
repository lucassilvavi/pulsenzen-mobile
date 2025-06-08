import Button from '@/components/base/Button';
import Card from '@/components/base/Card';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import React from 'react';
import { StyleSheet } from 'react-native';

const days = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

export default function StreakSection() {
  return (
    <Card style={styles.streakCard}>
      <ThemedView style={styles.streakHeader}>
        <ThemedText type="subtitle">Seu progresso</ThemedText>
        <ThemedView style={styles.streakBadge}>
          <IconSymbol name="flame.fill" size={16} color="#FF9800" />
          <ThemedText style={styles.streakText}>7 dias</ThemedText>
        </ThemedView>
      </ThemedView>
      <ThemedView style={styles.streakProgress}>
        {days.map((day, idx) => (
          <ThemedView style={styles.streakDay} key={day + idx}>
            <ThemedView
              style={[
                styles.streakDot,
                idx < 6 ? styles.streakCompleted : styles.streakActive,
              ]}
            >
              <IconSymbol name="checkmark" size={12} color="#FFFFFF" />
            </ThemedView>
            <ThemedText style={styles.streakDayText}>{day}</ThemedText>
          </ThemedView>
        ))}
      </ThemedView>
      <Button
        label="Ver estatísticas completas"
        variant="outline"
        style={styles.streakButton}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  streakCard: {
    marginHorizontal: 20,
    padding: 20,
    marginBottom: 20,
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  streakText: {
    marginLeft: 5,
    color: '#FF9800',
    fontWeight: '600',
  },
  streakProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  streakDay: {
    alignItems: 'center',
  },
  streakDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  streakCompleted: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  streakActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  streakDayText: {
    fontSize: 12,
  },
  streakButton: {
    marginTop: 5,
  },
});