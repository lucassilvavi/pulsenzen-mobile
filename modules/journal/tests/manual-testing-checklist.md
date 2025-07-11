# Checklist de Testes Manuais - Módulo de Diário

## 🧪 Instruções de Teste
Este documento contém testes manuais detalhados para validar 100% da funcionalidade do módulo de diário.

**Como usar:**
1. Execute cada teste seguindo os passos exatos
2. Marque ✅ se passou ou ❌ se falhou
3. Anote observações em casos de falha
4. Documente bugs encontrados na seção final

---

## 📱 Testes de Interface e Navegação

### T001: Renderização da Tela Principal do Diário
**Objetivo**: Validar renderização correta da tela principal
**Passos**:
1. Abrir o app PulseZen
2. Navegar para seção de Diário
3. Verificar se a tela carrega completamente

**Validações**:
- [ ] Tela carrega sem erros
- [ ] Header com título "Diário" visível
- [ ] Botão de voltar funcional
- [ ] Gradient de fundo renderizado corretamente
- [ ] Barra de busca visível e funcional
- [ ] Botão "+" para nova entrada visível
- [ ] Card de estatísticas presente
- [ ] Lista de entradas renderizada
- [ ] Seção de dicas visível
- [ ] Scroll vertical funcional

**Status**: ⏳ Pendente | ✅ Passou | ❌ Falhou
**Observações**: _______________

---

### T002: Estatísticas do Diário
**Objetivo**: Validar exibição e cálculo das estatísticas
**Passos**:
1. Na tela principal do diário, examinar o card de estatísticas
2. Verificar dados apresentados
3. Comparar com entradas visíveis

**Validações**:
- [ ] Card de estatísticas visível
- [ ] "Entradas" - número correto exibido
- [ ] "Dias" - contagem de dias únicos
- [ ] "Positivas" - percentual calculado
- [ ] Layout responsivo do card
- [ ] Valores atualizados em tempo real

**Status**: ⏳ Pendente | ✅ Passou | ❌ Falhou
**Observações**: _______________

---

### T003: Lista de Entradas
**Objetivo**: Validar apresentação da lista de entradas
**Passos**:
1. Verificar entradas existentes na lista
2. Examinar layout e informações de cada card
3. Testar interação com as entradas

**Validações**:
- [ ] Lista de entradas visível
- [ ] Cards de entrada bem formatados
- [ ] Data exibida corretamente (dd/MMM/yy)
- [ ] Título/categoria da entrada visível
- [ ] Preview do texto presente
- [ ] Tags de humor exibidas
- [ ] Ícones de humor corretos
- [ ] Toque em entrada funcional
- [ ] Ordenação por data (mais recente primeiro)

**Status**: ⏳ Pendente | ✅ Passou | ❌ Falhou
**Observações**: _______________

---

## ✍️ Testes de Criação de Entradas

### T004: Navegação para Nova Entrada
**Objetivo**: Validar navegação para tela de criação
**Passos**:
1. Na tela principal, pressionar botão "+"
2. Verificar transição para tela de entrada
3. Examinar layout inicial

**Validações**:
- [ ] Botão "+" claramente visível
- [ ] Toque navega para tela de entrada
- [ ] Transição suave
- [ ] Tela de entrada carrega corretamente
- [ ] Header com "Nova Entrada" ou similar
- [ ] Botão de voltar funcional

**Status**: ⏳ Pendente | ✅ Passou | ❌ Falhou
**Observações**: _______________

---

### T005: Seleção de Prompts Pré-definidos
**Objetivo**: Validar seleção de prompts para reflexão
**Passos**:
1. Na tela de nova entrada, examinar prompts disponíveis
2. Selecionar diferentes prompts
3. Verificar feedback visual

**Validações**:
**Prompts Disponíveis**:
- [ ] "Pelo que você é grato hoje?" (Gratidão 🙏)
- [ ] "Como você está se sentindo agora e por quê?" (Emoções 💭)
- [ ] "Qual foi sua maior conquista hoje?" (Conquistas 🏆)
- [ ] "Que desafio você enfrentou?" (Desafios 💪)
- [ ] "O que você aprendeu sobre si mesmo?" (Aprendizado 📚)
- [ ] "Como foram suas interações?" (Relacionamentos 👥)
- [ ] "O que você espera do amanhã?" (Futuro 🌅)
- [ ] "O que mudaria no seu dia?" (Reflexão 🤔)

**Funcionalidade**:
- [ ] Todos os prompts visíveis
- [ ] Ícones/emojis corretos
- [ ] Toque seleciona prompt
- [ ] Feedback visual da seleção
- [ ] Prompt selecionado destacado
- [ ] Layout em grid responsivo

