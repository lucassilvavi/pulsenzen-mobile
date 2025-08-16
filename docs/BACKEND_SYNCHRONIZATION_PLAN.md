# 🔄 BACKEND SYNCHRONIZATION PLAN

**Data:** 13 de Agosto de 2025  
**Objetivo:** Sincronizar backend com funcionalidades avançadas do frontend  
**Prioridade:** 🔥 CRÍTICA (Bloqueante para Crisis Prediction Engine)

---

## 📊 ANÁLISE DE INCOMPATIBILIDADES

### **MOOD MODULE** ⚠️ Parcialmente Compatível

#### ✅ **Já Funciona:**
- Campos principais: `moodLevel`, `period`, `date`, `timestamp`
- Arrays: `activities`, `emotions`, `notes`
- Relacionamentos e validações

#### ⚠️ **Diferenças de Nomenclatura:**
- **Frontend:** `mood: MoodLevel` → **Backend:** `moodLevel: MoodLevel`
- **Frontend:** `serverSynced: boolean` → **Backend:** Não existe

#### 🔧 **Solução para Mood:**
1. Manter backend como está (funciona)
2. Ajustar mapeamento no frontend service
3. Adicionar campo `synced_at` opcional para controle de sync

---

### **JOURNAL MODULE** ❌ Completamente Incompatível

#### 🚨 **Problemas Críticos:**
1. **Não existe migration** para `journal_entries`
2. **Model muito básico** - falta 70% dos campos do frontend
3. **Estrutura incompatível** com Crisis Prediction Engine

#### ⚙️ **Frontend Atual (Rich Structure):**
```typescript
interface JournalEntry {
  id: string;
  content: string;              // ✅ Existe no backend
  selectedPrompt?: JournalPrompt;  // ❌ Backend só tem 'prompts: any[]'
  promptCategory: string;       // ❌ Não existe no backend
  moodTags: MoodTag[];          // ❌ Backend só tem 'tags: string[]'
  createdAt: string;
  wordCount: number;            // ❌ Não existe no backend
  readingTimeMinutes?: number;  // ❌ Não existe no backend
  isFavorite?: boolean;         // ✅ Existe no backend
  sentimentScore?: number;      // ❌ Não existe no backend
  privacy: 'private' | 'shared' | 'anonymous'; // ❌ Não existe
  
  metadata?: {                  // ❌ Backend só tem 'metadata: any'
    deviceType?: string;
    timezone?: string;
    writingDuration?: number;
    revisionCount?: number;
  };
}
```

#### 🔧 **Backend Atual (Basic Structure):**
```typescript
class JournalEntry {
  id: string
  userId: string
  title: string               // ❌ Frontend não usa
  content: string            // ✅ Compatible
  mood: string | null        // ❌ Frontend usa MoodTag[]
  tags: string[] | null      // ❌ Frontend usa MoodTag[] estruturado
  prompts: any[] | null      // ❌ Frontend usa JournalPrompt objeto
  metadata: any | null       // ❌ Frontend tem estrutura específica
  isFavorite: boolean        // ✅ Compatible
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt: DateTime | null
}
```

---

## 🏗️ PLANO DE EXECUÇÃO

### **FASE 1: Journal Backend Upgrade** (2-3 horas)

#### **1.1 - Nova Migration Journal Entries** 
```sql
-- 1754999999999_upgrade_journal_entries_table.ts
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  
  -- Content fields
  content TEXT NOT NULL,
  word_count INTEGER DEFAULT 0,
  reading_time_minutes INTEGER DEFAULT 0,
  
  -- Prompt fields
  prompt_id VARCHAR(255) NULL,
  prompt_category VARCHAR(100) NOT NULL,
  custom_prompt TEXT NULL,
  
  -- Mood and emotional data
  mood_tags JSONB DEFAULT '[]'::jsonb,
  sentiment_score DECIMAL(3,2) NULL, -- -1.00 to 1.00
  
  -- User interaction
  is_favorite BOOLEAN DEFAULT FALSE,
  privacy_level VARCHAR(20) DEFAULT 'private', -- 'private', 'shared', 'anonymous'
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE NULL,
  
  -- Indexes
  CONSTRAINT valid_privacy CHECK (privacy_level IN ('private', 'shared', 'anonymous'))
);

CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_created_at ON journal_entries(created_at);
CREATE INDEX idx_journal_entries_prompt_category ON journal_entries(prompt_category);
CREATE INDEX idx_journal_entries_mood_tags ON journal_entries USING GIN(mood_tags);
CREATE INDEX idx_journal_entries_sentiment ON journal_entries(sentiment_score);
```

