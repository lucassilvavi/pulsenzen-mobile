# Prediction Module

Camada de previsão de equilíbrio emocional (mock) usada no MVP.

## Componentes principais
- `services/PredictionDataSource.ts`: Interface para trocar fonte (mock -> API real).
- `services/PredictionMock.ts`: Implementação mock determinística suficiente para UX.
- `context/PredictionContext.tsx`: Orquestra estado, persistência (AsyncStorage + TTL 3h) e refresh.
- `components/PredictionBanner.tsx`: Resumo compacto exibido na Home.
- `components/PredictionDashboardScreen.tsx`: Visão detalhada (fatores, intervenções, onboarding, tooltips).
- `components/PredictionDetailModal.tsx`: Modal leve de detalhe.
- `components/InterventionsCarousel.tsx`: Lista horizontal com animação respeitando `reduceMotion`.
 - Tokens de categoria e intensidade: ver `colors.factorCategories` e `colors.riskIntensity` em `constants/theme.ts`.

## Eventos de Telemetria
Ver `services/Telemetry.ts` (placeholders):
- Ex: `prediction_risk_level_change`, `prediction_factor_expand`, `prediction_intervention_complete` etc.

## Swap para API real
1. Criar classe `PredictionApiService implements PredictionDataSource` com `fetchLatest` consumindo endpoint backend.
2. Injetar no provider (hoje `PredictionMockService` é usado diretamente) — refator: aceitar prop `dataSource` no `PredictionProvider`.
3. Mapear resposta da API para `PredictionDetail` (score 0-1, level derivado se backend não enviar label/level prontos).
4. Preservar persistência (chave `prediction_state_v1`). Invalidar TTL no momento do rollout se estrutura mudar (incrementar sufixo chave).

## Extensões futuras
- Histórico detalhado de fatores (trend) → novo endpoint.
- Intervenções acionáveis (navegar para exercício de respiração / journaling guiado) com tracking de conversão.
- Notificação de mudança de nível (toast) em tempo real ao receber push / novo cálculo.

## Testes
Testes:
- `PredictionMockService.test.ts` valida shape e ordenação de fatores.
- `levelChange.test.ts` valida lógica de mudança de nível.
- `CBTMockService.test.ts` valida heurísticas de detecção.


## Acessibilidade
- Cores semânticas via `getRiskPalette`.
- Reduce motion desativa escala do carousel.
- Tooltips acessíveis via long press e texto conciso.

