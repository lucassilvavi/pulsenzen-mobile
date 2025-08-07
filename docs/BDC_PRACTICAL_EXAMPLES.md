# 🔧 EXEMPLOS PRÁTICOS BDC - PULSEZEN

## 📋 Visão Geral

Este documento complementa o plano de implementação com **exemplos concretos** de como a arquitetura BDC funcionaria no PulseZen.

---

## 🎯 EXEMPLO 1: TELA DE SESSÃO DE RESPIRAÇÃO

### **Cenário Current (App Atual)**
```tsx
// Componente estático atual
function BreathingSessionScreen() {
  const [technique, setTechnique] = useState(null);
  const [stats, setStats] = useState(null);
  
  // Lógica hardcoded no frontend
  useEffect(() => {
    loadTechnique();
    loadStats();
  }, []);
  
  return (
    <View>
      <Header title="Sessão de Respiração" />
      <TechniqueCard technique={technique} />
      <StatsSection stats={stats} />
      <Button onPress={startSession}>Iniciar</Button>
    </View>
  );
}
```

### **Cenário BDC (Futuro)**

#### **1. Request do Mobile**
```http
GET /api/v1/layout/breathing-session
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
X-User-Context: {"mood": "stressed", "experience": "beginner"}
```

#### **2. Response do Backend**
```json
{
  "meta": {
    "version": "1.2.0",
    "screenId": "breathing-session",
    "personalized": true,
    "generatedAt": "2025-08-07T14:30:00Z"
  },
  "layout": {
    "type": "screen",
    "backgroundColor": "#F0F9FF",
    "components": [
      {
        "id": "header",
        "type": "header",
        "props": {
          "title": "Momento de Calma",
          "subtitle": "Você parece tenso hoje. Que tal respirar?",
          "showBack": true,
          "backgroundColor": "#E0F2FE"
        }
      },
      {
        "id": "recommended-technique",
        "type": "technique-card",
        "props": {
          "techniqueId": "4-7-8",
          "title": "Respiração 4-7-8",
          "description": "Perfeita para reduzir ansiedade e estresse",
          "difficulty": "Iniciante",
          "duration": "5 min",
          "highlighted": true,
          "badgeText": "Recomendado para você"
        },
        "actions": {
          "onStart": {
            "type": "api_call",
            "endpoint": "/breathing/sessions",
            "method": "POST",
            "payload": {"techniqueId": "4-7-8"},
            "onSuccess": {
              "type": "navigation",
              "target": "breathing-active-session"
            }
          }
        }
      },
      {
        "id": "user-stats",
        "type": "stats-card",
        "props": {
          "title": "Seu Progresso",
          "stats": [
            {"label": "Sessões esta semana", "value": "3", "icon": "💪"},
            {"label": "Sequência atual", "value": "5 dias", "icon": "🔥"},
            {"label": "Meta semanal", "value": "75%", "icon": "🎯"}
          ]
        }
      },
      {
        "id": "other-techniques",
        "type": "technique-list",
        "props": {
          "title": "Outras Técnicas",
          "techniques": ["box-breathing", "coherent-breathing"]
        }
      }
    ]
  },
  "data": {
    "userStats": {
      "sessionsThisWeek": 3,
      "currentStreak": 5,
      "weeklyGoalProgress": 0.75
    },
    "techniques": [
      {
        "id": "4-7-8",
        "title": "Respiração 4-7-8",
        "description": "Perfeita para reduzir ansiedade e estresse",
        "difficulty": "Iniciante",
        "duration": "5 min",
        "category": "Relaxamento"
      }
    ],
    "recommendations": {
      "reason": "stress_detected",
      "confidence": 0.85
    }
  }
}
```

#### **3. Renderização no Mobile**
```tsx
// Componente genérico BDC
function BDCScreen({ screenId }: { screenId: string }) {
  const { layout, loading } = useBDCLayout(screenId);
  
  if (loading) return <Loading />;
  
  return <LayoutRenderer layout={layout} />;
}

// Uso simples
function BreathingSessionScreen() {
  return <BDCScreen screenId="breathing-session" />;
}
```

---

## 🎯 EXEMPLO 2: PERSONALIZAÇÃO POR PERFIL DE USUÁRIO

