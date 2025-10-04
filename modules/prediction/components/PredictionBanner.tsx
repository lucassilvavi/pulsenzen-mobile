import { ThemedText } from '@/components/ThemedText';
import { colors, getRiskPalette } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { usePrediction } from '../context/PredictionContext';
import { track } from '../services/Telemetry';
import { PredictionDetailModal } from './PredictionDetailModal';

function levelColors(level: string) {
  const palette = getRiskPalette((['low','medium','high'].includes(level) ? level : 'low') as 'low'|'medium'|'high');
  return { bg: [palette.bg, palette.bgAlt] as const, text: palette.text };
}

export const PredictionBanner: React.FC = () => {
  const { current, loading, insufficientData, initializeIfNeeded } = usePrediction();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [hasInitialized, setHasInitialized] = React.useState(false);
  
  // 🎯 Task 7: Lazy loading - só inicializa uma vez quando o banner é montado
  useEffect(() => {
    if (!hasInitialized) {
      console.log('[PredictionBanner] 🚀 Banner renderizado, iniciando lazy loading (Task 7)');
      initializeIfNeeded();
      track('prediction_banner_view');
      setHasInitialized(true);
    }
  }, []); // Array vazio para executar apenas na montagem
  
  // Se há dados insuficientes, usar cor neutra
  const palette = useMemo(() => {
    if (insufficientData) {
      return { 
        bg: [colors.neutral.background, colors.neutral.card] as const, 
        text: colors.neutral.text.primary 
      };
    }
    return levelColors(current?.level || 'low');
  }, [current, insufficientData]);
  
  const gradientColors = [palette.bg[0], palette.bg[1]] as const;

  return (
    <>
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => { setModalVisible(true); track('prediction_banner_modal_open'); }}
      style={styles.wrapper}
      accessibilityRole="button"
      accessibilityLabel="Ver detalhes do seu equilíbrio emocional"
    >
      <LinearGradient colors={gradientColors} style={styles.container}>
        <View style={styles.left}>
          {insufficientData ? (
            <>
              <ThemedText style={[styles.title, { color: palette.text }]}>Análise Indisponível</ThemedText>
              <ThemedText style={[styles.subtitle, { color: colors.neutral.text.secondary }]}>
                {insufficientData.message}
              </ThemedText>
            </>
          ) : (
            <>
              <ThemedText style={[styles.title, { color: palette.text }]}>Equilíbrio</ThemedText>
              {loading && !current && (
                <View style={{ marginTop:4 }}>
                  <ActivityIndicator size="small" color={palette.text} />
                </View>
              )}
              {current && !loading && (
                <ThemedText style={[styles.score, { color: palette.text }]}>{(current.score * 100).toFixed(0)}%</ThemedText>
              )}
              {current && (
                <ThemedText style={styles.subtitle}>{current.label}</ThemedText>
              )}
            </>
          )}
        </View>
        <View style={styles.right}>
          <TouchableOpacity 
            onPress={() => { setModalVisible(true); track('prediction_banner_modal_open'); }} 
            accessibilityLabel={insufficientData ? "Ver como gerar análise" : "Abrir detalhamento completo"} 
            style={styles.dashboardBtn}
          >
            <ThemedText style={[styles.cta, { color: palette.text }]}>
              {insufficientData ? "Como Gerar" : "Detalhes"}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
    <PredictionDetailModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  left: {
    flex: 1,
  },
  right: {
    paddingLeft: spacing.md,
    alignItems:'center',
  },
  dashboardBtn:{ paddingVertical:4, paddingHorizontal:10, borderRadius:12, backgroundColor:'rgba(255,255,255,0.5)' },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: fontSize.md,
    marginBottom: 2,
  },
  score: {
    fontFamily: 'Inter-SemiBold',
    fontSize: fontSize.lg,
  },
  subtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: fontSize.sm,
    color: colors.neutral.text.secondary,
    marginTop: 4,
  },
  cta: {
    fontFamily: 'Inter-Medium',
    fontSize: fontSize.sm,
  },
});
