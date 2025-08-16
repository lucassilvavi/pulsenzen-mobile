# 🧭 **GUIA COMPLETO DE NAVEGAÇÃO - TESTE DE TODAS AS TELAS**

**Data**: 13 de Agosto de 2025  
**Objetivo**: Guia passo-a-passo para testar todas as telas do app PulseZen  
**Status**: Todas as telas mapeadas e rotas documentadas

---

## 🚀 **ANTES DE COMEÇAR**

### **Preparação do Ambiente**
1. ✅ Certifique-se que o app está rodando (`npx expo start`)
2. ✅ Tenha o simulador iOS/Android ou device físico conectado
3. ✅ Se necessário, limpe dados do app para testar do zero

### **Estado Inicial**
- **Primeiro acesso**: App começa no onboarding
- **Usuário logado**: App vai direto para a tela principal
- **Debug**: Algumas telas podem ter estados de debug ativados

---

## 📱 **FLUXO COMPLETO DE TESTE**

### **🎯 FASE 1: ONBOARDING (Primeira Experiência)**

#### **1.1 Tela Welcome** 
- **Rota**: `/onboarding/welcome`
- **Como acessar**: Primeira vez no app ou logout
- **O que testar**:
  - ✅ Layout de boas-vindas
  - ✅ Botão "Começar" ou similar
  - ✅ Animações de entrada
  - ✅ Navegação para próxima tela

#### **1.2 Tela Auth (Login/Registro)**
- **Rota**: `/onboarding/auth`
- **Como acessar**: Automaticamente após welcome
- **O que testar**:
  - ✅ Formulário de login
  - ✅ Formulário de registro
  - ✅ Validação de campos
  - ✅ Autenticação funcional
  - ✅ Feedback de erros

#### **1.3 Tela Benefits**
- **Rota**: `/onboarding/benefits`
- **Como acessar**: Após fazer login/registro
- **O que testar**:
  - ✅ Lista de benefícios do app
  - ✅ Explicações das funcionalidades
  - ✅ Botão "Continuar"

#### **1.4 Tela Features**
- **Rota**: `/onboarding/features`
- **Como acessar**: Após benefits (se configurado)
- **O que testar**:
  - ✅ Demonstração das features
  - ✅ Navegação entre features
  - ✅ Call-to-action

#### **1.5 Tela Setup**
- **Rota**: `/onboarding/setup`
- **Como acessar**: Após features ou benefits
- **O que testar**:
  - ✅ Configurações iniciais do usuário
  - ✅ Personalização de preferências
  - ✅ Finalização do onboarding

---

### **🏠 FASE 2: TELA PRINCIPAL (Dashboard)**

#### **2.1 Home Screen**
- **Rota**: `/` (index.tsx)
- **Como acessar**: Automaticamente após onboarding completo
- **O que testar**:
  - ✅ **Header Section**: Nome do usuário e saudação
  - ✅ **Mood Selector**: Seletor de humor do dia
  - ✅ **Prediction Banner**: Banner do Crisis Prediction Engine™
  - ✅ **Quick Access**: 4 cartões de acesso rápido:
    - 🫁 **Respiração** → leva para `/breathing`
    - 💙 **Emoções** → leva para `/prediction-dashboard`
    - 📝 **Diário** → leva para `/journal`
    - 🆘 **SOS** → leva para `/sos`
  - ✅ **Streak Section**: Estatísticas de uso
  - ✅ **Recommended Section**: Recomendações personalizadas

---

### **🫁 FASE 3: MÓDULO BREATHING (Respiração)**

#### **3.1 Tela Breathing**
- **Rota**: `/breathing`
- **Como acessar**: 
  - Quick Access → "Respiração"
  - Navegação direta
- **O que testar**:
  - ✅ Lista de técnicas de respiração
  - ✅ Seleção de técnica
  - ✅ Configurações de duração
  - ✅ Botão "Iniciar sessão"

#### **3.2 Tela Breathing Session**
- **Rota**: `/breathing-session`
- **Como acessar**: Após selecionar técnica e clicar "Iniciar"
- **O que testar**:
  - ✅ Interface de respiração guiada
  - ✅ Animações de respiração
  - ✅ Cronômetro/contador
  - ✅ Controles de pause/resume
  - ✅ Finalização da sessão

---

### **📝 FASE 4: MÓDULO JOURNAL (Diário)**

#### **4.1 Tela Journal (Lista)**
- **Rota**: `/journal`
- **Como acessar**: 
  - Quick Access → "Diário"
  - Navegação direta
- **O que testar**:
  - ✅ Lista de entradas do diário
  - ✅ Botão "Nova entrada"
  - ✅ Busca/filtros
  - ✅ Navegação para entrada específica
  - ✅ Botão para analytics

#### **4.2 Tela Journal Entry (Nova/Editar)**
- **Rota**: `/journal-entry`
- **Como acessar**: 
  - Journal → "Nova entrada"
  - Journal → Clique em entrada existente
- **O que testar**:
  - ✅ Editor de texto
  - ✅ Seleção de prompt (se disponível)
  - ✅ Categorias/tags
  - ✅ Salvar/cancelar
  - ✅ Validações

