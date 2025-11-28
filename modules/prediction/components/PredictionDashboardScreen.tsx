import { ThemedText } from '@/components/ThemedText';
import { colors, getFactorCategoryMeta, getRiskPalette } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Modal, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePrediction } from '../context/PredictionContext';
import { track } from '../services/Telemetry';
import InsufficientDataContent from './InsufficientDataContent';
import { InterventionsCarousel } from './InterventionsCarousel';
import { Skeleton } from './Skeleton';

function getRiskTitle(level?: string): string {
  switch (level) {
    case 'low':
      return 'Saúde Emocional Estável';
    case 'medium':
      return 'Atenção à Saúde Emocional';
    case 'high':
      return 'Alerta de Saúde Emocional';
    case 'critical':
      return 'Cuidado Urgente Necessário';
    default:
      return 'Equilíbrio Emocional';
  }
}

export const PredictionDashboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { current, factors, interventions, refresh, loading, lastUpdated, insufficientData } = usePrediction();
  const [expandedFactors, setExpandedFactors] = React.useState<Record<string, boolean>>({});
  const { onboardingSeen, markOnboardingSeen } = usePrediction() as any;
  const [showOnboarding, setShowOnboarding] = React.useState(false);
  const [tooltipFactor, setTooltipFactor] = React.useState<string | null>(null);
  const [showInsufficientDataModal, setShowInsufficientDataModal] = React.useState(false);
  // (reduce motion handled inside specific animated components like carousel)

  React.useEffect(() => {
    if (!onboardingSeen && current) {
      setShowOnboarding(true);
    }
  }, [onboardingSeen, current]);

  const toggleFactor = (id: string) => {
    setExpandedFactors(prev => {
      const next = { ...prev, [id]: !prev[id] };
      track(next[id] ? 'prediction_factor_expand' : 'prediction_factor_collapse', { id });
      return next;
    });
  };

  const closeOnboarding = () => {
    setShowOnboarding(false);
    markOnboardingSeen?.();
    track('prediction_onboarding_dismiss');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>      
      <View style={styles.header}>        
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Voltar">
          <Ionicons name="chevron-back" size={26} color={colors.primary.main} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>{getRiskTitle(current?.level)}</ThemedText>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => { track('prediction_dashboard_refresh'); refresh(); }} />}
        showsVerticalScrollIndicator={false}
      >
        {loading && !current && (
          <View style={styles.card}>
            <Skeleton width={120} height={20} radius={6} style={{ marginBottom:8 }} />
            <Skeleton width={80} height={28} radius={8} style={{ marginBottom:4 }} />
            <Skeleton width={140} height={14} radius={6} />
          </View>
        )}

        {insufficientData && (
          <View style={styles.insufficientDataCard}>
            <View style={styles.insufficientDataHeader}>
              <View style={styles.insufficientDataIcon}>
                <Ionicons name="analytics-outline" size={24} color={colors.primary.main} />
              </View>
              <View style={styles.insufficientDataContent}>
                <ThemedText style={styles.insufficientDataTitle}>Análise em Construção</ThemedText>
                <ThemedText style={styles.insufficientDataMessage}>{insufficientData.message}</ThemedText>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.comoGerarButton} 
              onPress={() => setShowInsufficientDataModal(true)}
              accessibilityLabel="Ver como gerar análise"
            >
              <ThemedText style={styles.comoGerarButtonText}>Como Gerar</ThemedText>
              <Ionicons name="chevron-forward" size={16} color={colors.primary.main} />
            </TouchableOpacity>
          </View>
        )}

        {current && (
          <View style={[styles.card, { borderLeftWidth: 6, borderLeftColor: getRiskPalette(current.level).border }]}> 
            <ThemedText style={[styles.cardTitle, { color: getRiskPalette(current.level).text }]}>Status Atual</ThemedText>
            <ThemedText style={[styles.score, { color: getRiskPalette(current.level).text }]}>{(current.score * 100).toFixed(0)}% - {current.label}</ThemedText>
            <ThemedText style={styles.meta}>Confiança: {Math.round(current.confidence * 100)}%</ThemedText>
            {lastUpdated && (
              <ThemedText style={styles.meta}>Atualizado há {Math.max(1, Math.floor((Date.now() - lastUpdated)/1000))}s</ThemedText>
            )}
          </View>
        )}

        {!insufficientData && (
          <>
            <View style={styles.card}>
              <ThemedText style={styles.cardTitle}>Fatores Recentes</ThemedText>
              {factors.map((f, idx) => {
                const weightPct = Math.round(f.weight * 100);
                const intensity = weightPct >= 25 ? 'Alto' : weightPct >= 15 ? 'Médio' : 'Leve';
                const expanded = !!expandedFactors[f.id];
                const meta = getFactorCategoryMeta(f.category);
                return (
                  <View key={`${f.id}-${idx}`} style={styles.factorRow} onPr>
                    <View style={styles.factorHeader}>
                      <View style={styles.factorLeft}>
                        <View style={[styles.iconCircle, { backgroundColor: meta.bg }]}> 
                          <Ionicons name={meta.icon as any} size={16} color={meta.color} />
                        </View>
                        <ThemedText style={styles.factorLabel}>{f.label}</ThemedText>
                      </View>
                      <View style={[styles.badge, intensity==='Alto'? { backgroundColor: colors.riskIntensity.high.bg }: intensity==='Médio'? { backgroundColor: colors.riskIntensity.medium.bg } : { backgroundColor: colors.riskIntensity.low.bg } ]}>
                        <ThemedText style={styles.badgeText}>{intensity}</ThemedText>
                      </View>
                      <TouchableOpacity onPress={() => toggleFactor(f.id)} onLongPress={() => {
                        const willOpen = tooltipFactor !== f.id;
                        setTooltipFactor(willOpen ? f.id : null);
                        track(willOpen ? 'prediction_factor_tooltip_open' : 'prediction_factor_tooltip_close', { id: f.id });
                      }} accessibilityRole="button" accessibilityLabel={expanded ? 'Colapsar fator' : 'Expandir fator'}>
                        <ThemedText style={styles.factorWeight}>{expanded ? '−' : '+'}</ThemedText>
                      </TouchableOpacity>
                    </View>
                    {expanded && (
                      <>
                        <ThemedText style={styles.factorDesc}>{f.description}</ThemedText>
                        <ThemedText style={styles.factorSuggestion}>Sugestão: {f.suggestion}</ThemedText>
                        {tooltipFactor===f.id && (
                          <View style={styles.tooltip}>
                            <ThemedText style={styles.tooltipText}>Dica TCC: Observe o pensamento sem julgá-lo e registre um gatilho específico.</ThemedText>
                          </View>
                        )}
                      </>
                    )}
                  </View>
                );
              })}
            </View>

            <View style={styles.card}>
              <ThemedText style={styles.cardTitle}>Sugestões</ThemedText>
              <InterventionsCarousel />
            </View>
          </>
        )}

        {showOnboarding && (
          <View style={styles.onboardingBubble}>
            <ThemedText style={styles.onboardingTitle}>Bem-vindo ao Painel</ThemedText>
            <ThemedText style={styles.onboardingText}>Aqui você vê sinais precoces e sugestões suaves. Toque nos fatores para explorar. Pressione longamente para dicas rápidas.</ThemedText>
            <TouchableOpacity onPress={closeOnboarding} style={styles.onboardingButton} accessibilityLabel="Fechar introdução">
              <ThemedText style={styles.onboardingButtonText}>Entendi</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Modal de dados insuficientes */}
      {insufficientData && (
        <Modal visible={showInsufficientDataModal} animationType="slide" transparent onRequestClose={() => setShowInsufficientDataModal(false)}>
          <View style={styles.modalOverlay}>
            <InsufficientDataContent 
              insufficientData={insufficientData} 
              onClose={() => setShowInsufficientDataModal(false)} 
            />
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  headerTitle: { fontFamily: 'Inter-Bold', fontSize: fontSize.lg, color: colors.primary.main },
  headerRight: { width: 40 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xl },
  card: { backgroundColor: '#FFFFFF', padding: spacing.lg, borderRadius: 16, marginBottom: spacing.lg, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  cardTitle: { fontFamily: 'Inter-SemiBold', fontSize: fontSize.md, marginBottom: spacing.sm, color: colors.primary.main },
  score: { fontFamily: 'Inter-Bold', fontSize: fontSize.lg, color: colors.primary.main, marginBottom: 4 },
  meta: { fontFamily: 'Inter-Medium', fontSize: fontSize.xs, color: colors.neutral.text.secondary, marginBottom: 2 },
  factorRow: { marginBottom: spacing.md, backgroundColor: '#F8FAFC', padding: spacing.md, borderRadius: 12 },
  factorHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, alignItems:'center' },
  factorLeft: { flexDirection:'row', alignItems:'center', flex:1, paddingRight: spacing.sm },
  factorLabel: { fontFamily: 'Inter-Medium', fontSize: fontSize.sm, color: colors.neutral.text.primary, flexShrink:1 },
  iconCircle:{ width:28, height:28, borderRadius:14, alignItems:'center', justifyContent:'center', marginRight:8 },
  factorWeight: { fontFamily: 'Inter-SemiBold', fontSize: fontSize.sm, color: colors.primary.main },
  factorDesc: { fontFamily: 'Inter-Regular', fontSize: fontSize.xs, color: colors.neutral.text.secondary, marginBottom: 2 },
  factorSuggestion: { fontFamily: 'Inter-Medium', fontSize: fontSize.xs, color: colors.primary.main },
  interventionsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  interventionCard: { width: '31%', backgroundColor: '#F3F6F9', padding: spacing.md, borderRadius: 14, alignItems: 'center' },
  interventionDone: { opacity: 0.5 },
  interventionEmoji: { fontSize: 28, marginBottom: 6 },
  interventionTitle: { fontFamily: 'Inter-SemiBold', fontSize: fontSize.sm, color: colors.neutral.text.primary, textAlign: 'center', marginBottom: 4 },
  interventionBenefit: { fontFamily: 'Inter-Regular', fontSize: fontSize.xs, textAlign: 'center', color: colors.neutral.text.secondary },
  badge: { paddingHorizontal:8, paddingVertical:2, borderRadius:12, marginRight:6 },
  badgeText: { fontFamily:'Inter-SemiBold', fontSize: fontSize.xs, color:'#fff' },
  tooltip:{ backgroundColor:'#1E293B', padding: spacing.sm, borderRadius:8, marginTop: spacing.xs },
  tooltipText:{ fontFamily:'Inter-Regular', fontSize: fontSize.xs, color:'#FFF' },
  onboardingBubble:{ position:'absolute', top: 10, left: 10, right:10, backgroundColor:'#FFFFFF', borderRadius:20, padding: spacing.lg, shadowColor:'#000', shadowOpacity:0.12, shadowRadius:16, shadowOffset:{ width:0, height:6 }, elevation:8 },
  onboardingTitle:{ fontFamily:'Inter-Bold', fontSize: fontSize.md, color: colors.primary.main, marginBottom: spacing.xs },
  onboardingText:{ fontFamily:'Inter-Regular', fontSize: fontSize.sm, color: colors.neutral.text.primary, marginBottom: spacing.md },
  onboardingButton:{ alignSelf:'flex-end', backgroundColor: colors.primary.main, paddingHorizontal:16, paddingVertical:8, borderRadius:12 },
  onboardingButtonText:{ fontFamily:'Inter-SemiBold', fontSize: fontSize.sm, color:'#FFF' },
  insufficientDataCard: { 
    backgroundColor: colors.primary.light + '08', 
    padding: spacing.lg, 
    borderRadius: 16, 
    marginBottom: spacing.lg, 
    borderLeftWidth: 4, 
    borderLeftColor: colors.primary.main 
  },
  insufficientDataHeader: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    marginBottom: spacing.md 
  },
  insufficientDataIcon: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: colors.primary.light + '20', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: spacing.md 
  },
  insufficientDataContent: { 
    flex: 1 
  },
  insufficientDataTitle: { 
    fontFamily: 'Inter-SemiBold', 
    fontSize: fontSize.md, 
    color: colors.primary.main, 
    marginBottom: spacing.xs 
  },
  insufficientDataMessage: { 
    fontFamily: 'Inter-Regular', 
    fontSize: fontSize.sm, 
    color: colors.neutral.text.primary, 
    lineHeight: 20 
  },
  insufficientDataHelper: { 
    fontFamily: 'Inter-Medium', 
    fontSize: fontSize.sm, 
    color: colors.neutral.text.secondary, 
    lineHeight: 20, 
    textAlign: 'center' 
  },
  comoGerarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.light + '20',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    marginTop: spacing.md,
  },
  comoGerarButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: fontSize.sm,
    color: colors.primary.main,
    marginRight: spacing.xs,
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.18)', 
    justifyContent: 'flex-end' 
  },
});
