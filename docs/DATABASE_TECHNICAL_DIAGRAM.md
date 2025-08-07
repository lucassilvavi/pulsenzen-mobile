# 📊 DIAGRAMA TÉCNICO - ESTRUTURA DETALHADA DAS TABELAS
**Modelagem Completa: BDC + Autenticação Biométrica**

---

## 🗄️ DIAGRAMA ENTIDADE-RELACIONAMENTO DETALHADO

```mermaid
erDiagram
    %% ========================================
    %% MÓDULO DE USUÁRIOS E AUTENTICAÇÃO
    %% ========================================
    
    users {
        uuid id PK "Primary Key"
        varchar email UK "Email único"
        varchar phone UK "Telefone único"
        varchar cpf UK "CPF único (Brasil)"
        timestamp email_verified_at "Data verificação email"
        timestamp phone_verified_at "Data verificação telefone"
        enum status "pending_verification, active, suspended, deactivated"
        jsonb metadata "Dados extras flexíveis"
        timestamp created_at "Data criação"
        timestamp updated_at "Data atualização"
        timestamp deleted_at "Soft delete"
    }
    
    user_profiles {
        uuid id PK "Primary Key"
        uuid user_id FK "Referência para users"
        varchar first_name "Primeiro nome"
        varchar last_name "Sobrenome"
        date birth_date "Data nascimento"
        enum gender "male, female, other, prefer_not_to_say"
        varchar timezone "Timezone do usuário"
        varchar locale "Idioma preferido"
        jsonb preferences "Preferências do usuário"
        timestamp created_at "Data criação"
        timestamp updated_at "Data atualização"
    }
    
    user_devices {
        uuid id PK "Primary Key"
        uuid user_id FK "Referência para users"
        varchar device_id UK "ID único do dispositivo"
        text device_fingerprint "Hash características device"
        varchar device_name "Nome do dispositivo"
        enum platform "ios, android, web"
        varchar os_version "Versão do OS"
        varchar app_version "Versão do app"
        boolean is_primary "Dispositivo principal"
        boolean is_trusted "Dispositivo confiável"
        jsonb device_info "Info técnica do device"
        timestamp last_seen_at "Último acesso"
        timestamp created_at "Data registro"
        timestamp updated_at "Data atualização"
    }
    
    biometric_tokens {
        uuid id PK "Primary Key"
        uuid device_id FK "Referência device"
        varchar token_hash "Hash do token biométrico"
        enum biometric_type "fingerprint, face_id, iris, device_pin, pattern"
        timestamp expires_at "Data expiração"
        integer usage_count "Contador de uso"
        timestamp last_used_at "Último uso"
        timestamp created_at "Data criação"
    }
    
    device_trust_scores {
        uuid id PK "Primary Key"
        uuid device_id FK "Referência device"
        decimal trust_score "Score 0-1"
        jsonb trust_factors "Fatores calculados"
        timestamp calculated_at "Data cálculo"
        timestamp expires_at "Expira em 7 dias"
    }
    
    user_sessions {
        uuid id PK "Primary Key"
        uuid user_id FK "Referência users"
        uuid device_id FK "Referência device"
        varchar session_token UK "Token único da sessão"
        enum auth_method "biometric, device_pin, email_verification, phone_verification, manual_recovery"
        jsonb session_data "Dados da sessão"
        timestamp expires_at "Data expiração"
        timestamp last_activity_at "Última atividade"
        timestamp created_at "Data criação"
        timestamp ended_at "Data fim sessão"
    }
    
    auth_logs {
        uuid id PK "Primary Key"
        uuid user_id FK "Referência users"
        uuid device_id FK "Referência device"
        enum event_type "login_attempt, login_success, login_failure, logout, token_refresh"
        enum auth_method "Mesmo enum user_sessions"
        boolean success "Sucesso da operação"
        inet ip_address "IP do request"
        text user_agent "User agent browser/app"
        jsonb event_data "Dados específicos evento"
        timestamp created_at "Data do evento"
    }
    
    %% ========================================
    %% MÓDULO BDC (BACKEND DRIVEN COMPONENTS)
    %% ========================================
    
    bdc_layouts {
        uuid id PK "Primary Key"
        varchar layout_key UK "Chave única (home_screen, onboarding_flow)"
        varchar name "Nome descritivo"
        text description "Descrição do layout"
        enum target_platform "mobile, web, all"
        jsonb layout_schema "Schema JSON do layout"
        jsonb default_props "Props padrão"
        jsonb conditions "Condições renderização"
        boolean is_active "Layout ativo"
        integer version "Versão do layout"
        timestamp created_at "Data criação"
        timestamp updated_at "Data atualização"
    }
    
    bdc_components {
        uuid id PK "Primary Key"
        uuid layout_id FK "Referência layout"
        varchar component_id "ID único no layout"
        varchar component_type "button, card, list, form, etc"
        jsonb component_props "Props do componente"
        jsonb render_conditions "Condições renderização"
        jsonb tracking_config "Config de tracking"
        integer sort_order "Ordem renderização"
        boolean is_active "Componente ativo"
        timestamp created_at "Data criação"
        timestamp updated_at "Data atualização"
    }
    
    component_conditions {
        uuid id PK "Primary Key"
        uuid component_id FK "Referência componente"
        varchar condition_type "user_context, time_based, device_based, etc"
        varchar field_path "Caminho do campo (user.mood.current)"
        varchar operator "eq, neq, gt, lt, in, contains"
        jsonb expected_value "Valor esperado"
        jsonb fallback_config "Config fallback"
        boolean is_active "Condição ativa"
    }
    
    layout_personalizations {
        uuid id PK "Primary Key"
        uuid user_id FK "Referência users"
        uuid layout_id FK "Referência layout"
        jsonb personalized_props "Props personalizadas"
        jsonb context_data "Contexto usado"
        jsonb ab_test_data "Dados A/B test"
        decimal effectiveness_score "Score efetividade 0-1"
        timestamp created_at "Data criação"
        timestamp updated_at "Data atualização"
    }
    
    ab_test_variants {
        uuid id PK "Primary Key"
        uuid layout_id FK "Referência layout"
        varchar experiment_name "Nome experimento"
        varchar variant_name "Nome variante"
        jsonb variant_config "Config da variante"
        decimal traffic_percentage "% tráfego 0-100"
        jsonb target_criteria "Critérios segmentação"
        boolean is_active "Variante ativa"
        timestamp start_date "Data início"
        timestamp end_date "Data fim"
        timestamp created_at "Data criação"
    }
    
    %% ========================================
    %% MÓDULO DE CONTEXTO E PERSONALIZAÇÃO
    %% ========================================
    
    user_context_data {
        uuid id PK "Primary Key"
        uuid user_id FK "Referência users"
        enum context_type "mood, location, time_of_day, device_usage, app_usage, preferences, behavioral_pattern"
        jsonb context_value "Valor do contexto"
        jsonb metadata "Metadados extras"
        timestamp collected_at "Data coleta"
        timestamp expires_at "Data expiração (opcional)"
    }
    
    personalization_preferences {
        uuid id PK "Primary Key"
        uuid user_id FK "Referência users"
        varchar preference_key "Chave preferência"
        jsonb preference_value "Valor preferência"
        enum preference_type "ui, content, behavior, notification"
        timestamp created_at "Data criação"
        timestamp updated_at "Data atualização"
    }
    
    %% ========================================
    %% MÓDULO DE ANALYTICS E INTERAÇÕES
    %% ========================================
    
    component_interactions {
        uuid id PK "Primary Key"
        uuid user_id FK "Referência users"
        uuid component_id FK "Referência componente"
        uuid session_id FK "Referência sessão"
        enum interaction_type "view, click, tap, swipe, long_press, scroll, form_submit, error"
        jsonb interaction_data "Dados interação"
        jsonb context_snapshot "Snapshot contexto momento"
        timestamp created_at "Data interação"
    }
    
    interaction_analytics {
        uuid id PK "Primary Key"
        uuid component_id FK "Referência componente"
        date analytics_date "Data analytics"
        jsonb aggregated_metrics "Métricas agregadas"
        integer total_views "Total visualizações"
        integer total_interactions "Total interações"
        decimal conversion_rate "Taxa conversão 0-1"
        jsonb performance_data "Dados performance"
        timestamp created_at "Data criação"
    }
    
    session_analytics {
        uuid id PK "Primary Key"
        uuid session_id FK "Referência sessão"
        integer session_duration "Duração segundos"
        integer screens_visited "Telas visitadas"
        jsonb navigation_path "Caminho navegação"
        jsonb engagement_metrics "Métricas engagement"
        timestamp created_at "Data criação"
    }
    
    %% ========================================
    %% MÓDULO ESPECÍFICO PULSEZEN
    %% ========================================
    
    mood_entries {
        uuid id PK "Primary Key"
        uuid user_id FK "Referência users"
        enum mood_type "happy, sad, anxious, calm, energetic, tired, angry, peaceful, stressed, motivated"
        integer intensity "Intensidade 1-10"
        jsonb mood_factors "Fatores influência"
        text notes "Notas opcionais"
        timestamp created_at "Data registro"
    }
    
    meditation_sessions {
        uuid id PK "Primary Key"
        uuid user_id FK "Referência users"
        varchar session_type "Tipo sessão"
        integer duration_seconds "Duração segundos"
        boolean completed "Sessão completada"
        jsonb session_data "Dados sessão"
        timestamp started_at "Início sessão"
        timestamp ended_at "Fim sessão"
    }
    
    journal_entries {
        uuid id PK "Primary Key"
        uuid user_id FK "Referência users"
        varchar title "Título entrada"
        text content "Conteúdo"
        jsonb metadata "Metadados"
        boolean is_private "Entrada privada"
        timestamp created_at "Data criação"
        timestamp updated_at "Data atualização"
    }
    
    %% ========================================
    %% RELACIONAMENTOS
    %% ========================================
    
    %% Usuários e Perfis
    users ||--o{ user_profiles : "has profile"
    users ||--o{ user_devices : "owns devices"
    users ||--o{ user_sessions : "has sessions"
    users ||--o{ auth_logs : "generates logs"
    users ||--o{ user_context_data : "generates context"
    users ||--o{ personalization_preferences : "has preferences"
    
    %% Dispositivos e Segurança
    user_devices ||--o{ biometric_tokens : "stores tokens"
    user_devices ||--o{ device_trust_scores : "has trust score"
    user_devices ||--o{ user_sessions : "creates sessions"
    user_devices ||--o{ auth_logs : "logs events"
    
    %% BDC Core
    bdc_layouts ||--o{ bdc_components : "contains components"
    bdc_layouts ||--o{ layout_personalizations : "personalized for users"
    bdc_layouts ||--o{ ab_test_variants : "has variants"
    
    bdc_components ||--o{ component_conditions : "has conditions"
    bdc_components ||--o{ component_interactions : "tracks interactions"
    bdc_components ||--o{ interaction_analytics : "generates analytics"
    
    %% Personalização
    users ||--o{ layout_personalizations : "receives personalized layouts"
    user_context_data ||--o{ layout_personalizations : "influences personalization"
    
    %% Analytics e Interações
    user_sessions ||--o{ component_interactions : "session interactions"
    user_sessions ||--o{ session_analytics : "generates session analytics"
    component_interactions ||--o{ interaction_analytics : "aggregated in analytics"
    
    %% Conteúdo PulseZen
    users ||--o{ mood_entries : "creates mood entries"
    users ||--o{ meditation_sessions : "participates in sessions"
    users ||--o{ journal_entries : "writes journal entries"
```