#### **4.3 Tela Journal Analytics**
- **Rota**: `/journal-analytics`
- **Como acessar**: 
  - Journal → Botão Analytics
  - **⚠️ NOTA**: Esta rota não está registrada no _layout.tsx
- **O que testar**:
  - ✅ Estatísticas de journaling
  - ✅ Gráficos de humor
  - ✅ Análise de sentimentos
  - ✅ Insights de escrita

---

### **💙 FASE 5: MÓDULO PREDICTION (Crisis Prediction Engine™)**

#### **5.1 Tela Prediction Dashboard**
- **Rota**: `/prediction-dashboard`
- **Como acessar**: 
  - Quick Access → "Emoções"
  - Prediction Banner → Clique
- **O que testar**:
  - ✅ Dashboard do Crisis Prediction Engine™
  - ✅ Nível de risco atual
  - ✅ Fatores de risco identificados
  - ✅ Intervenções recomendadas
  - ✅ Histórico de predições
  - ✅ Botão "Atualizar análise"

---

### **🆘 FASE 6: MÓDULO SOS (Emergência)**

#### **6.1 Tela SOS**
- **Rota**: `/sos`
- **Como acessar**: 
  - Quick Access → "SOS"
  - Navegação direta
- **O que testar**:
  - ✅ Lista de estratégias de coping
  - ✅ Técnicas de emergência (5-4-3-2-1, respiração quadrada)
  - ✅ Contatos de emergência
  - ✅ Início de sessão de coping
  - ✅ Botões de ação rápida

---

### **👤 FASE 7: MÓDULO PROFILE (Perfil)**

#### **7.1 Tela Profile**
- **Rota**: `/profile`
- **Como acessar**: 
  - Navegação direta (pode precisar adicionar acesso)
- **O que testar**:
  - ✅ Informações do usuário
  - ✅ Estatísticas de uso
  - ✅ Conquistas/achievements
  - ✅ Configurações
  - ✅ Logout

---

## 🔧 **PROBLEMAS POTENCIAIS E SOLUÇÕES**

### **❌ Telas não aparecem:**

#### **1. Journal Analytics não funciona**
```typescript
// PROBLEMA: Rota não registrada no _layout.tsx
// SOLUÇÃO: Adicionar no Stack.Screen
<Stack.Screen name="journal-analytics" options={{ headerShown: false }} />
```

#### **2. Navegação não funciona nos Quick Access**
```typescript
// VERIFICAR: Se as rotas no QuickAccess.tsx estão corretas
// ROTAS ATUAIS:
- '/breathing' ✅
- '/prediction-dashboard' ✅ 
- '/journal' ✅
- '/sos' ✅
```

#### **3. Tela Profile sem acesso**
```typescript
// PROBLEMA: Não há botão de acesso ao profile na UI
// SOLUÇÃO: Adicionar ícone de profile no header ou menu
```

### **🛠️ Como debugar navegação:**
1. **Verificar logs no console**: Routes sendo chamadas
2. **Verificar _layout.tsx**: Se a rota está registrada
3. **Verificar useNavigationLogic**: Se está bloqueando navegação
4. **Verificar autenticação**: Se usuário está logado

---

## 🎯 **ROTEIRO DE TESTE COMPLETO**

### **📋 Checklist Essencial**

#### **✅ Fluxo Inicial (Primeiro Uso)**
1. [ ] Abrir app → Welcome screen
2. [ ] Welcome → Auth screen  
3. [ ] Fazer login/registro → Benefits screen
4. [ ] Benefits → Setup screen (se disponível)
5. [ ] Setup → Home screen

#### **✅ Navegação Principal (Usuário Logado)**
1. [ ] Home screen carrega corretamente
2. [ ] Mood Selector funciona
3. [ ] Prediction Banner navega para dashboard
4. [ ] Quick Access: Respiração funciona
5. [ ] Quick Access: Emoções funciona
6. [ ] Quick Access: Diário funciona
7. [ ] Quick Access: SOS funciona

#### **✅ Funcionalidades Específicas**
1. [ ] Breathing: Técnicas + Sessão completa
2. [ ] Journal: Lista + Nova entrada + (Analytics)
3. [ ] Prediction: Dashboard + Análise
4. [ ] SOS: Estratégias + Sessão
5. [ ] Profile: Dados + Configurações

#### **✅ Teste de Persistência**
1. [ ] Fechar e reabrir app → Mantém login
2. [ ] Dados de journal salvos
3. [ ] Mood responses salvos
4. [ ] Configurações mantidas

---

## 🚨 **AÇÕES IMEDIATAS NECESSÁRIAS**

### **1. Registrar rota Analytics**
```typescript
// Adicionar em app/_layout.tsx:
<Stack.Screen name="journal-analytics" options={{ headerShown: false }} />
```

### **2. Adicionar acesso ao Profile**
```typescript
// Opção 1: Botão no header
// Opção 2: Menu lateral
// Opção 3: Adicionar aos Quick Access
```

### **3. Verificar todas as rotas**
```bash
# Executar para verificar rotas quebradas:
npx expo start --clear
```

---

**🎯 OBJETIVO**: Após seguir este roteiro, você deve conseguir navegar por todas as 15+ telas do app e validar que todas as funcionalidades estão operacionais!
