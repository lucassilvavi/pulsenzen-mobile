import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Card from '@/components/base/Card';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { StyleSheet } from 'react-native';

export type Exercise = {
  key: string;
  icon: { name: string; color: string; bg: string };
  title: string;
  duration: string;
  description: string;
};

type QuickReliefExercisesProps = {
  exercises: Exercise[];
  onExercisePress: (exerciseType: string) => void;
  style?: any;
  title?: string;
};

export default function QuickReliefExercises({
  exercises,
  onExercisePress,
  style,
  title = 'Exercícios de Alívio Rápido',
}: QuickReliefExercisesProps) {
  return (
    <ThemedView style={[styles.sectionContainer, style]}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>{title}</ThemedText>
      {exercises.map(ex => (
        <Card key={ex.key} style={styles.exerciseCard} onPress={() => onExercisePress(ex.key)}>
          <ThemedView style={styles.exerciseHeader}>
            <ThemedView style={[styles.iconCircle, { backgroundColor: ex.icon.bg }]}>
              <IconSymbol name={ex.icon.name} size={24} color={ex.icon.color} />
            </ThemedView>
            <ThemedView style={styles.exerciseInfo}>
              <ThemedText style={styles.exerciseTitle}>{ex.title}</ThemedText>
              <ThemedText style={styles.exerciseDuration}>{ex.duration}</ThemedText>
            </ThemedView>
            <IconSymbol name="chevron.right" size={20} color="#757575" />
          </ThemedView>
          <ThemedText style={styles.exerciseDescription}>{ex.description}</ThemedText>
        </Card>
      ))}
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
  exerciseCard: {
    padding: 15,
    marginBottom: 15,
  
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
    marginLeft: 15,
  },
  exerciseTitle: {
    fontWeight: '600',
    fontSize: 16,
  },
  exerciseDuration: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  exerciseDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});