---

## 🔑 CHAVES E ÍNDICES ESTRATÉGICOS

```mermaid
graph TB
    subgraph "🔍 ÍNDICES DE PERFORMANCE"
        subgraph "Autenticação (< 100ms)"
            IDX1["users: email, phone, status"]
            IDX2["user_sessions: session_token, expires_at"]
            IDX3["biometric_tokens: device_id, expires_at"]
        end
        
        subgraph "BDC Layouts (< 50ms)"
            IDX4["bdc_layouts: layout_key, is_active"]
            IDX5["bdc_components: layout_id, sort_order"]
            IDX6["layout_personalizations: user_id, layout_id"]
        end
        
        subgraph "Analytics (Batch Processing)"
            IDX7["component_interactions: user_id, created_at"]
            IDX8["component_interactions: component_id, created_at"]
            IDX9["interaction_analytics: analytics_date"]
        end
        
        subgraph "Contexto Usuario (< 200ms)"
            IDX10["user_context_data: user_id, context_type"]
            IDX11["user_context_data: collected_at, expires_at"]
        end
    end
    
    IDX1 --> PERF1["⚡ Login < 100ms"]
    IDX2 --> PERF1
    IDX3 --> PERF1
    
    IDX4 --> PERF2["⚡ Layout Load < 50ms"]
    IDX5 --> PERF2
    IDX6 --> PERF2
    
    IDX7 --> PERF3["📊 Analytics Batch"]
    IDX8 --> PERF3
    IDX9 --> PERF3
    
    IDX10 --> PERF4["🎯 Personalização < 200ms"]
    IDX11 --> PERF4
    
    style PERF1 fill:#c8e6c9
    style PERF2 fill:#c8e6c9
    style PERF3 fill:#fff3e0
    style PERF4 fill:#e1f5fe
```