**Status**: ⏳ Pendente | ✅ Passou | ❌ Falhou
**Observações**: _______________

---

### T006: Prompt Personalizado
**Objetivo**: Validar criação de prompt personalizado
**Passos**:
1. Pressionar "Criar pergunta personalizada"
2. Inserir prompt customizado
3. Confirmar seleção
4. Verificar uso do prompt

**Validações**:
- [ ] Botão "Criar pergunta personalizada" visível
- [ ] Toque abre modal/campo de entrada
- [ ] Campo de texto para prompt funcional
- [ ] Limite de caracteres apropriado
- [ ] Botão confirmar ativo após inserir texto
- [ ] Prompt personalizado aparece selecionado
- [ ] Possível voltar aos prompts pré-definidos

**Status**: ⏳ Pendente | ✅ Passou | ❌ Falhou
**Observações**: _______________

---

### T007: Escrita da Entrada
**Objetivo**: Validar campo de texto da entrada
**Passos**:
1. Com prompt selecionado, focar no campo de texto
2. Escrever entrada de teste
3. Verificar funcionalidades do editor

**Validações**:
- [ ] Campo de texto focável
- [ ] Placeholder apropriado
- [ ] Texto digitado aparece corretamente
- [ ] Quebras de linha funcionam
- [ ] Scroll vertical quando necessário
- [ ] Contador de palavras (se presente)
- [ ] Auto-capitalização funcional
- [ ] Corretor ortográfico ativo
- [ ] Performance adequada com texto longo

**Status**: ⏳ Pendente | ✅ Passou | ❌ Falhou
**Observações**: _______________

---

### T008: Seleção de Tags de Humor
**Objetivo**: Validar seleção múltipla de tags de humor
**Passos**:
1. Na tela de entrada, localizar seção de humor
2. Selecionar múltiplas tags
3. Verificar comportamento da seleção

**Validações**:
**Tags Disponíveis**:
- [ ] 😊 Feliz
- [ ] 😢 Triste
- [ ] 😠 Irritado
- [ ] 😰 Ansioso
- [ ] 😌 Calmo
- [ ] 🤗 Grato
- [ ] 💪 Motivado
- [ ] 😴 Cansado
- [ ] 🤔 Pensativo
- [ ] ❤️ Amoroso

**Funcionalidade**:
- [ ] Todas as tags visíveis
- [ ] Emojis renderizados corretamente
- [ ] Seleção múltipla funcional
- [ ] Feedback visual da seleção
- [ ] Possível desselecionar tags
- [ ] Layout responsivo das tags

**Status**: ⏳ Pendente | ✅ Passou | ❌ Falhou
**Observações**: _______________

---

## 💾 Testes de Salvamento e Persistência

### T009: Salvamento de Entrada Completa
**Objetivo**: Validar salvamento de entrada com todos os dados
**Passos**:
1. Criar entrada completa (prompt + texto + tags)
2. Pressionar salvar
3. Verificar confirmação e retorno à lista

**Validações**:
- [ ] Botão salvar claramente visível
- [ ] Salvamento processa corretamente
- [ ] Feedback visual durante salvamento (loading)
- [ ] Confirmação de sucesso exibida
- [ ] Opções pós-salvamento (nova entrada/voltar)
- [ ] Entrada aparece na lista principal
- [ ] Dados salvos corretamente
- [ ] Contador de estatísticas atualizado

**Status**: ⏳ Pendente | ✅ Passou | ❌ Falhou
**Observações**: _______________

---

### T010: Rascunho Automático
**Objetivo**: Validar salvamento automático de rascunhos
**Passos**:
1. Iniciar nova entrada
2. Escrever texto parcial
3. Sair da tela sem salvar
4. Retornar à tela de entrada
5. Verificar recuperação do rascunho

**Validações**:
- [ ] Texto parcial é salvo automaticamente
- [ ] Prompt selecionado é preservado
- [ ] Tags de humor são mantidas
- [ ] Rascunho recuperado ao retornar
- [ ] Possível continuar de onde parou
- [ ] Rascunho é limpo após salvamento final

**Status**: ⏳ Pendente | ✅ Passou | ❌ Falhou
**Observações**: _______________

---

### T011: Validações de Entrada
**Objetivo**: Validar regras de negócio para entradas
**Passos**:
1. Tentar salvar entrada vazia
2. Testar entrada muito longa
3. Verificar mensagens de erro

