# 🖼️ DIAGRAMA VISUAL DO BANCO DE DADOS
**PulseZen: Arquitetura BDC + Autenticação Biométrica**

---

## 🎨 DIAGRAMA PRINCIPAL

```mermaid
graph TB
    %% Estilo dos nós
    classDef userModule fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#000
    classDef authModule fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,color:#000
    classDef bdcModule fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px,color:#000
    classDef analyticsModule fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#000
    classDef contentModule fill:#fce4ec,stroke:#880e4f,stroke-width:2px,color:#000

    %% MÓDULO DE USUÁRIOS
    subgraph "👥 MÓDULO DE USUÁRIOS"
        U1[users<br/>📋 Dados básicos<br/>📧 Email/Telefone<br/>✅ Status]
        U2[user_profiles<br/>👤 Perfil pessoal<br/>🎂 Dados demográficos<br/>⚙️ Preferências]
        U3[user_context_data<br/>📊 Contexto dinâmico<br/>😊 Humor atual<br/>📍 Localização<br/>⏰ Padrões de uso]
    end

    %% MÓDULO DE AUTENTICAÇÃO
    subgraph "🔐 MÓDULO DE AUTENTICAÇÃO"
        A1[user_devices<br/>📱 Dispositivos registrados<br/>🔑 Device fingerprint<br/>✅ Status de confiança]
        A2[biometric_tokens<br/>👆 Tokens biométricos<br/>⏱️ Expiração<br/>📊 Uso]
        A3[user_sessions<br/>🎫 Sessões ativas<br/>⚡ Auth method<br/>📈 Atividade]
        A4[auth_logs<br/>📝 Log de autenticação<br/>🚨 Tentativas<br/>📊 Analytics]
        A5[device_trust_scores<br/>🛡️ Score de confiança<br/>📊 Fatores de risco<br/>⏰ Atualização automática]
    end

    %% MÓDULO BDC
    subgraph "🏗️ MÓDULO BDC (BACKEND DRIVEN COMPONENTS)"
        B1[bdc_layouts<br/>🎨 Templates de tela<br/>📋 Schema JSON<br/>🎯 Plataforma alvo]
        B2[bdc_components<br/>🧩 Componentes individuais<br/>⚙️ Props dinâmicas<br/>📐 Posicionamento]
        B3[component_conditions<br/>🔀 Regras de renderização<br/>📊 Contexto necessário<br/>🎯 Personalização]
        B4[layout_personalizations<br/>👤 Layouts personalizados<br/>🎨 Props customizadas<br/>📊 Efetividade]
        B5[ab_test_variants<br/>🧪 Testes A/B<br/>📊 Variantes<br/>🎯 Segmentação]
    end

    %% MÓDULO DE ANALYTICS
    subgraph "📊 MÓDULO DE ANALYTICS"
        AN1[component_interactions<br/>👆 Cliques e toques<br/>⏱️ Timestamp<br/>📊 Contexto]
        AN2[interaction_analytics<br/>📈 Métricas agregadas<br/>📊 Taxa de conversão<br/>🎯 Performance]
        AN3[session_analytics<br/>⏱️ Duração de sessão<br/>🗺️ Caminho de navegação<br/>📱 Engagement]
    end

    %% MÓDULO DE CONTEÚDO PULSEZEN
    subgraph "🧘 MÓDULO DE CONTEÚDO (PULSEZEN)"
        C1[mood_entries<br/>😊 Registros de humor<br/>📊 Intensidade<br/>📝 Notas]
        C2[meditation_sessions<br/>🧘 Sessões de meditação<br/>⏱️ Duração<br/>✅ Conclusão]
        C3[journal_entries<br/>📔 Diário pessoal<br/>📝 Reflexões<br/>🔒 Privacidade]
    end

    %% RELACIONAMENTOS PRINCIPAIS
    U1 --> U2
    U1 --> U3
    U1 --> A1
    U1 --> A3
    U1 --> A4
    U1 --> B4
    U1 --> C1
    U1 --> C2
    U1 --> C3

    A1 --> A2
    A1 --> A5
    A1 --> A3

    B1 --> B2
    B1 --> B4
    B1 --> B5
    B2 --> B3
    B2 --> AN1

    U3 --> B4
    A3 --> AN1
    AN1 --> AN2
    A3 --> AN3

    %% Aplicar estilos
    class U1,U2,U3 userModule
    class A1,A2,A3,A4,A5 authModule
    class B1,B2,B3,B4,B5 bdcModule
    class AN1,AN2,AN3 analyticsModule
    class C1,C2,C3 contentModule
```