### **Usuário Iniciante**
```json
{
  "layout": {
    "components": [
      {
        "type": "welcome-card",
        "props": {
          "title": "Bem-vindo ao PulseZen! 👋",
          "description": "Vamos começar com técnicas simples",
          "showTutorial": true
        }
      },
      {
        "type": "technique-card",
        "props": {
          "techniqueId": "simple-breathing",
          "difficulty": "Muito Fácil",
          "showInstructions": true
        }
      }
    ]
  }
}
```

### **Usuário Avançado**
```json
{
  "layout": {
    "components": [
      {
        "type": "quick-stats",
        "props": {
          "compact": true,
          "showTrends": true
        }
      },
      {
        "type": "technique-grid",
        "props": {
          "techniques": ["pranayama", "wim-hof", "custom-1"],
          "showCustomization": true
        }
      },
      {
        "type": "achievement-banner",
        "props": {
          "achievement": "meditation_master",
          "unlocked": true
        }
      }
    ]
  }
}
```

---

## 🎯 EXEMPLO 3: A/B TESTING EM TEMPO REAL

### **Versão A: Layout Tradicional**
```json
{
  "meta": {
    "experiment": "button_color_test",
    "variant": "control"
  },
  "layout": {
    "components": [
      {
        "type": "button",
        "props": {
          "text": "Iniciar Sessão",
          "backgroundColor": "#007AFF",
          "size": "medium"
        }
      }
    ]
  }
}
```

### **Versão B: Layout Otimizado**
```json
{
  "meta": {
    "experiment": "button_color_test", 
    "variant": "treatment"
  },
  "layout": {
    "components": [
      {
        "type": "button",
        "props": {
          "text": "🧘‍♀️ Começar Agora",
          "backgroundColor": "#4CAF50",
          "size": "large",
          "gradient": true
        }
      }
    ]
  }
}
```

---

## 🎯 EXEMPLO 4: COMPONENTES CONDICIONAIS

### **Layout com Lógica Condicional**
```json
{
  "layout": {
    "components": [
      {
        "id": "premium-feature",
        "type": "premium-card",
        "conditions": [
          {"field": "user.isPremium", "operator": "eq", "value": true}
        ],
        "props": {
          "title": "Técnicas Avançadas",
          "features": ["Respiração Personalizada", "Analytics Detalhados"]
        }
      },
      {
        "id": "upgrade-prompt",
        "type": "upgrade-card", 
        "conditions": [
          {"field": "user.isPremium", "operator": "eq", "value": false},
          {"field": "user.sessionsCompleted", "operator": "gt", "value": 5}
        ],
        "props": {
          "title": "Desbloqueie Mais Técnicas",
          "description": "Você já dominou o básico!"
        }
      }
    ]
  }
}
```

---

## 🎯 EXEMPLO 5: FLUXO COMPLETO DE AÇÃO

### **1. Usuário Clica em "Iniciar Sessão"**
```json
{
  "action": {
    "type": "api_call",
    "endpoint": "/breathing/sessions",
    "method": "POST",
    "payload": {
      "techniqueId": "4-7-8",
      "duration": 300
    }
  }
}
```

### **2. Backend Processa e Responde**
```json
{
  "success": true,
  "data": {
    "sessionId": "sess_123456",
    "technique": {...},
    "startTime": "2025-08-07T14:35:00Z"
  },
  "nextAction": {
    "type": "navigation",
    "target": "breathing-active-session",
    "params": {"sessionId": "sess_123456"}
  }
}
```

### **3. Nova Tela é Carregada Automaticamente**
```http
GET /api/v1/layout/breathing-active-session?sessionId=sess_123456
```

---

## 🎯 EXEMPLO 6: MIGRAÇÃO GRADUAL

### **Estratégia de Coexistência**

