import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { colors, getRiskPalette } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { usePrediction } from '../context/PredictionContext';

/**
 * Pure (non-Modal) internal content used by PredictionDetailModal.
 * Extracted to enable simpler and more stable unit tests without dealing with RN Modal/animation quirks.
 */
export interface PredictionDetailContentProps { onClose?: () => void; }

export const PredictionDetailContent: React.FC<PredictionDetailContentProps> = ({ onClose }) => {
  const { current, factors, interventions } = usePrediction();
  if (!current) return null;
  const palette = getRiskPalette(current.level);

  return (
    <View style={styles.sheet} testID="prediction-detail-content">
      <View style={[styles.header, { borderBottomColor: palette.border }]}>            
        <ThemedText style={[styles.title, { color: palette.text }]}>Equilíbrio Atual</ThemedText>
        {onClose && (
          <TouchableOpacity onPress={onClose} accessibilityLabel="Fechar" style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={palette.text} />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={[styles.scoreCard, { backgroundColor: palette.bgAlt, borderColor: palette.border }]}>            
          <ThemedText style={[styles.scoreText, { color: palette.text }]}>{(current.score*100).toFixed(0)}%</ThemedText>
          <ThemedText style={styles.scoreLabel}>{current.label}</ThemedText>
          <ThemedText style={styles.confidence}>Confiança {Math.round(current.confidence*100)}%</ThemedText>
        </View>

        <ThemedText style={styles.sectionTitle}>Principais Fatores</ThemedText>
        {factors.slice(0,4).map(f => (
          <View key={f.id} style={styles.factorRow}>
            <View style={styles.factorHeader}>
              <ThemedText style={styles.factorLabel}>{f.label}</ThemedText>
              <ThemedText style={[styles.factorWeight, { color: palette.text }]}>{Math.round(f.weight*100)}%</ThemedText>
            </View>
            <ThemedText style={styles.factorDesc}>{f.description}</ThemedText>
            <ThemedText style={styles.factorSuggestion}>{f.suggestion}</ThemedText>
          </View>
        ))}

        <ThemedText style={styles.sectionTitle}>Sugestões</ThemedText>
        <View style={styles.interventionsRow}>
          {interventions.map(i => (
            <View key={i.id} style={styles.interventionCard} accessibilityLabel={`Intervenção ${i.title}`}>
              <ThemedText style={styles.interventionEmoji}>{i.emoji}</ThemedText>
              <ThemedText style={styles.interventionTitle}>{i.title}</ThemedText>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sheet: { backgroundColor:'#FFF', paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: 0, borderTopLeftRadius:28, borderTopRightRadius:28, maxHeight:'92%', width:'100%' },
  scroll: { flexGrow:0 },
  scrollContent: { paddingBottom: spacing.xxl },
  header: { flexDirection:'row', alignItems:'center', justifyContent:'center', paddingBottom: spacing.sm, borderBottomWidth:1, marginBottom: spacing.md },
  closeBtn: { position:'absolute', right:0, top:0, padding: spacing.sm },
  title: { fontFamily:'Inter-Bold', fontSize: fontSize.lg },
  scoreCard: { borderWidth:1, borderRadius:20, padding: spacing.lg, alignItems:'center', marginBottom: spacing.lg },
  scoreText: { fontFamily:'Inter-Bold', fontSize: fontSize.xl },
  scoreLabel: { fontFamily:'Inter-Medium', fontSize: fontSize.sm, color: colors.neutral.text.secondary, marginTop:4 },
  confidence: { fontFamily:'Inter-Medium', fontSize: fontSize.xs, color: colors.neutral.text.secondary, marginTop:4 },
  sectionTitle: { fontFamily:'Inter-SemiBold', fontSize: fontSize.md, marginTop: spacing.md, marginBottom: spacing.sm, color: colors.neutral.text.primary },
  factorRow: { backgroundColor:'#F8FAFC', borderRadius:14, padding: spacing.md, marginBottom: spacing.sm },
  factorHeader: { flexDirection:'row', justifyContent:'space-between', marginBottom:4 },
  factorLabel: { fontFamily:'Inter-Medium', fontSize: fontSize.sm, flex:1, paddingRight: spacing.sm },
  factorWeight: { fontFamily:'Inter-SemiBold', fontSize: fontSize.sm },
  factorDesc: { fontFamily:'Inter-Regular', fontSize: fontSize.xs, color: colors.neutral.text.secondary },
  factorSuggestion: { fontFamily:'Inter-Medium', fontSize: fontSize.xs, color: colors.primary.main, marginTop:2 },
  interventionsRow: { flexDirection:'row', flexWrap:'wrap', justifyContent:'space-between' },
  interventionCard: { width:'30%', backgroundColor:'#F3F6F9', borderRadius:16, padding: spacing.md, alignItems:'center', marginBottom: spacing.sm },
  interventionEmoji: { fontSize:26, marginBottom:4 },
  interventionTitle: { fontFamily:'Inter-SemiBold', fontSize: fontSize.xs, textAlign:'center' },
});

export default PredictionDetailContent;