#### **1.2 - Atualizar Model JournalEntry**
```typescript
export default class JournalEntry extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare content: string

  @column()
  declare wordCount: number

  @column()
  declare readingTimeMinutes: number

  @column()
  declare promptId: string | null

  @column()
  declare promptCategory: string

  @column()
  declare customPrompt: string | null

  @column({
    prepare: (value: MoodTag[]) => JSON.stringify(value),
    consume: (value: string) => JSON.parse(value || '[]')
  })
  declare moodTags: MoodTag[]

  @column()
  declare sentimentScore: number | null

  @column()
  declare isFavorite: boolean

  @column()
  declare privacyLevel: 'private' | 'shared' | 'anonymous'

  @column({
    prepare: (value: any) => JSON.stringify(value),
    consume: (value: string) => JSON.parse(value || '{}')
  })
  declare metadata: any

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
```

#### **1.3 - Criar Types Unificados**
```typescript
// app/types/journal_types.ts
export interface MoodTag {
  id: string;
  label: string;
  emoji: string;
  category: 'positive' | 'negative' | 'neutral';
  intensity: 1 | 2 | 3 | 4 | 5;
  hexColor: string;
}

export interface JournalPrompt {
  id: string;
  question: string;
  category: string;
  icon: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  estimatedTime?: number;
  type?: 'standard' | 'guided' | 'creative' | 'therapeutic';
}

export interface JournalEntryRequest {
  content: string;
  promptId?: string;
  promptCategory: string;
  customPrompt?: string;
  moodTags: MoodTag[];
  privacyLevel?: 'private' | 'shared' | 'anonymous';
  metadata?: {
    deviceType?: string;
    timezone?: string;
    writingDuration?: number;
    revisionCount?: number;
  };
}
```

### **FASE 2: Mood Module Alignment** (30 min)

#### **2.1 - Atualizar Frontend Service Mapping**
```typescript
// modules/mood/services/MoodApiClient.ts
const mapBackendToFrontend = (backendEntry: any): MoodEntry => ({
  id: backendEntry.id,
  mood: backendEntry.mood_level,  // Map moodLevel → mood
  period: backendEntry.period,
  date: backendEntry.date,
  timestamp: backendEntry.timestamp,
  notes: backendEntry.notes,
  activities: backendEntry.activities || [],
  emotions: backendEntry.emotions || [],
  serverSynced: true  // Always true when from backend
});
```

#### **2.2 - Adicionar Campo Sync Opcional (Se necessário)**
```sql
-- Migration opcional para tracking de sync
ALTER TABLE mood_entries ADD COLUMN synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
```

### **FASE 3: Crisis Prediction Data Structure** (1 hora)

#### **3.1 - Migration para Predictions**
```sql
-- 1755000000000_create_predictions_table.ts
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  
  -- Prediction data
  risk_score DECIMAL(4,3) NOT NULL, -- 0.000 to 1.000
  risk_level VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
  confidence_score DECIMAL(4,3) NOT NULL,
  
  -- Analysis data
  factors JSONB NOT NULL DEFAULT '[]'::jsonb,
  interventions JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Metadata
  algorithm_version VARCHAR(10) NOT NULL DEFAULT '1.0',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_risk_level CHECK (risk_level IN ('low', 'medium', 'high', 'critical'))
);

CREATE INDEX idx_predictions_user_id ON predictions(user_id);
CREATE INDEX idx_predictions_created_at ON predictions(created_at);
CREATE INDEX idx_predictions_expires_at ON predictions(expires_at);
```

---

## ⚡ PRÓXIMOS PASSOS

### **Ordem de Execução:**
1. ✅ **Executar Fase 1** - Journal Backend Upgrade
2. ✅ **Executar Fase 2** - Mood Module Alignment  
3. ✅ **Executar Fase 3** - Predictions Infrastructure
4. ✅ **Testar compatibilidade** frontend ↔ backend
5. ✅ **Implementar Crisis Prediction Engine** com dados consistentes

### **Validação de Sucesso:**
- [ ] Frontend pode criar/ler journal entries com estrutura completa
- [ ] Mood entries sincronizam corretamente
- [ ] Crisis Prediction tem dados suficientes para análise
- [ ] Todos os testes passam

### **Tempo Estimado Total:** 4-5 horas

---

**📝 Nota:** Este plano garante que o backend tenha todos os dados necessários para implementar o Crisis Prediction Engine conforme especificado no TODO-list.