```tsx
// App principal com roteamento híbrido
function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* Telas BDC */}
        <Stack.Screen 
          name="OnboardingBDC" 
          component={() => <BDCScreen screenId="onboarding" />} 
        />
        <Stack.Screen 
          name="BreathingBDC" 
          component={() => <BDCScreen screenId="breathing-session" />} 
        />
        
        {/* Telas antigas (legacy) */}
        <Stack.Screen name="Journal" component={JournalScreen} />
        <Stack.Screen name="Music" component={MusicScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### **Feature Flag para Transição**
```tsx
function BreathingEntry() {
  const { useBDC } = useFeatureFlags();
  
  if (useBDC) {
    return <BDCScreen screenId="breathing-session" />;
  }
  
  return <LegacyBreathingScreen />;
}
```

---

## 🎯 EXEMPLO 7: BACKEND LAYOUT BUILDER

### **Serviço de Construção de Layouts**

```typescript
class LayoutBuilder {
  async buildBreathingSession(userContext: UserContext): Promise<BDCLayout> {
    const user = userContext.user;
    const preferences = userContext.preferences;
    const moodContext = await this.getMoodContext(user.id);
    
    // Personalização baseada no humor atual
    const recommendedTechnique = await this.getRecommendedTechnique(
      user.experienceLevel,
      moodContext.currentMood,
      preferences.preferredDuration
    );
    
    // Construir layout dinâmico
    const layout: BDCLayout = {
      meta: {
        version: "1.0",
        screenId: "breathing-session",
        personalized: true
      },
      layout: {
        type: "screen",
        components: []
      },
      data: {}
    };
    
    // Adicionar header personalizado
    layout.layout.components.push(
      this.createHeader(user, moodContext)
    );
    
    // Adicionar técnica recomendada
    layout.layout.components.push(
      this.createTechniqueCard(recommendedTechnique, user)
    );
    
    // Adicionar stats se usuário ativo
    if (user.totalSessions > 0) {
      layout.layout.components.push(
        this.createStatsCard(await this.getUserStats(user.id))
      );
    }
    
    return layout;
  }
  
  private createHeader(user: User, moodContext: MoodContext) {
    const greeting = this.getPersonalizedGreeting(user, moodContext);
    
    return {
      id: "header",
      type: "header",
      props: {
        title: greeting.title,
        subtitle: greeting.subtitle,
        mood: moodContext.currentMood
      }
    };
  }
}
```

---

## 🎯 EXEMPLO 8: ANALYTICS E MÉTRICAS

### **Coleta Automática de Dados**
```json
{
  "event": "bdc_layout_rendered",
  "data": {
    "screenId": "breathing-session",
    "layoutVersion": "1.2.0",
    "personalizationApplied": true,
    "componentsCount": 4,
    "loadTime": 234,
    "userId": "user_123",
    "experiment": "button_color_test",
    "variant": "treatment"
  }
}

