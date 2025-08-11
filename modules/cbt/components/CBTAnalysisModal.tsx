import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useCBTAnalysis } from '../hooks/useCBTAnalysis';

interface Props { visible: boolean; onClose: () => void; text: string; }

export const CBTAnalysisModal: React.FC<Props> = ({ visible, onClose, text }) => {
  const { result, loading, error, runAnalysis, reset } = useCBTAnalysis();

  React.useEffect(()=>{ if (visible && text.trim().length > 10) { runAnalysis(text); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } else { reset(); } }, [visible, text, runAnalysis]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>          
          <View style={styles.header}>            
            <ThemedText style={styles.title}>Análise Cognitiva (Beta)</ThemedText>
            <TouchableOpacity onPress={onClose} accessibilityLabel="Fechar" style={styles.closeBtn}>
              <ThemedText style={styles.closeText}>×</ThemedText>
            </TouchableOpacity>
          </View>
          {!loading && result && (
            <TouchableOpacity onPress={() => runAnalysis(text)} style={styles.regenerateBtn} accessibilityLabel="Regerar análise">
              <ThemedText style={styles.regenerateText}>Regerar</ThemedText>
            </TouchableOpacity>
          )}

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xl }}>
            {loading && (
              <View style={styles.loadingBlock}>
                <ActivityIndicator color={colors.primary.main} />
                <ThemedText style={styles.loadingText}>Identificando padrões de pensamento...</ThemedText>
              </View>
            )}
            {error && <ThemedText style={styles.error}>{error}</ThemedText>}
            {result && (
              <>
                <ThemedText style={styles.summary}>{result.summary}</ThemedText>
                <View style={styles.section}>
                  <ThemedText style={styles.sectionTitle}>Distorções (toque para refletir)</ThemedText>
                  {result.distortions.map(d => (
                    <View key={d.id} style={styles.distortionCard}>
                      <ThemedText style={styles.distortionLabel}>{d.label}</ThemedText>
                      <ThemedText style={styles.distortionDesc}>{d.description}</ThemedText>
                      <ThemedText style={styles.promptTitle}>Desafie:</ThemedText>
                      <ThemedText style={styles.promptText}>{d.evidencePrompt}</ThemedText>
                      <ThemedText style={styles.promptTitle}>Alternativa:</ThemedText>
                      <ThemedText style={styles.promptText}>{d.alternativePrompt}</ThemedText>
                    </View>
                  ))}
                </View>
                <View style={styles.section}>
                  <ThemedText style={styles.sectionTitle}>Perguntas Socráticas</ThemedText>
                  {result.questions.map(q => (
                    <View key={q.id} style={styles.questionItem}>
                      <ThemedText style={styles.questionBullet}>•</ThemedText>
                      <ThemedText style={styles.questionText}>{q.question}</ThemedText>
                    </View>
                  ))}
                </View>
                <View style={styles.section}> 
                  <ThemedText style={styles.sectionTitle}>Sugestão</ThemedText>
                  <ThemedText style={styles.suggestion}>{result.suggestion}</ThemedText>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay:{ flex:1, backgroundColor:'rgba(0,0,0,0.18)', justifyContent:'flex-end' },
  sheet:{ backgroundColor:'#FFF', paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xl, borderTopLeftRadius:28, borderTopRightRadius:28, maxHeight:'92%' },
  header:{ alignItems:'center', justifyContent:'center', marginBottom: spacing.md },
  title:{ fontFamily:'Inter-Bold', fontSize: fontSize.md, color: colors.primary.main },
  closeBtn:{ position:'absolute', right:0, top:0, padding: spacing.sm },
  closeText:{ fontSize:28, lineHeight:32, color: colors.primary.main },
  regenerateBtn:{ position:'absolute', left:0, top:0, padding: spacing.sm },
  regenerateText:{ fontFamily:'Inter-Medium', fontSize: fontSize.xs, color: colors.primary.main },
  loadingBlock:{ alignItems:'center', marginTop: spacing.lg },
  loadingText:{ fontFamily:'Inter-Medium', fontSize: fontSize.sm, color: colors.neutral.text.secondary, marginTop: spacing.sm, textAlign:'center' },
  error:{ color: colors.error.main, marginTop: spacing.md },
  summary:{ fontFamily:'Inter-SemiBold', fontSize: fontSize.sm, color: colors.neutral.text.primary, backgroundColor:'#F1F5F9', padding: spacing.md, borderRadius:12, marginBottom: spacing.md },
  section:{ marginBottom: spacing.lg },
  sectionTitle:{ fontFamily:'Inter-SemiBold', fontSize: fontSize.md, color: colors.neutral.text.primary, marginBottom: spacing.sm },
  distortionCard:{ backgroundColor:'#F8FAFC', borderRadius:16, padding: spacing.md, marginBottom: spacing.sm },
  distortionLabel:{ fontFamily:'Inter-SemiBold', fontSize: fontSize.sm, color: colors.primary.main, marginBottom:4 },
  distortionDesc:{ fontFamily:'Inter-Regular', fontSize: fontSize.xs, color: colors.neutral.text.secondary, marginBottom:6 },
  promptTitle:{ fontFamily:'Inter-Medium', fontSize: fontSize.xs, color: colors.neutral.text.primary, marginTop:4 },
  promptText:{ fontFamily:'Inter-Regular', fontSize: fontSize.xs, color: colors.neutral.text.secondary },
  questionItem:{ flexDirection:'row', alignItems:'flex-start', marginBottom:4 },
  questionBullet:{ fontSize:14, lineHeight:18, marginRight:6, color: colors.primary.main },
  questionText:{ flex:1, fontFamily:'Inter-Regular', fontSize: fontSize.sm, color: colors.neutral.text.primary },
  suggestion:{ fontFamily:'Inter-Regular', fontSize: fontSize.sm, color: colors.neutral.text.primary, backgroundColor:'#FFF8E1', padding: spacing.md, borderRadius:12 },
});
