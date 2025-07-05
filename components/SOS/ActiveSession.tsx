import Button from '@/components/base/Button';
import Card from '@/components/base/Card';
import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { CopingStrategy } from '@/types/sos';
import { fontSize, spacing } from '@/utils/responsive';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface ActiveSessionProps {
  strategy: CopingStrategy;
  currentStep: number;
  timeRemaining: number;
  onNext: () => void;
  onPrevious: () => void;
  onStop: () => void;
  onComplete: () => void;
}

export default function ActiveSession({
  strategy,
  currentStep,
  timeRemaining,
  onNext,
  onPrevious,
  onStop,
  onComplete
}: ActiveSessionProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLastStep = currentStep === strategy.steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <View style={styles.container}>
      <Card style={styles.sessionCard}>
        <View style={styles.header}>
          <View style={styles.strategyInfo}>
            <ThemedText style={styles.strategyIcon}>{strategy.icon}</ThemedText>
            <View>
              <ThemedText style={styles.strategyTitle}>
                {strategy.title}
              </ThemedText>
              <ThemedText style={styles.timeRemaining}>
                {formatTime(timeRemaining)} restantes
              </ThemedText>
            </View>
          </View>
          
          <Button
            label="Parar"
            variant="outline"
            onPress={onStop}
            style={styles.stopButton}
            labelStyle={styles.stopButtonText}
          />
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${((currentStep + 1) / strategy.steps.length) * 100}%` }
              ]}
            />
          </View>
          <ThemedText style={styles.progressText}>
            Passo {currentStep + 1} de {strategy.steps.length}
          </ThemedText>
        </View>

        <View style={styles.stepContainer}>
          <ThemedText style={styles.stepTitle}>
            Passo {currentStep + 1}
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
            disabled={isFirstStep}
            style={styles.controlButton}
          />
          
          {isLastStep ? (
            <Button
              label="Concluir"
              variant="primary"
              onPress={onComplete}
              style={styles.controlButton}
            />
          ) : (
            <Button
              label="Próximo"
              variant="primary"
              onPress={onNext}
              style={styles.controlButton}
            />
          )}
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sessionCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 20,
    padding: spacing.xl,
    shadowColor: colors.neutral.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  strategyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  strategyIcon: {
    fontSize: fontSize.xxl,
    marginRight: spacing.md,
  },
  strategyTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-Bold',
    color: colors.neutral.text.primary,
    marginBottom: spacing.xs,
  },
  timeRemaining: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Medium',
    color: colors.error.main,
  },
  stopButton: {
    borderColor: colors.error.main,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  stopButtonText: {
    color: colors.error.main,
    fontSize: fontSize.sm,
  },
  progressContainer: {
    marginBottom: spacing.xl,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.neutral.background,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success.main,
    borderRadius: 3,
  },
  progressText: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Medium',
    color: colors.neutral.text.secondary,
    textAlign: 'center',
  },
  stepContainer: {
    backgroundColor: colors.neutral.background,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  stepTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-Bold',
    color: colors.primary.main,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  stepText: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.text.primary,
    textAlign: 'center',
    lineHeight: fontSize.md * 1.5,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  controlButton: {
    flex: 1,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