---

## 📊 ESTRUTURA DE DADOS - EXEMPLOS JSON

### **1. Layout Schema (bdc_layouts.layout_schema)**

```json
{
  "version": "1.0",
  "screenId": "home_screen",
  "metadata": {
    "title": "Tela Principal",
    "refreshable": true,
    "cachePolicy": "network_first"
  },
  "components": [
    {
      "id": "greeting_card",
      "type": "greeting_card",
      "position": {"x": 0, "y": 0, "width": "100%", "height": "auto"},
      "props": {
        "greeting": "Olá, {{user.first_name}}!",
        "subtitle": "Como você está se sentindo hoje?",
        "mood_quick_actions": true
      },
      "conditions": [
        {
          "field": "user.mood.last_entry",
          "operator": "older_than",
          "value": "6_hours"
        }
      ]
    },
    {
      "id": "breathing_prompt",
      "type": "action_card",
      "position": {"x": 0, "y": 1, "width": "100%", "height": "auto"},
      "props": {
        "title": "Respiração Consciente",
        "description": "3 minutos para se reconectar",
        "action": {
          "type": "navigate",
          "target": "breathing_session",
          "params": {"duration": 180}
        },
        "style": "calm_blue"
      },
      "conditions": [
        {
          "field": "user.context.stress_level",
          "operator": "gte",
          "value": 6
        }
      ]
    }
  ]
}
```

