# PulseZen – Plano de Testes
Atualizado: 2025-08-10
Escopo: Garantir estabilidade das features recém ajustadas (prediction, toast, modal, carousel) e estabelecer baseline para evolução.

## 1. Objetivos
- Validar correção funcional (scroll modal, animação do carousel, fila de toasts)
- Reforçar acessibilidade e responsividade a preferências do usuário (reduce motion)
- Prevenir regressões nos fluxos principais (Home, Prediction, Journal)
- Criar base para cobertura incremental (>60% linhas módulos novos)

## 2. Escopo
IN: Prediction (dashboard, modal, carousel), ToastContext, Journal Entry + CBT hook (básico), AuthService, UI genérica (banners), Acessibilidade (foco, labels, reduceMotion).
OUT (por enquanto): Integração real com backend prediction, analytics avançado, performance micro-otimizada.

## 3. Tipos de Teste
| Tipo | Ferramenta | Observações |
|------|------------|-------------|
| Unidade | Jest | Lógica pura (toast queue, hooks) |
| Componente | @testing-library/react-native | Interação UI (modal, carousel sem animação complexa) |
| Integração | Jest + mocks | Fluxo PredictionContext + Modal |
| Snapshot (controlado) | Jest | Dashboard após providers mockados |
| Cobertura | Jest --coverage | Monitorar evolução |

## 4. Matriz Funcional
| ID | Área | Caso | Resultado Esperado |
|----|------|------|--------------------|
| T1 | Toast | Enfileirar 2 toasts | Ordem FIFO exibida |
| T2 | Toast | Auto-dismiss timeout | Toast sai após ms configurado |
| T3 | Toast | Dismiss manual | onClose chamado, removido da fila |
| T4 | Toast | Tokens cores | Classes/estilos usam colors.toast.* |
| M1 | Modal | Abrir/Fechar | onClose invocado, desmonta |
| M2 | Modal | Scroll até Sugestões | Cards visíveis e acessíveis |
| M3 | Modal | Lista longa (>=10 fatores) | Scroll fluido sem warnings |
| C1 | Carousel | Render 1 item | Sem crash, centralizado |
| C2 | Carousel | Render n>=5 | Animação escala funcionando |
| C3 | Carousel | reduceMotion=true | Sem escala (transform=none) |
| C4 | Carousel | Acessibilidade | Cada card label descritivo |
| P1 | Prediction | refresh mock | Estado current/factors/interventions atualiza |
| P2 | Prediction | current null | UI fallback silencioso (sem erro) |
| A1 | A11y | Focus modal | Foco inicial lógico (título / container) |
| A2 | A11y | Toast announce | Mensagem anunciada (se implementado) |
| J1 | Journal | Criar entrada (mock) | Estado salvo + callback CBT (se aplicável) |
| S1 | Auth | Login sucesso mock | Retorna token/estado esperado |

## 5. Casos Detalhados (Exemplos)
### T1 – Fila de Toasts
Setup: Render provider, chamar addToast('A'), addToast('B').
Expect: Primeiro toast contém 'A'; após dismiss manual/timeout de 'A', 'B' aparece.

### M2 – Scroll Modal
Render modal com fatores + intervenções. fireEvent.scroll até final. Assert: getByText('Sugestões') visível + pelo menos 1 intervenção.

### C3 – reduceMotion
Mock hook para retornar true. Render carousel com 3 itens. Assert: Nenhum item tem transformação scale !=1.

## 6. Acessibilidade
- Verificar uso de accessibilityLabel nas intervenções
- Toast: usar (futuro) announcer (AccessibilityInfo.announceForAccessibility)
- Modal: foco inicial => focar container (testar via libraries ou assert estrutural)

## 7. Cobertura Alvo
| Módulo | Linha Base | Meta Inicial |
|--------|------------|--------------|
| ToastContext | ~0% | >=80% |
| Prediction (context + modal + carousel) | n/d | >=60% |
| Journal Entry + CBT Hook | n/d | >=50% |

## 8. Estratégia de Mocks
- Network: prediction ainda mock local (não intercepta fetch)
- Timeouts: jest.useFakeTimers() para toasts
- Animated: desabilitar animações complexas em testes (setImmediate / jest mocks)

## 9. Estrutura Sugerida de Arquivos
```
__tests__/
  ui/ToastContext.test.tsx
  prediction/PredictionDetailModal.scroll.test.tsx
  prediction/InterventionsCarousel.reduceMotion.test.tsx
  prediction/PredictionDashboardScreen.snapshot.test.tsx (re-enabled)
  services/AuthService.test.ts (já existe)
```

## 10. Scripts
- Teste normal: `npm test`
- Cobertura: `npm test -- --coverage`
- Atualizar snapshot conscientemente: `u` em modo watch / `npm test -- -u`

## 11. Riscos & Mitigações
| Risco | Mitigação |
|-------|-----------|
| Flakiness com timers | Usar fake timers + advanceTimers |
| Snapshot volátil | Mock de data/hora e providers determinísticos |
| Teste lento com animação | Mock Animated timing / no-op scale |

## 12. Critérios de Aceite Sprint
A. Testes Toast (T1-T3) implementados e passando.
B. Modal scroll test (M2) implementado.
C. Carousel reduceMotion test (C3) implementado.
D. Cobertura ToastContext ≥80% linhas.
E. Snapshot dashboard restaurado estável.

## 13. Próximos Passos Imediatos
1. Implementar util `renderWithProviders` (Prediction + Toast providers).
2. Criar testes Toast (fila, timeout, dismiss manual).
3. Criar teste scroll modal.
4. Criar teste reduceMotion carousel.
5. Reativar snapshot com mocks determinísticos.

---
Fim do documento.