{
  "event": "bdc_component_interaction",
  "data": {
    "componentId": "recommended-technique",
    "componentType": "technique-card",
    "action": "onStart",
    "screenId": "breathing-session",
    "userId": "user_123"
  }
}
```

### **Dashboard de Performance**
```typescript
interface BDCMetrics {
  layouts: {
    totalRequests: number;
    averageLoadTime: number;
    cacheHitRate: number;
    errorRate: number;
  };
  components: {
    mostUsed: string[];
    interactionRate: Record<string, number>;
    errorComponents: string[];
  };
  experiments: {
    activeTests: number;
    conversions: Record<string, number>;
    significantResults: ExperimentResult[];
  };
  performance: {
    renderTime: number;
    memoryUsage: number;
    bundleSize: number;
  };
}
```

---

## 📊 COMPARAÇÃO: ANTES vs DEPOIS

### **Desenvolvimento de Nova Feature**

#### **ANTES (Método Atual)**
1. ✏️ Designer cria mockups
2. 👨‍💻 Dev implementa componentes
3. 🔧 Dev integra com APIs
4. 🧪 QA testa funcionalidade
5. 📱 Build do app
6. 🏪 Submissão para lojas
7. ⏰ Aguarda aprovação (1-7 dias)
8. 🚀 Deploy para usuários

**Total: 1-2 semanas + tempo de aprovação**

#### **DEPOIS (Com BDC)**
1. ✏️ Designer cria mockups
2. 👨‍💻 Dev cria template JSON
3. 🚀 Deploy instantâneo do layout
4. 🧪 A/B testing em produção
5. 📊 Métricas em tempo real
6. 🔄 Iterações imediatas

**Total: 1-2 dias**

### **Personalização por Usuário**

#### **ANTES**
- Feature flags limitadas
- Configurações estáticas
- Mesmo layout para todos

#### **DEPOIS**
- Layout único por usuário
- Personalização baseada em:
  - Histórico de uso
  - Humor atual
  - Preferências
  - Dados demográficos
  - Contexto temporal

---

## 🚧 DESAFIOS ESPECÍFICOS DO PULSEZEN

### **1. Integração com Dados Sensíveis**
```typescript
// Exemplo: Dados de humor influenciando layout
class MoodBasedPersonalization {
  async personalizeBreatheingSession(userId: string): Promise<Partial<BDCLayout>> {
    const recentMood = await MoodService.getLatestMood(userId);
    
    if (recentMood.level <= 3) {
      // Usuário com humor baixo -> técnicas calmantes
      return {
        components: [
          this.createCalmingTechniqueCard(),
          this.createMotivationalMessage(),
          this.createEmergencySOSButton()
        ]
      };
    }
    
    // Usuário com humor alto -> técnicas energizantes
    return {
      components: [
        this.createEnergizingTechniqueCard(),
        this.createGoalChallengeCard()
      ]
    };
  }
}
```

### **2. Offline First para Bem-estar Mental**
```typescript
// Cache crítico para funcionalidade offline
class BDCOfflineManager {
  async cacheEssentialLayouts(userId: string) {
    const essentialScreens = [
      'emergency-breathing',
      'sos-contacts',
      'mood-quick-check',
      'basic-breathing-techniques'
    ];
    
    for (const screenId of essentialScreens) {
      const layout = await BDCEngine.loadLayout(screenId, { userId });
      await this.storeOfflineLayout(screenId, layout);
    }
  }
}
```

### **3. Acessibilidade Dinâmica**
```json
{
  "component": {
    "type": "technique-card",
    "props": {
      "title": "Respiração 4-7-8"
    },
    "accessibility": {
      "label": "Técnica de respiração quatro-sete-oito para relaxamento",
      "hint": "Toque duas vezes para iniciar sessão guiada",
      "role": "button",
      "reducedMotion": true
    }
  }
}
```

---

## 🎯 ROI PROJETADO

### **Métricas de Sucesso Específicas**

#### **Desenvolvimento**
- ⚡ **50% menos tempo** para novas features de UI
- 🚀 **Deploy instantâneo** de mudanças visuais
- 🧪 **10x mais experimentos** A/B por mês

#### **Experiência do Usuário**
- 🎯 **+30% engajamento** com personalização
- 📱 **-20% abandono** nas sessões de respiração
- ⭐ **+0.5 pontos** na avaliação das lojas

#### **Negócio**
- 💰 **+25% conversão** para premium
- 📊 **Dados acionáveis** sobre comportamento
- 🏆 **Diferenciação competitiva** significativa

---

## � EXEMPLO 9: INTEGRAÇÃO COM AUTENTICAÇÃO BIOMÉTRICA

### **BDC + Biometria = UX Premium**

A combinação da arquitetura BDC com autenticação biométrica cria uma experiência única:

#### **1. Onboarding Dinâmico Baseado em Dispositivo**

```json
{
  "meta": {
    "screenId": "onboarding-auth-setup",
    "personalized": true,
    "deviceContext": {
      "biometricAvailable": true,
      "biometricTypes": ["fingerprint", "faceId"],
      "deviceSecurity": "high"
    }
  },
  "layout": {
    "components": [
      {
        "id": "biometric-hero",
        "type": "hero-card",
        "conditions": [
          {"field": "device.biometricAvailable", "operator": "eq", "value": true}
        ],
        "props": {
          "icon": "👆",
          "title": "Acesso Instantâneo",
          "description": "Use sua digital para entrar em segundos",
          "animation": "pulse"
        }
      },
      {
        "id": "fallback-hero", 
        "type": "hero-card",
        "conditions": [
          {"field": "device.biometricAvailable", "operator": "eq", "value": false}
        ],
        "props": {
          "icon": "📱",
          "title": "Acesso Seguro",
          "description": "Vamos criar seu acesso personalizado",
          "showAlternatives": true
        }
      }
    ]
  }
}
```

#### **2. Login Contextual**

```json
{
  "meta": {
    "screenId": "login",
    "context": {
      "lastLogin": "2025-08-06T10:30:00Z",
      "deviceTrusted": true,
      "userMood": "returning"
    }
  },
  "layout": {
    "components": [
      {
        "id": "welcome-back",
        "type": "personalized-greeting",
        "props": {
          "message": "Que bom te ver de volta! 😊",
          "lastActivity": "Sua última sessão foi ontem às 10h30",
          "mood": "welcoming"
        }
      },
      {
        "id": "biometric-login",
        "type": "biometric-button",
        "props": {
          "text": "Entrar com Digital",
          "icon": "👆",
          "prominent": true
        },
        "actions": {
          "onPress": {
            "type": "biometric_auth",
            "onSuccess": {
              "type": "api_call",
              "endpoint": "/auth/biometric-login",
              "method": "POST"
            }
          }
        }
      }
    ]
  }
}
```

#### **3. Personalização Baseada em Segurança**

```typescript
// Backend: Personalização baseada em nível de segurança
class SecurityBasedPersonalization {
  async personalizeLayout(userContext: UserContext): Promise<Partial<BDCLayout>> {
    const securityLevel = userContext.device.securityLevel;
    
    if (securityLevel === 'high') {
      // Dispositivo com biometria forte
      return {
        components: [
          this.createPremiumFeatureCard(),
          this.createSensitiveDataCard(),
          this.createAdvancedSettingsCard()
        ]
      };
    }
    
    if (securityLevel === 'medium') {
      // Dispositivo com PIN/padrão
      return {
        components: [
          this.createBasicFeatureCard(),
          this.createSecurityUpgradePrompt()
        ]
      };
    }
    
    // Dispositivo sem proteção
    return {
      components: [
        this.createSecurityWarningCard(),
        this.createLimitedFeaturesCard()
      ]
    };
  }
}
```

#### **4. Fluxo de Erro Inteligente**

```json
{
  "meta": {
    "screenId": "biometric-error",
    "errorContext": {
      "errorType": "biometric_failed",
      "attemptCount": 2,
      "fallbackAvailable": true
    }
  },
  "layout": {
    "components": [
      {
        "id": "error-message",
        "type": "friendly-error",
        "props": {
          "icon": "😔",
          "title": "Ops, não conseguimos te reconhecer",
          "message": "Que tal tentar novamente?",
          "tone": "supportive"
        }
      },
      {
        "id": "retry-button",
        "type": "button",
        "conditions": [
          {"field": "error.attemptCount", "operator": "lt", "value": 3}
        ],
        "props": {
          "text": "Tentar Novamente",
          "style": "primary"
        }
      },
      {
        "id": "fallback-options",
        "type": "fallback-list",
        "conditions": [
          {"field": "error.attemptCount", "operator": "gte", "value": 3}
        ],
        "props": {
          "title": "Outras formas de entrar:",
          "options": [
            {"text": "Usar PIN do dispositivo", "action": "device_pin"},
            {"text": "Receber código por SMS", "action": "sms_code"},
            {"text": "Entrar com email", "action": "email_login"}
          ]
        }
      }
    ]
  }
}
```

### **Benefícios da Integração BDC + Biometria:**

1. **🎯 Onboarding Inteligente**: Adapta-se às capacidades do dispositivo
2. **🔐 Segurança Contextual**: Diferentes níveis baseados na proteção
3. **📱 UX Nativa**: Usa recursos específicos de cada plataforma  
4. **🛡️ Fallbacks Elegantes**: Degrada graciosamente quando necessário
5. **📊 Analytics Avançados**: Métricas de sucesso/falha por tipo de auth

---

## �🎬 CONCLUSÃO

A arquitetura BDC transformará o PulseZen de um **app estático** para uma **plataforma dinâmica e personalizável**, posicionando-o na vanguarda da inovação em bem-estar mental digital.

**Combinada com autenticação biométrica estilo Nubank**, criará uma experiência de usuário **premium e diferenciada** no mercado de wellness.

**A implementação gradual é chave para o sucesso:** começar pequeno, validar constantemente, e escalar com confiança.

---

*Este documento fornece a base prática para iniciar a implementação BDC no PulseZen. Cada exemplo pode ser expandido conforme necessário durante o desenvolvimento.*
