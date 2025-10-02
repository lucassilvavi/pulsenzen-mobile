import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { InsufficientDataState } from '../types';

interface Props {
  insufficientData: InsufficientDataState;
  onClose: () => void;
}

const InsufficientDataContent: React.FC<Props> = ({ insufficientData, onClose }) => {
  const steps = [
    {
      icon: '📝' as const,
      title: 'Registre seu Humor',
      description: 'Anote como você está se sentindo pelo menos 3 vezes por semana',
      action: 'Ir para Registro de Humor'
    },
    {
      icon: '✍️' as const,
      title: 'Escreva no Diário',
      description: 'Compartilhe seus pensamentos e sentimentos em 2-3 entradas',
      action: 'Abrir Diário'
    },
    {
      icon: '📊' as const,
      title: 'Use Consistentemente',
      description: 'Continue usando o app por alguns dias para gerar padrões',
      action: 'Continuar Usando'
    },
    {
      icon: '🔄' as const,
      title: 'Aguarde a Análise',
      description: 'Volte em alguns dias para ver sua análise personalizada',
      action: 'Entendi'
    }
  ];

  return (
    <View style={styles.sheet}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.title}>Como Gerar sua Análise</ThemedText>
        <TouchableOpacity onPress={onClose} accessibilityLabel="Fechar" style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={colors.neutral.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Message */}
        <View style={styles.messageContainer}>
          <ThemedText style={styles.message}>{insufficientData.message}</ThemedText>
        </View>

        {/* Steps */}
        <View style={styles.stepsContainer}>
          <ThemedText style={styles.sectionTitle}>Passos para Gerar sua Análise:</ThemedText>
          
          {steps.map((step, index) => (
            <View key={index} style={styles.stepItem}>
              <View style={styles.stepHeader}>
                <View style={styles.stepIcon}>
                  <ThemedText style={styles.stepEmoji}>{step.icon}</ThemedText>
                </View>
                <View style={styles.stepContent}>
                  <ThemedText style={styles.stepTitle}>{step.title}</ThemedText>
                  <ThemedText style={styles.stepDescription}>{step.description}</ThemedText>
                </View>
                <View style={styles.stepNumber}>
                  <ThemedText style={styles.stepNumberText}>{index + 1}</ThemedText>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Additional Info */}
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary.main} />
            <ThemedText style={styles.infoText}>
              Quanto mais dados você fornecer, mais precisa será sua análise personalizada.
            </ThemedText>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.success.main} />
            <ThemedText style={styles.infoText}>
              Todos os seus dados são privados e seguros, usados apenas para sua análise.
            </ThemedText>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.actionButton} onPress={onClose}>
          <ThemedText style={styles.actionButtonText}>Entendi, vou começar!</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sheet: { 
    backgroundColor: '#FFF', 
    paddingHorizontal: spacing.lg, 
    paddingTop: spacing.lg, 
    paddingBottom: spacing.xl, 
    borderTopLeftRadius: 28, 
    borderTopRightRadius: 28, 
    maxHeight: '92%' 
  },
  scroll: { flexGrow: 0 },
  scrollContent: { paddingBottom: spacing.xxl },
  header: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: spacing.md 
  },
  title: { 
    fontFamily: 'Inter-Bold', 
    fontSize: fontSize.lg, 
    color: colors.primary.main 
  },
  closeBtn: { 
    position: 'absolute', 
    right: 0, 
    top: 0, 
    padding: spacing.sm 
  },
  messageContainer: {
    backgroundColor: colors.primary.light + '10',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary.main,
  },
  message: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.primary,
    lineHeight: 20,
  },
  stepsContainer: {
    marginBottom: spacing.lg,
  },
  sectionTitle: { 
    fontFamily: 'Inter-SemiBold', 
    fontSize: fontSize.md, 
    marginBottom: spacing.sm, 
    color: colors.neutral.text.primary 
  },
  stepItem: {
    marginBottom: spacing.md,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.background,
    padding: spacing.md,
    borderRadius: 12,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  stepEmoji: {
    fontSize: 20,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-SemiBold',
    color: colors.neutral.text.primary,
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: fontSize.xs,
    color: colors.neutral.text.secondary,
    lineHeight: 16,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: fontSize.xs,
    fontFamily: 'Inter-Bold',
    color: colors.neutral.white,
  },
  infoContainer: {
    marginBottom: spacing.lg,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.neutral.background + '80',
    borderRadius: 8,
  },
  infoText: {
    fontSize: fontSize.xs,
    color: colors.neutral.text.secondary,
    lineHeight: 16,
    marginLeft: spacing.sm,
    flex: 1,
  },
  actionButton: {
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  actionButtonText: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-SemiBold',
    color: colors.neutral.white,
  },
});

export default InsufficientDataContent;