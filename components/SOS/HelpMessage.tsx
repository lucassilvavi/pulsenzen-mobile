import Card from '@/components/base/Card';
import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';

interface HelpMessageProps {
  message?: string;
  style?: ViewStyle;
}

export default function HelpMessage({ 
  message = "Se você está em crise, lembre-se: este momento vai passar. Escolha uma técnica abaixo para se acalmar.",
  style 
}: HelpMessageProps) {
  return (
    <Card style={StyleSheet.flatten([styles.card, style])}>
      <ThemedText style={styles.message}>
        {message}
      </ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF8E1',
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.error.main,
  },
  message: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.text.primary,
    lineHeight: fontSize.md * 1.4,
    textAlign: 'center',
  },
});
