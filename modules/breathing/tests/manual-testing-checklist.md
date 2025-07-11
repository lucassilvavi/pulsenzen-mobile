# Checklist de Testes Manuais - Módulo de Respiração

## 🧪 Instruções de Teste
Este documento contém testes manuais detalhados para validar 100% da funcionalidade do módulo de respiração.

**Como usar:**
1. Execute cada teste seguindo os passos exatos
2. Marque ✅ se passou ou ❌ se falhou
3. Anote observações em casos de falha
4. Documente bugs encontrados na seção final

---

## 📱 Testes de Interface e Navegação

### T001: Renderização da Tela Principal
**Objetivo**: Validar renderização correta da tela de respiração
**Passos**:
1. Abrir o app PulseZen
2. Navegar para seção de Respiração
3. Verificar se a tela carrega completamente

**Validações**:
- [ ] Tela carrega sem erros
- [ ] Header com título "Respiração" visível
- [ ] Botão de voltar funcional
- [ ] Gradient de fundo renderizado corretamente
- [ ] Seção introdutória visível
- [ ] 4 cards de técnicas visíveis
- [ ] Seção de benefícios visível
- [ ] Seção de dicas visível
- [ ] Scroll vertical funcional

**Status**: ⏳ Pendente | ✅ Passou | ❌ Falhou
**Observações**: _______________

---

### T002: Cards de Técnicas de Respiração
**Objetivo**: Validar apresentação e interação dos cards
**Passos**:
1. Na tela de respiração, examinar cada card de técnica
2. Verificar dados, ícones e layout
3. Testar toque em cada card

**Validações**:
**Respiração 4-7-8**:
- [ ] Ícone "wind" azul visível
- [ ] Título "Respiração 4-7-8" correto
- [ ] Duração "5 minutos • Relaxamento" visível
- [ ] Descrição completa e legível
- [ ] Toque navega para sessão

**Respiração Quadrada**:
- [ ] Ícone "square" verde visível
- [ ] Título "Respiração Quadrada" correto
- [ ] Duração "4 minutos • Foco" visível
- [ ] Descrição completa e legível
- [ ] Toque navega para sessão

**Respiração Profunda**:
- [ ] Ícone "lungs" laranja visível
- [ ] Título "Respiração Profunda" correto
- [ ] Duração "3 minutos • Calmante" visível
- [ ] Descrição completa e legível
- [ ] Toque navega para sessão

**Respiração Alternada**:
- [ ] Ícone "arrow.left.and.right" azul claro visível
- [ ] Título "Respiração Alternada" correto
- [ ] Duração "7 minutos • Equilíbrio" visível
- [ ] Descrição completa e legível
- [ ] Toque navega para sessão

**Status**: ⏳ Pendente | ✅ Passou | ❌ Falhou
**Observações**: _______________

---

## 🎯 Testes de Sessão de Respiração

### T003: Inicialização de Sessão 4-7-8
**Objetivo**: Validar início correto da sessão 4-7-8
**Passos**:
1. Selecionar técnica "Respiração 4-7-8"
2. Verificar tela de sessão
3. Pressionar "Iniciar Sessão"
4. Observar primeiros 30 segundos

**Validações**:
- [ ] Navegação para tela de sessão sem erros
- [ ] Título "Respiração 4-7-8" visível no header
- [ ] Descrição da técnica presente
- [ ] Botão de voltar funcional
- [ ] Círculo de respiração centralizado
- [ ] Estado inicial "Pronto para começar?" exibido
- [ ] Botão "Iniciar Sessão" visível e funcional
- [ ] Ao iniciar: texto muda para "Inspire"
- [ ] Timer de 4 segundos iniciado
- [ ] Círculo cresce gradualmente
- [ ] Feedback tátil leve no início

**Status**: ⏳ Pendente | ✅ Passou | ❌ Falhou
**Observações**: _______________

---

### T004: Fases da Respiração 4-7-8 (Ciclo Completo)
**Objetivo**: Validar sequência completa de fases da técnica 4-7-8
**Passos**:
1. Iniciar sessão 4-7-8
2. Cronometrar e acompanhar um ciclo completo
3. Validar cada transição de fase

