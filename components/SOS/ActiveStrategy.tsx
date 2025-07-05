import Button from '@/components/base/Button';
import Card from '@/components/base/Card';
import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { CopingStrategy } from '@/types/sos';
import { fontSize, spacing } from '@/utils/responsive';
import { StyleSheet, View } from 'react-native';

interface ActiveStrategyProps {
  strategy: CopingStrategy;
  currentStep: number;
  timeRemaining: number;
  onNext: () => void;
  onPrevious: () => void;
  onStop: () => void;
}

export default function ActiveStrategy({
  strategy,
  currentStep,
  timeRemaining,
  onNext,
  onPrevious,
  onStop,
}: ActiveStrategyProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>
            {strategy.title}
          </ThemedText>
          <ThemedText style={styles.timer}>
            {formatTime(timeRemaining)}
          </ThemedText>
        </View>
        
        <View style={styles.stepContainer}>
          <ThemedText style={styles.stepCounter}>
            Passo {currentStep + 1} de {strategy.steps.length}
          </ThemedText>
          <ThemedText style={styles.stepText}>
            {strategy.steps[currentStep]}
          </ThemedText>
        </View>
        
        <View style={styles.controls}>
          <Button
            label="Anterior"
            variant="outline"
            onPress={onPrevious}
            disabled={currentStep === 0}
            style={styles.controlButton}
          />
          <Button
            label="Próximo"
            variant="primary"
            onPress={onNext}
            disabled={currentStep === strategy.steps.length - 1}
            style={styles.controlButton}
            backgroundColor={colors.error.main}
          />
        </View>
        
        <Button
          label="Parar"
          variant="outline"
          onPress={onStop}
          style={styles.stopButton}
          labelStyle={{ color: colors.error.main }}
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.neutral.white,
    borderRadius: 20,
    padding: spacing.xl,
    shadowColor: colors.neutral.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-Bold',
    color: colors.error.main,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  timer: {
    fontSize: fontSize.xl,
    fontFamily: 'Inter-Bold',
    color: colors.error.dark,
    textAlign: 'center',
  },
  stepContainer: {
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  stepCounter: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Medium',
    color: colors.neutral.text.secondary,
    marginBottom: spacing.xs,
  },
  stepText: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.text.primary,
    textAlign: 'center',
    lineHeight: fontSize.lg * 1.4,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  controlButton: {
    flex: 1,
  },
  stopButton: {
    marginTop: spacing.md,
    borderColor: colors.error.main,
  },
});