### **2. User Context Data (user_context_data.context_value)**

```json
{
  "mood": {
    "current": "anxious",
    "intensity": 7,
    "factors": ["work_stress", "family_issues"],
    "timestamp": "2025-08-07T14:30:00Z"
  },
  "location": {
    "type": "home",
    "coordinates": {"lat": -23.5505, "lng": -46.6333},
    "timezone": "America/Sao_Paulo"
  },
  "device_usage": {
    "app_open_frequency": 3,
    "average_session_duration": 420,
    "preferred_features": ["meditation", "breathing", "journal"],
    "last_active": "2025-08-07T14:00:00Z"
  },
  "behavioral_pattern": {
    "peak_usage_times": ["07:00-09:00", "19:00-21:00"],
    "preferred_content": ["guided_meditation", "calm_music"],
    "engagement_score": 0.85
  }
}
```

### **3. Component Props Personalizados (layout_personalizations.personalized_props)**

```json
{
  "greeting_card": {
    "greeting": "Oi Lucas! 😊",
    "subtitle": "Vamos cuidar da sua ansiedade hoje?",
    "background_color": "#e3f2fd",
    "mood_quick_actions": [
      {"mood": "anxious", "icon": "😰", "color": "#ff9800"},
      {"mood": "calm", "icon": "😌", "color": "#4caf50"},
      {"mood": "motivated", "icon": "💪", "color": "#2196f3"}
    ]
  },
  "breathing_prompt": {
    "title": "Respiração para Ansiedade",
    "description": "Técnica 4-7-8 para acalmar a mente",
    "urgency_level": "high",
    "estimated_benefit": "Reduz ansiedade em 73% dos casos",
    "style": "urgent_calm"
  }
}
```