**Validações**:
- [ ] Entrada vazia gera erro apropriado
- [ ] Mensagem de erro clara
- [ ] Entrada muito longa é limitada ou alertada
- [ ] Campos obrigatórios indicados
- [ ] Validações em tempo real
- [ ] Botão salvar desabilitado quando inválido

**Status**: ⏳ Pendente | ✅ Passou | ❌ Falhou
**Observações**: _______________

---

## 👁️ Testes de Visualização

### T012: Visualização de Entrada Existente
**Objetivo**: Validar modal de visualização de entradas
**Passos**:
1. Na lista principal, tocar em uma entrada
2. Verificar abertura do modal
3. Examinar dados exibidos
4. Testar fechamento

**Validações**:
- [ ] Modal abre suavemente
- [ ] Entrada exibida corretamente
- [ ] Prompt/pergunta visível
- [ ] Texto completo presente
- [ ] Tags de humor exibidas
- [ ] Data formatada corretamente
- [ ] Categoria da entrada visível
- [ ] Botão fechar funcional
- [ ] Possível fechar tocando fora do modal
- [ ] Modal responsivo

**Status**: ⏳ Pendente | ✅ Passou | ❌ Falhou
**Observações**: _______________

---

## 🔍 Testes de Busca e Filtros

### T013: Busca por Texto
**Objetivo**: Validar funcionalidade de busca
**Passos**:
1. Na tela principal, usar barra de busca
2. Digitar diferentes termos
3. Verificar filtros em tempo real

**Validações**:
- [ ] Barra de busca funcional
- [ ] Busca em tempo real (sem botão)
- [ ] Resultados filtrados corretamente
- [ ] Busca no texto das entradas
- [ ] Busca nas categorias
- [ ] Busca nas tags de humor
- [ ] Texto de busca destacado nos resultados
- [ ] Limpar busca restaura lista completa

**Status**: ⏳ Pendente | ✅ Passou | ❌ Falhou
**Observações**: _______________

---

## 📊 Testes de Performance e UX

### T014: Performance com Múltiplas Entradas
**Objetivo**: Validar performance com dados extensos
**Passos**:
1. Criar várias entradas (>10)
2. Verificar carregamento da lista
3. Testar scroll e busca

**Validações**:
- [ ] Lista carrega rapidamente
- [ ] Scroll suave mesmo com muitas entradas
- [ ] Busca responsiva com muitos dados
- [ ] Uso de memória adequado
- [ ] Sem travamentos ou lentidão

**Status**: ⏳ Pendente | ✅ Passou | ❌ Falhou
**Observações**: _______________

---

### T015: Feedback Tátil e Visual
**Objetivo**: Validar feedback do usuário
**Passos**:
1. Testar haptic feedback em ações importantes
2. Verificar estados de loading
3. Confirmar mensagens de sucesso/erro

**Validações**:
- [ ] Haptic feedback ao salvar entrada
- [ ] Loading state durante salvamento
- [ ] Loading state durante carregamento
- [ ] Mensagens de sucesso claras
- [ ] Mensagens de erro informativas
- [ ] Feedback visual para seleções
- [ ] Estados desabilitados quando aplicável

**Status**: ⏳ Pendente | ✅ Passou | ❌ Falhou
**Observações**: _______________

---

## 🔧 Testes de Robustez

### T016: Interrupções e Edge Cases
**Objetivo**: Validar comportamento em cenários extremos
**Passos**:
1. Interromper app durante salvamento
2. Testar com conectividade limitada
3. Verificar recuperação de erros

**Validações**:
- [ ] App recupera graciosamente de interrupções
- [ ] Dados não são perdidos em crashes
- [ ] Funciona offline (dados locais)
- [ ] Tratamento adequado de erros
- [ ] Estados de erro recuperáveis

**Status**: ⏳ Pendente | ✅ Passou | ❌ Falhou
**Observações**: _______________

---

## 📋 Resumo dos Testes

### Estatísticas
- **Total de Testes**: 16
- **Testes Passou**: __ / 16
- **Testes Falhou**: __ / 16
- **Taxa de Sucesso**: ___%

### Funcionalidades Validadas
- [ ] Interface e navegação
- [ ] Criação de entradas
- [ ] Seleção de prompts
- [ ] Salvamento e persistência
- [ ] Visualização de dados
- [ ] Busca e filtros
- [ ] Performance e UX
- [ ] Robustez

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

### Melhorias Sugeridas
1. ________________________________________________
2. ________________________________________________
3. ________________________________________________

### Aprovação Final
- [ ] **Módulo de Diário aprovado para produção**
- [ ] **Módulo de Diário requer correções**

**Assinatura**: _____________________ **Data**: ____________
