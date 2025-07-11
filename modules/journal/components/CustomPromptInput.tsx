import Button from '@/components/base/Button';
import CustomTextInput from '@/components/base/CustomTextInput';
import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface CustomPromptInputProps {
  value: string;
  onChange: (text: string) => void;
  onCancel: () => void;
  onUse: () => void;
  disabled?: boolean;
}

export default function CustomPromptInput({ value, onChange, onCancel, onUse, disabled }: CustomPromptInputProps) {
  return (
    <View style={styles.customPromptSection}>
      <ThemedText style={styles.sectionTitle}>Crie sua pergunta:</ThemedText>
      <CustomTextInput
        placeholder="Digite sua pergunta personalizada..."
        value={value}
        onChangeText={onChange}
        inputStyle={styles.customPromptInput}
        multiline
      />
      <View style={styles.customPromptActions}>
        <Button
          label="Cancelar"
          variant="outline"
          onPress={onCancel}
          style={styles.customPromptAction}
        />
        <Button
          label="Usar pergunta"
          variant="primary"
          onPress={onUse}
          disabled={disabled}
          style={styles.customPromptAction}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  customPromptSection: {
    marginBottom: spacing.xl,
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    padding: spacing.md,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Bold',
    color: colors.journal.accent,
    marginBottom: spacing.sm,
  },
  customPromptInput: {
    minHeight: 100,
    maxHeight: 150,
    borderColor: colors.neutral.divider,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    marginBottom: spacing.md,
    backgroundColor: colors.neutral.white,
  },
  customPromptActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  customPromptAction: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});