**Validações**:
**Fase Inspire (4 segundos)**:
- [ ] Texto "Inspire" visível
- [ ] Timer contando 4→3→2→1
- [ ] Círculo crescendo suavemente
- [ ] Cor azul (#2196F3) no círculo
- [ ] Feedback tátil leve ao iniciar
- [ ] Duração real ≈ 4 segundos (±0.5s)

**Fase Segure (7 segundos)**:
- [ ] Transição automática após 4s
- [ ] Texto "Segure" visível
- [ ] Timer contando 7→6→5→4→3→2→1
- [ ] Círculo mantém tamanho
- [ ] Cor amarela (#FF9800) no círculo
- [ ] Sem feedback tátil
- [ ] Duração real ≈ 7 segundos (±0.5s)

**Fase Expire (8 segundos)**:
- [ ] Transição automática após 7s
- [ ] Texto "Expire" visível
- [ ] Timer contando 8→7→6→5→4→3→2→1
- [ ] Círculo diminuindo suavemente
- [ ] Cor verde (#4CAF50) no círculo
- [ ] Feedback tátil médio ao iniciar
- [ ] Duração real ≈ 8 segundos (±0.5s)

**Próximo Ciclo**:
- [ ] Transição automática para próximo ciclo
- [ ] Contador de ciclo atualizado
- [ ] Volta para fase "Inspire"

**Status**: ⏳ Pendente | ✅ Passou | ❌ Falhou
**Observações**: _______________

---

### T005: Sessão Completa 4-7-8 (4 Ciclos)
**Objetivo**: Validar sessão completa com todos os 4 ciclos
**Passos**:
1. Iniciar sessão 4-7-8
2. Aguardar conclusão completa sem intervenção
3. Verificar comportamento final

**Validações**:
- [ ] Progresso de ciclos: "Ciclo 1 de 4" → "Ciclo 2 de 4" → etc.
- [ ] Barra de progresso atualizada corretamente
- [ ] 4 ciclos executados completamente
- [ ] Após 4º ciclo: sessão para automaticamente
- [ ] Texto volta para "Pronto para começar?"
- [ ] Botão volta para "Iniciar Sessão"
- [ ] Animações resetadas
- [ ] Tempo total ≈ 4 × (4+7+8) = 76 segundos

**Status**: ⏳ Pendente | ✅ Passou | ❌ Falhou
**Observações**: _______________

---

### T006: Técnica Respiração Quadrada
**Objetivo**: Validar técnica de respiração quadrada (4-4-4-4)
**Passos**:
1. Selecionar "Respiração Quadrada"
2. Iniciar sessão
3. Observar 1 ciclo completo

**Validações**:
- [ ] Fase Inspire: 4 segundos, círculo cresce
- [ ] Fase Segure: 4 segundos, círculo estático
- [ ] Fase Expire: 4 segundos, círculo diminui
- [ ] Fase Segure: 4 segundos, círculo estático
- [ ] Transições suaves entre todas as fases
- [ ] Timers precisos em todas as fases
- [ ] Feedback tátil apropriado
- [ ] Total de 4 ciclos configurados

**Status**: ⏳ Pendente | ✅ Passou | ❌ Falhou
**Observações**: _______________

---

### T007: Controles de Parar Sessão
**Objetivo**: Validar funcionalidade de parar sessão
**Passos**:
1. Iniciar qualquer técnica
2. No meio de um ciclo, pressionar "Parar Sessão"
3. Verificar reset completo

**Validações**:
- [ ] Botão "Parar Sessão" visível durante execução
- [ ] Toque para imediatamente a sessão
- [ ] Timer zerado
- [ ] Texto volta para "Pronto para começar?"
- [ ] Círculo volta ao tamanho/posição inicial
- [ ] Animações paradas e resetadas
- [ ] Progresso de ciclos resetado
- [ ] Botão volta para "Iniciar Sessão"

**Status**: ⏳ Pendente | ✅ Passou | ❌ Falhou
**Observações**: _______________

---

## 🎨 Testes de Animações e Performance

### T008: Fluidez das Animações
**Objetivo**: Validar performance das animações visuais
**Passos**:
1. Iniciar qualquer técnica
2. Observar animações por 2-3 ciclos
3. Verificar fluidez e sincronização

**Validações**:
- [ ] Animação do círculo suave (60fps)
- [ ] Crescimento/diminuição sincronizado com timer
- [ ] Transições de cor suaves
- [ ] Barra de progresso circular sincronizada
- [ ] Sem travamentos ou pulos
- [ ] Animações responsivas em dispositivos diferentes
- [ ] Performance consistente durante sessão longa

**Status**: ⏳ Pendente | ✅ Passou | ❌ Falhou
**Observações**: _______________

---

### T009: Feedback Tátil (Haptic)
**Objetivo**: Validar feedback tátil em dispositivo físico
**Passos**:
1. Usar dispositivo físico (não simulador)
2. Iniciar sessão de respiração
3. Sentir vibrações durante fases

**Validações**:
- [ ] Vibração leve no início da fase "Inspire"
- [ ] Vibração média no início da fase "Expire"
- [ ] Sem vibração durante fase "Segure"
- [ ] Feedback consistente em todos os ciclos
- [ ] Intensidade apropriada (não muito forte/fraca)

**Status**: ⏳ Pendente | ✅ Passou | ❌ Falhou
**Observações**: _______________

---

## 🔧 Testes de Robustez e Edge Cases

### T010: Interrupção por Navegação
**Objetivo**: Validar comportamento ao sair da tela durante sessão
**Passos**:
1. Iniciar sessão de respiração
2. Pressionar botão voltar durante execução
3. Retornar à tela de sessão

**Validações**:
- [ ] Botão voltar para a sessão imediatamente
- [ ] Volta para tela principal de respiração
- [ ] Sem timers continuando em background
- [ ] Recursos limpos corretamente
- [ ] Possível iniciar nova sessão normalmente

**Status**: ⏳ Pendente | ✅ Passou | ❌ Falhou
**Observações**: _______________

---

### T011: Múltiplas Técnicas Consecutivas
**Objetivo**: Validar transição entre diferentes técnicas
**Passos**:
1. Completar sessão de "Respiração 4-7-8"
2. Voltar e selecionar "Respiração Quadrada"
3. Iniciar nova sessão
4. Repetir com outras técnicas

**Validações**:
- [ ] Transição entre técnicas sem erros
- [ ] Dados corretos carregados para cada técnica
- [ ] Timers e ciclos corretos para cada uma
- [ ] Sem interferência entre sessões
- [ ] Performance mantida

**Status**: ⏳ Pendente | ✅ Passou | ❌ Falhou
**Observações**: _______________

---

### T012: Orientação e Responsividade
**Objetivo**: Validar layout em diferentes orientações
**Passos**:
1. Iniciar sessão em orientação portrait
2. Rotacionar para landscape durante sessão
3. Rotacionar de volta para portrait

**Validações**:
- [ ] Layout adapta corretamente em landscape
- [ ] Círculo de respiração mantém proporção
- [ ] Textos e botões visíveis
- [ ] Sessão continua sem interrupção
- [ ] Animações não quebram na rotação

**Status**: ⏳ Pendente | ✅ Passou | ❌ Falhou
**Observações**: _______________

---

## 🛠️ Testes de Código e Arquitetura

### T013: Validação TypeScript
**Objetivo**: Verificar ausência de erros de tipagem
**Passos**:
1. Executar verificação TypeScript
2. Verificar warnings no código

**Comando**: `npx tsc --noEmit`

**Validações**:
- [ ] Nenhum erro de TypeScript
- [ ] Nenhum warning crítico
- [ ] Tipos consistentes entre módulos

**Status**: ⏳ Pendente | ✅ Passou | ❌ Falhou
**Observações**: _______________

---

### T014: Validação ESLint
**Objetivo**: Verificar qualidade do código
**Passos**:
1. Executar linter no módulo breathing

**Comando**: `npm run lint`

**Validações**:
- [ ] Nenhum erro de ESLint
- [ ] Nenhum warning crítico
- [ ] Código segue padrões do projeto

**Status**: ⏳ Pendente | ✅ Passou | ❌ Falhou
**Observações**: _______________

---

### T015: Limpeza de Recursos
**Objetivo**: Validar cleanup de timers e listeners
**Passos**:
1. Analisar código do hook useBreathingSession
2. Verificar cleanup de useEffect
3. Testar vazamentos de memória

**Validações**:
- [ ] clearInterval chamado corretamente
- [ ] useEffect com cleanup adequado
- [ ] Sem timers órfãos em background
- [ ] Animações paradas ao sair da tela

**Status**: ⏳ Pendente | ✅ Passou | ❌ Falhou
**Observações**: _______________

---

## 📊 Resumo dos Testes

### Estatísticas
- **Total de Testes**: 15
- **Testes Passou**: __ / 15
- **Testes Falhou**: __ / 15
- **Taxa de Sucesso**: ___%

### Funcionalidades Validadas
- [ ] Renderização de UI
- [ ] Navegação entre telas
- [ ] Execução de sessões
- [ ] Controle de fases e timers
- [ ] Animações e feedback
- [ ] Robustez e edge cases
- [ ] Qualidade de código

### Bugs Encontrados
1. **Bug #001**: ________________________________
   - **Severidade**: Crítico / Alto / Médio / Baixo
   - **Descrição**: ________________________________
   - **Passos para Reproduzir**: ___________________
   - **Status**: Aberto / Resolvido

2. **Bug #002**: ________________________________
   - **Severidade**: Crítico / Alto / Médio / Baixo
   - **Descrição**: ________________________________
   - **Passos para Reproduzir**: ___________________
   - **Status**: Aberto / Resolvido

### Recomendações
1. ________________________________________________
2. ________________________________________________
3. ________________________________________________

### Aprovação Final
- [ ] **Módulo de Respiração aprovado para produção**
- [ ] **Módulo de Respiração requer correções**

**Assinatura**: _____________________ **Data**: ____________