---

## 🔄 FLUXO DE DADOS - AUTENTICAÇÃO BIOMÉTRICA

```mermaid
sequenceDiagram
    participant App as 📱 App Mobile
    participant API as 🌐 API Backend
    participant DB as 🗄️ Database
    participant Bio as 👆 Biometria

    Note over App,Bio: Fluxo de Login Biométrico

    App->>Bio: Solicitar autenticação
    Bio-->>App: Resultado biométrico
    
    App->>API: POST /auth/biometric-login<br/>{deviceId, biometricProof}
    
    API->>DB: Validar device<br/>SELECT * FROM user_devices
    DB-->>API: Device válido
    
    API->>DB: Verificar token biométrico<br/>SELECT * FROM biometric_tokens
    DB-->>API: Token válido
    
    API->>DB: Criar sessão<br/>INSERT INTO user_sessions
    DB-->>API: Sessão criada
    
    API->>DB: Log da autenticação<br/>INSERT INTO auth_logs
    
    API-->>App: {sessionToken, user, layouts}
    
    Note over App,API: App autenticado com layouts personalizados
```

---

## 🎨 FLUXO DE DADOS - BDC PERSONALIZAÇÃO

```mermaid
sequenceDiagram
    participant App as 📱 App Mobile
    participant API as 🌐 API Backend
    participant Engine as 🧠 Personalization Engine
    participant DB as 🗄️ Database

    Note over App,Engine: Geração de Layout Personalizado

    App->>API: GET /layouts/home<br/>Headers: {sessionToken}
    
    API->>DB: Buscar contexto do usuário<br/>SELECT * FROM user_context_data
    DB-->>API: Contexto atual
    
    API->>Engine: Processar personalização<br/>{userContext, layoutSchema}
    
    Engine->>DB: Buscar layout base<br/>SELECT * FROM bdc_layouts
    DB-->>Engine: Layout schema
    
    Engine->>DB: Buscar componentes<br/>SELECT * FROM bdc_components
    DB-->>Engine: Lista de componentes
    
    Engine->>Engine: Aplicar regras de personalização<br/>Avaliar condições<br/>Customizar props
    
    Engine-->>API: Layout personalizado
    
    API->>DB: Salvar personalização<br/>INSERT INTO layout_personalizations
    
    API-->>App: {layout, components, tracking}
    
    App->>App: Renderizar interface dinâmica
    
    Note over App,DB: Interface adaptada ao contexto do usuário
```

---

## 📊 FLUXO DE ANALYTICS

```mermaid
flowchart TD
    A[👆 Interação do Usuário] --> B[📝 Log da Interação]
    B --> C{Tipo de Evento}
    
    C -->|View| D[👀 Visualização]
    C -->|Click| E[🖱️ Clique/Toque]
    C -->|Form| F[📝 Formulário]
    
    D --> G[💾 Salvar em component_interactions]
    E --> G
    F --> G
    
    G --> H[⏰ Processamento Diário]
    H --> I[📊 Agregar Métricas]
    I --> J[💾 Salvar em interaction_analytics]
    
    J --> K[🧠 ML Engine]
    K --> L[🎯 Otimizar Personalização]
    L --> M[🔄 Atualizar Layouts]
    
    M --> N[📱 Melhor UX]
    
    style A fill:#e1f5fe
    style N fill:#c8e6c9
    style K fill:#fff3e0
```

---

## 🛡️ SEGURANÇA - CAMADAS DE PROTEÇÃO