### **4. Analytics Agregados (interaction_analytics.aggregated_metrics)**

```json
{
  "daily_stats": {
    "total_views": 1247,
    "unique_users": 523,
    "total_interactions": 341,
    "conversion_rate": 0.274
  },
  "interaction_breakdown": {
    "view": 1247,
    "tap": 289,
    "long_press": 52,
    "swipe": 0
  },
  "performance_metrics": {
    "average_load_time": 0.087,
    "error_rate": 0.003,
    "engagement_duration": 12.4
  },
  "personalization_effectiveness": {
    "personalized_vs_default": {
      "conversion_lift": 0.342,
      "engagement_lift": 0.287
    },
    "context_factors": {
      "mood_based": 0.421,
      "time_based": 0.186,
      "usage_based": 0.393
    }
  }
}
```

---

## 🔒 POLÍTICAS DE SEGURANÇA (RLS)

```sql
-- Row Level Security para dados sensíveis
ALTER TABLE user_context_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Política: usuários só veem seus próprios dados
CREATE POLICY user_data_isolation ON user_context_data
    FOR ALL TO authenticated_users
    USING (user_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY mood_data_isolation ON mood_entries
    FOR ALL TO authenticated_users
    USING (user_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY journal_data_isolation ON journal_entries
    FOR ALL TO authenticated_users
    USING (user_id = current_setting('app.current_user_id')::UUID);
```

---

## 📈 QUERIES DE EXEMPLO OTIMIZADAS

### **1. Autenticação Biométrica (< 100ms)**

```sql
-- Validar sessão ativa com todos os dados necessários
SELECT 
    u.id,
    u.email,
    u.status,
    up.first_name,
    up.timezone,
    us.expires_at,
    ud.is_trusted,
    dts.trust_score
FROM user_sessions us
JOIN users u ON us.user_id = u.id
JOIN user_profiles up ON u.id = up.user_id
JOIN user_devices ud ON us.device_id = ud.id
LEFT JOIN device_trust_scores dts ON ud.id = dts.device_id
WHERE us.session_token = $1 
    AND us.expires_at > CURRENT_TIMESTAMP
    AND u.status = 'active';
```

### **2. Layout Personalizado (< 50ms)**

```sql
-- Buscar layout personalizado com componentes
WITH personalized_layout AS (
    SELECT 
        bl.*,
        lp.personalized_props,
        lp.context_data
    FROM bdc_layouts bl
    LEFT JOIN layout_personalizations lp ON bl.id = lp.layout_id 
        AND lp.user_id = $2
    WHERE bl.layout_key = $1 
        AND bl.is_active = true
)
SELECT 
    pl.*,
    json_agg(
        json_build_object(
            'id', bc.id,
            'component_id', bc.component_id,
            'component_type', bc.component_type,
            'component_props', bc.component_props,
            'render_conditions', bc.render_conditions,
            'sort_order', bc.sort_order
        ) ORDER BY bc.sort_order
    ) as components
FROM personalized_layout pl
JOIN bdc_components bc ON pl.id = bc.layout_id 
    AND bc.is_active = true
GROUP BY pl.id, pl.layout_key, pl.layout_schema, pl.personalized_props, pl.context_data;
```

---

Esta modelagem detalhada garante que o PulseZen tenha uma base de dados robusta, escalável e otimizada para performance, suportando tanto a arquitetura BDC quanto o sistema de autenticação biométrica estilo Nubank! 🚀
