# PulseZen Mobile MVP UI Spec (CBT Focus)

Status: Draft v0.1
Owner: Frontend Lead
Last Updated: 2025-08-10

## 1. Objetivo
Entregar fluxo completo (mock) para registrar humor, escrever diário com análise cognitiva básica, visualizar previsão de risco (mock) e receber sugestões de intervenções (TCC) mantendo UX fluida, acolhedora e acessível.

## 2. Fluxos MVP
1. Home (já existe) -> Banner de Prevenção (novo) -> Navega para Dashboard de Risco
2. Home -> Registrar Humor (existente)
3. Home -> Diário -> Nova Entrada (existente) + Botão "Analisar Pensamento" (novo mock)
4. Dashboard de Risco -> Detalhes da Previsão -> Intervenções sugeridas -> Executar intervenção (marca como concluída local)
5. Notificação interna (mock) -> Abre Modal de Alerta de Risco (Prediction Detail)

## 3. Telas Novas
| Tela | Descrição | Componentes principais | Estado mock |
|------|-----------|------------------------|-------------|
| Prediction Dashboard | Visão geral de risco atual, evolução, fatores | PredictionBanner (resumo), RiskFactorsList, InterventionsCarousel | predictionMock.current, factorsMock, interventionsMock |
| Prediction Detail Modal | Explica score, fatores, confiança, call-to-action | PredictionDetailModal | predictionMock.detail |
| CBT Analysis Panel (inline na JournalEntry) | Destaca distorções cognitivas detectadas (mock), perguntas socráticas | ThoughtDistortionChips, SocraticQuestionsList | distortionsMock, socraticMock |
| Interventions Library (secundária) | Lista de técnicas TCC e status | InterventionsList | interventionsMock |

## 4. Componentes Novos
- PredictionBanner: cartão comprimido com status (baixo / moderado / alto), cor adaptativa, CTA.
- RiskFactorsList: lista expand/collapsible categorizada (Humor, Padrões de escrita, Frequência). Ícones + tooltips.
- InterventionsCarousel: carrossel horizontal (snap) de 3 sugestões (respiração guiada, reestruturação cognitiva, journaling guiado).
- InterventionSuggestionCard: usado no carrossel (emoji, título, benefício rápido, botão iniciar).
- PredictionDetailModal: anima entrada (fade + slide), exibe gauge semicircular, fatores ordenados por impacto.

## 5. Estados & Design Tokens
Usar `colors` e `spacing` existentes. Novos semantic tokens (avaliar depois; agora inline com comentário TODO):
- risk.low.bg = '#E3F9F0'
- risk.low.text = '#1B7F52'
- risk.medium.bg = '#FFF4E0'
- risk.medium.text = '#B25E00'
- risk.high.bg = '#FDE8EA'
- risk.high.text = '#B4232C'

## 6. Acessibilidade & Bem-estar
- Motion reduzido: respeitar `reduceMotion` (futuro TODO) para desativar animações intensas.
- Haptics suaves (Light / Success). Nunca usar erro agressivo em contexto de risco — usar tom cuidadoso.
- Linguagem: sempre validante, evitar alarmismo. Ex.: "Sinal de atenção" em vez de "Alto risco".

## 7. Estados de Risk Level (mock logic)
```
score 0-0.39 => low   label: "Equilibrado"
score 0.40-0.69 => medium label: "Atenção leve"
score 0.70+ => high label: "Sinal de atenção"
```
Confidence: 0-1 -> exibir barra / texto (Alta / Moderada / Baixa).

## 8. Estrutura de Estado (Frontend)
```ts
interface PredictionState {
  current: PredictionSummary | null;
  history: PredictionSummary[]; // últimos N
  factors: RiskFactor[]; // já normalizados
  interventions: InterventionSuggestion[];
  loading: boolean;
  lastUpdated: number | null;
}
```
Fonte inicial: `PredictionMock`.

## 9. Interações Principais
- Tap no banner -> Dashboard
- Pull to refresh (Dashboard) -> recalcula mock (random jitter controlado)
- Tap em intervenção -> abre card expandido / marca concluído -> feedback haptic + animação check
- Tap em fator -> expande descrição + dica TCC (mock)

## 10. Performance & Fluidez
- Evitar setStates múltiplos em sequência; agregar updates.
- FlatList para fatores se > 6.
- useCallback / memo nos cartões.
- Animações: Animated / reanimated (futuro) — MVP: Animated API nativa.

## 11. Métricas (Instrumentação futura - stub)
- prediction_banner_view
- prediction_banner_cta_click
- prediction_dashboard_refresh
- intervention_start / intervention_complete
- cbt_analysis_view

## 12. Roteamento
Nova rota: `app/prediction-dashboard.tsx` -> exporta tela `PredictionDashboardScreen`.

## 13. Plano de Entrega
1. Scaffold módulo prediction + mocks
2. PredictionBanner integrado à Home (depois do MoodSelector)
3. Dashboard + estado + refresh
4. InterventionsCarousel
5. Detail Modal
6. Integração JournalEntry: placeholder botão "Analisar Pensamento" (abre modal com mocks)

## 14. Critérios de Aceite (MVP visual)
- Banner exibe estado dinâmico (3 níveis) e atualiza em refresh.
- Dashboard mostra pelo menos 3 fatores e 3 sugestões.
- Nenhum crash em rotate / background / return.
- Acessibilidade: labels nos botões principais + conteúdo legível fonte >= 14.

## 15. Próximos (fora do escopo imediato)
- Análises reais (API)
- Notificações push
- Personalização de intervenções
- Persistência local das execuções

---
End of Spec.