```mermaid
graph LR
    subgraph "🔐 Camadas de Segurança"
        L1[Camada 1<br/>📱 Dispositivo<br/>Device ID<br/>Fingerprint]
        L2[Camada 2<br/>👆 Biometria<br/>Face ID<br/>Touch ID<br/>PIN Device]
        L3[Camada 3<br/>🎫 Token App<br/>JWT<br/>Refresh Token]
        L4[Camada 4<br/>🛡️ Trust Score<br/>Comportamento<br/>Localização]
    end
    
    L1 --> L2
    L2 --> L3
    L3 --> L4
    
    L4 --> ACCESS[✅ Acesso Liberado]
    
    style L1 fill:#ffebee
    style L2 fill:#f3e5f5
    style L3 fill:#e8f5e8
    style L4 fill:#e1f5fe
    style ACCESS fill:#c8e6c9
```

---

## 🎯 OTIMIZAÇÃO - ÍNDICES PRINCIPAIS

```mermaid
graph TB
    subgraph "⚡ Índices de Performance"
        I1[users<br/>📧 email<br/>📱 phone<br/>🆔 status]
        I2[user_sessions<br/>🎫 session_token<br/>⏰ expires_at<br/>👤 user_id]
        I3[component_interactions<br/>👤 user_id + created_at<br/>🧩 component_id<br/>📅 created_at]
        I4[bdc_layouts<br/>🔑 layout_key<br/>✅ is_active<br/>📱 target_platform]
        I5[user_context_data<br/>👤 user_id + context_type<br/>📅 collected_at<br/>⏰ expires_at]
    end
    
    I1 --> FAST1[⚡ Login Rápido]
    I2 --> FAST2[⚡ Validação de Sessão]
    I3 --> FAST3[⚡ Analytics Real-time]
    I4 --> FAST4[⚡ Layouts Dinâmicos]
    I5 --> FAST5[⚡ Personalização Instantânea]
    
    style FAST1 fill:#c8e6c9
    style FAST2 fill:#c8e6c9
    style FAST3 fill:#c8e6c9
    style FAST4 fill:#c8e6c9
    style FAST5 fill:#c8e6c9
```

---

## 🔄 CICLO DE VIDA - BDC COMPONENT

```mermaid
stateDiagram-v2
    [*] --> Created: Componente criado no backend
    Created --> Active: Ativado para uso
    Active --> Personalized: Personalização aplicada
    Personalized --> Rendered: Renderizado no app
    Rendered --> Interacted: Usuário interage
    Interacted --> Tracked: Interação registrada
    Tracked --> Analyzed: Analytics processados
    Analyzed --> Optimized: ML otimiza componente
    Optimized --> Personalized: Nova personalização
    Active --> Deprecated: Componente obsoleto
    Deprecated --> [*]: Removido do sistema
    
    note right of Personalized
        Baseado em:
        • Humor do usuário
        • Horário do dia
        • Padrões de uso
        • A/B tests
    end note
    
    note right of Tracked
        Métricas coletadas:
        • Views
        • Clicks/Taps
        • Tempo de interação
        • Conversões
    end note
```

---

Este sistema de banco de dados foi projetado para suportar:

### 🎯 **FUNCIONALIDADES PRINCIPAIS:**
- ✅ **Autenticação biométrica** sem senhas tradicionais
- ✅ **Layouts dinâmicos** controlados pelo servidor
- ✅ **Personalização contextual** baseada em dados do usuário
- ✅ **Analytics comportamentais** para otimização contínua
- ✅ **A/B testing** nativo para experimentação
- ✅ **Trust scoring** para segurança avançada

### 🚀 **BENEFÍCIOS DE PERFORMANCE:**
- 📊 **Índices otimizados** para queries frequentes
- 🔄 **Caching estratégico** com Redis/Memcached
- 📈 **Particionamento** para escala horizontal
- ⚡ **Row Level Security** para dados sensíveis

### 🔐 **SEGURANÇA ROBUSTA:**
- 🛡️ **Multi-layer authentication** com 4 camadas
- 📝 **Audit trails** completos
- 🔒 **Dados criptografados** em repouso
- 👤 **Isolamento de dados** por usuário

Esta modelagem garante que o PulseZen tenha uma base sólida para crescer e competir com os melhores apps do mercado! 🎯
