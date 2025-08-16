# 📋 TODO-LIST DETALHADO - JOURNAL MODULE IMPROVEMENTS

## 🚨 PRIORIDADE CRÍTICA (SPRINT 1 - Semana 1)

### 🔧 **1. Fix Type System & Data Flow**
**Deadline:** 2 dias  
**Impacto:** Alto - Fundamental para estabilidade

#### **1.1 Refactor Types para Consistência**
```typescript
// 📁 modules/journal/types/index.ts
// ❌ REMOVER tipos inconsistentes
// ✅ CRIAR tipos alinhados com backend

export interface JournalEntry {
  id: string;
  content: string;              // ✅ Renamed from 'text'
  selectedPrompt?: JournalPrompt;  // ✅ Object instead of string
  promptCategory: string;
  moodTags: MoodTag[];          // ✅ Structured objects
  createdAt: string;            // ✅ ISO string format
  updatedAt?: string;
  wordCount: number;
  readingTimeMinutes?: number;
  isFavorite?: boolean;
  sentimentScore?: number;      // ✅ For analytics
  privacy: 'private' | 'shared' | 'anonymous';
  metadata?: {
    deviceType?: string;
    timezone?: string;
    writingDuration?: number;   // em segundos
    revisionCount?: number;
  };
}

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
  estimatedTime?: number;       // minutos
  isPersonalized?: boolean;
}
```

#### **1.2 Create Service Provider Pattern**
```typescript
// 📁 modules/journal/services/JournalServiceProvider.ts
export class JournalServiceProvider {
  private static instance: JournalApiService | JournalService;
  
  static getInstance(): JournalApiService | JournalService {
    if (!this.instance) {
      // Escolher serviço baseado no ambiente
      if (__DEV__ && !process.env.EXPO_PUBLIC_USE_REAL_API) {
        this.instance = new JournalService();
      } else {
        this.instance = new JournalApiService();
      }
    }
    return this.instance;
  }
  
  // Wrapper methods para transparência
  static async getEntries(): Promise<JournalEntry[]> {
    return await this.getInstance().getEntries();
  }
  
  static async createEntry(entry: Partial<JournalEntry>): Promise<JournalEntry> {
    return await this.getInstance().createEntry(entry);
  }
  
  // ... outros métodos
}
```

#### **1.3 Update All Imports**
```typescript
// ❌ SUBSTITUIR em todos os arquivos:
import { JournalService } from '../services/JournalService';

// ✅ POR:
import { JournalServiceProvider } from '../services/JournalServiceProvider';

// ❌ SUBSTITUIR chamadas:
await JournalService.getEntries()

// ✅ POR:
await JournalServiceProvider.getEntries()
```

#### **Tasks:**
- [ ] Refactor `/types/index.ts` com novos tipos
- [ ] Criar `JournalServiceProvider.ts`
- [ ] Update `JournalApiService.ts` mapping functions
- [ ] Update all components to use new types
- [ ] Update all service calls to use provider
- [ ] Run type check: `npx tsc --noEmit`
- [ ] Test all screens funcionando

---

### 🏗️ **2. Implement Centralized State Management**
**Deadline:** 3 dias  
**Impacto:** Alto - Melhora performance e maintainability

#### **2.1 Setup Zustand Store**
```typescript
// 📁 modules/journal/store/journalStore.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface JournalState {
  // Data State
  entries: JournalEntry[];
  prompts: JournalPrompt[];
  stats: JournalStats;
  
  // UI State
  ui: {
    loading: boolean;
    searchQuery: string;
    selectedEntry: JournalEntry | null;
    showPromptSelector: boolean;
    currentView: 'list' | 'analytics' | 'create';
    error: string | null;
  };
  
  // Filters
  filters: {
    category?: string;
    moodTags?: string[];
    dateRange?: { start: string; end: string };
  };
  
  // Actions
  loadEntries: () => Promise<void>;
  createEntry: (entry: Partial<JournalEntry>) => Promise<JournalEntry>;
  updateEntry: (id: string, updates: Partial<JournalEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  
  // Search & Filter
  searchEntries: (query: string) => void;
  setFilters: (filters: Partial<JournalState['filters']>) => void;
  clearFilters: () => void;
  
  // UI Actions
  setSelectedEntry: (entry: JournalEntry | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  togglePromptSelector: () => void;
  setCurrentView: (view: JournalState['ui']['currentView']) => void;
  
  // Cache Management
  invalidateCache: () => void;
  refreshData: () => Promise<void>;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      // Initial State
      entries: [],
      prompts: [],
      stats: { totalEntries: 0, uniqueDays: 0, percentPositive: 0 },
      ui: {
        loading: false,
        searchQuery: '',
        selectedEntry: null,
        showPromptSelector: false,
        currentView: 'list',
        error: null,
      },
      filters: {},
      
      // Actions Implementation
      loadEntries: async () => {
        set(state => ({ ui: { ...state.ui, loading: true, error: null } }));
        try {
          const entries = await JournalServiceProvider.getEntries();
          const stats = JournalStatsService.calculateStats(entries);
          set({ entries, stats, ui: { ...get().ui, loading: false } });
        } catch (error) {
          set(state => ({ 
            ui: { 
              ...state.ui, 
              loading: false, 
              error: 'Erro ao carregar entradas' 
            } 
          }));
        }
      },
      
      createEntry: async (entryData) => {
        set(state => ({ ui: { ...state.ui, loading: true } }));
        try {
          const newEntry = await JournalServiceProvider.createEntry(entryData);
          set(state => ({
            entries: [newEntry, ...state.entries],
            ui: { ...state.ui, loading: false }
          }));
          
          // Recalculate stats
          const stats = JournalStatsService.calculateStats(get().entries);
          set({ stats });
          
          return newEntry;
        } catch (error) {
          set(state => ({ 
            ui: { ...state.ui, loading: false, error: 'Erro ao salvar entrada' } 
          }));
          throw error;
        }
      },
      
      searchEntries: (query) => {
        set(state => ({
          ui: { ...state.ui, searchQuery: query }
        }));
      },
      
      // ... outras implementações
    }),
    {
      name: 'journal-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        entries: state.entries,
        prompts: state.prompts,
        filters: state.filters 
      }),
    }
  )
);

// Computed selectors
export const useFilteredEntries = () => {
  return useJournalStore(state => {
    let filtered = state.entries;
    
    // Apply search
    if (state.ui.searchQuery) {
      const query = state.ui.searchQuery.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.content.toLowerCase().includes(query) ||
        entry.promptCategory.toLowerCase().includes(query)
      );
    }
    
    // Apply filters
    if (state.filters.category) {
      filtered = filtered.filter(entry => 
        entry.promptCategory === state.filters.category
      );
    }
    
    if (state.filters.moodTags?.length) {
      filtered = filtered.filter(entry =>
        entry.moodTags.some(tag => 
          state.filters.moodTags?.includes(tag.id)
        )
      );
    }
    
    return filtered;
  });
};
```

#### **2.2 Update Components to Use Store**
```tsx
// 📁 modules/journal/pages/JournalScreen.tsx
// ❌ REMOVER todo useState local
// ✅ USAR store

export default function JournalScreen() {
  // ✅ Use store
  const { entries, stats, ui, loadEntries } = useJournalStore();
  const filteredEntries = useFilteredEntries();
  
  // ❌ REMOVER:
  // const [entries, setEntries] = useState<JournalEntry[]>([]);
  // const [stats, setStats] = useState({ ... });
  
  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries])
  );
  
  // ✅ Use store data directly
  return (
    <View>
      {ui.loading && <LoadingSpinner />}
      {ui.error && <ErrorBanner message={ui.error} />}
      {/* resto do component */}
    </View>
  );
}
```

#### **Tasks:**
- [ ] Install zustand: `npm install zustand`
- [ ] Create `journalStore.ts` with full implementation
- [ ] Create computed selectors
- [ ] Update `JournalScreen.tsx` to use store
- [ ] Update `JournalEntryScreen.tsx` to use store  
- [ ] Update `JournalAnalyticsScreen.tsx` to use store
- [ ] Remove all local useState related to journal data
- [ ] Test state persistence across app restarts

---

### 🔄 **3. Fix Navigation Flow**
**Deadline:** 1 dia  
**Impacto:** Médio - UX improvement

#### **3.1 Fix Route Parameters**
```typescript
// 📁 modules/journal/types/navigation.ts
export interface JournalNavigationParams {
  'journal': undefined;
  'journal-entry': {
    entryId?: string;
    mode?: 'create' | 'edit' | 'view';
    promptId?: string;
    tutorial?: boolean;
  };
  'journal-analytics': undefined;
}
```

#### **3.2 Update JournalEntryScreen**
```tsx
// 📁 modules/journal/pages/JournalEntryScreen.tsx
export default function JournalEntryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    entryId?: string;
    mode?: 'create' | 'edit' | 'view';
    promptId?: string;
    tutorial?: string;
  }>();
  
  const { 
    selectedEntry, 
    setSelectedEntry, 
    loadEntryById, 
    ui 
  } = useJournalStore();
  
  const [mode, setMode] = useState<'create' | 'edit' | 'view'>(
    params.mode || 'create'
  );
  
  useEffect(() => {
    if (params.entryId && params.entryId !== 'new') {
      loadEntryById(params.entryId);
      setMode(params.mode || 'view');
    } else {
      setSelectedEntry(null);
      setMode('create');
    }
  }, [params.entryId, params.mode]);
  
  // ✅ Handle tutorial mode
  const showTutorial = params.tutorial === 'true';
  
  return (
    <View>
      {showTutorial && <TutorialOverlay />}
      {/* resto do component */}
    </View>
  );
}
```

#### **Tasks:**
- [ ] Create navigation types
- [ ] Fix `JournalEntryScreen.tsx` parameter handling
- [ ] Update all navigation calls with proper params
- [ ] Test navigation between screens
- [ ] Test deep linking functionality

---

## ⚠️ PRIORIDADE ALTA (SPRINT 2 - Semana 2)

### 🎨 **4. UI/UX Improvements**
**Deadline:** 5 dias  
**Impacto:** Alto - User experience

#### **4.1 Redesign Empty States**
```tsx
// 📁 modules/journal/components/EmptyState.tsx
import LottieView from 'lottie-react-native';

interface EmptyStateProps {
  type: 'no-entries' | 'no-search-results' | 'first-time';
  onAction?: () => void;
}

export const JournalEmptyState: React.FC<EmptyStateProps> = ({ type, onAction }) => {
  const config = {
    'no-entries': {
      animation: require('@/assets/animations/empty-journal.json'),
      title: 'Sua jornada de autoconhecimento começa aqui',
      subtitle: 'Escrever pode ajudar a processar emoções e acompanhar seu crescimento pessoal.',
      buttonText: 'Escrever primeira entrada',
      benefits: [
        { icon: '🧠', title: 'Clareza Mental', desc: 'Organize seus pensamentos' },
        { icon: '💚', title: 'Bem-estar', desc: 'Processe suas emoções' },
        { icon: '📈', title: 'Progresso', desc: 'Acompanhe sua evolução' }
      ]
    },
    'no-search-results': {
      animation: require('@/assets/animations/search-empty.json'),
      title: 'Nenhuma entrada encontrada',
      subtitle: 'Tente ajustar sua busca ou criar uma nova entrada.',
      buttonText: 'Limpar filtros',
      benefits: []
    },
    'first-time': {
      animation: require('@/assets/animations/welcome.json'),
      title: 'Bem-vindo ao seu diário pessoal!',
      subtitle: 'Vamos começar sua jornada de autoconhecimento juntos.',
      buttonText: 'Fazer tour guiado',
      benefits: []
    }
  }[type];

  return (
    <View style={styles.container}>
      <LottieView
        source={config.animation}
        autoPlay
        loop
        style={styles.animation}
      />
      
      <ThemedText style={styles.title}>
        {config.title}
      </ThemedText>
      
      <ThemedText style={styles.subtitle}>
        {config.subtitle}
      </ThemedText>
      
      {config.benefits.length > 0 && (
        <View style={styles.benefitsContainer}>
          {config.benefits.map((benefit, index) => (
            <BenefitCard key={index} {...benefit} />
          ))}
        </View>
      )}
      
      <Button
        label={config.buttonText}
        onPress={onAction}
        style={styles.actionButton}
        leftIcon="✨"
        variant="primary"
      />
    </View>
  );
};

const BenefitCard: React.FC<{
  icon: string;
  title: string;
  desc: string;
}> = ({ icon, title, desc }) => (
  <View style={styles.benefitCard}>
    <Text style={styles.benefitIcon}>{icon}</Text>
    <View style={styles.benefitContent}>
      <ThemedText style={styles.benefitTitle}>{title}</ThemedText>
      <ThemedText style={styles.benefitDesc}>{desc}</ThemedText>
    </View>
  </View>
);
```

#### **4.2 Implement Tutorial System**
```tsx
// 📁 modules/journal/components/TutorialSystem.tsx
import { TourGuideProvider, TourGuideZone, useTourGuideController } from 'rn-tourguide';

interface TutorialStep {
  zone: string;
  title: string;
  text: string;
  shape?: 'circle' | 'rectangle';
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const JOURNAL_TUTORIAL_STEPS: TutorialStep[] = [
  {
    zone: 'quick-actions',
    title: 'Ações Rápidas',
    text: 'Escolha uma das opções para começar a escrever rapidamente.',
    shape: 'rectangle',
    position: 'bottom'
  },
  {
    zone: 'prompt-selector',
    title: 'Prompts de Reflexão',
    text: 'Prompts são perguntas que ajudam a guiar sua reflexão. Escolha um ou crie o seu próprio.',
    shape: 'rectangle',
    position: 'bottom'
  },
  {
    zone: 'mood-tags',
    title: 'Tags de Humor',
    text: 'Selecione como você está se sentindo. Isso ajuda a acompanhar padrões emocionais ao longo do tempo.',
    shape: 'rectangle',
    position: 'top'
  },
  {
    zone: 'text-editor',
    title: 'Área de Escrita',
    text: 'Escreva livremente seus pensamentos. Não se preocupe com gramática - foque em expressar-se.',
    shape: 'rectangle',
    position: 'top'
  },
  {
    zone: 'save-button',
    title: 'Salvar Entrada',
    text: 'Suas entradas são salvas automaticamente, mas você pode salvar manualmente aqui.',
    shape: 'circle',
    position: 'top'
  }
];

export const JournalTutorial: React.FC<{
  visible: boolean;
  onComplete: () => void;
}> = ({ visible, onComplete }) => {
  const { start, stop } = useTourGuideController();
  
  useEffect(() => {
    if (visible) {
      start();
    } else {
      stop();
    }
  }, [visible]);
  
  return (
    <TourGuideProvider
      steps={JOURNAL_TUTORIAL_STEPS}
      onFinish={onComplete}
      onSkip={onComplete}
      androidStatusBarVisible
      startAtStep={0}
      labels={{
        skip: 'Pular',
        next: 'Próximo',
        previous: 'Anterior',
        finish: 'Concluir'
      }}
    />
  );
};

// Usage in components:
export const TutorialZone: React.FC<{
  zone: string;
  children: React.ReactNode;
}> = ({ zone, children }) => (
  <TourGuideZone zone={zone} shape="rectangle">
    {children}
  </TourGuideZone>
);
```

#### **4.3 Enhanced Quick Actions**
```tsx
// 📁 modules/journal/components/QuickActions.tsx
interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  gradient: string[];
  icon: string;
  prompt?: string;
  category: string;
  timeContext?: 'morning' | 'afternoon' | 'evening';
}

export const SmartQuickActions: React.FC = () => {
  const timeOfDay = getTimeOfDay();
  const { userHistory, currentMood } = useJournalStore();
  
  // ✅ Smart actions baseadas no contexto
  const getContextualActions = (): QuickAction[] => {
    const baseActions = [
      {
        id: 'free-write',
        title: 'Escrita Livre',
        subtitle: 'O que está no seu coração?',
        gradient: ['#667eea', '#764ba2'],
        icon: '✍️',
        category: 'free-writing'
      },
      {
        id: 'gratitude',
        title: 'Gratidão',
        subtitle: 'Pelo que você é grato hoje?',
        gradient: ['#f093fb', '#f5576c'],
        icon: '🙏',
        prompt: 'Hoje eu sou grato por...',
        category: 'gratitude'
      }
    ];
    
    // ✅ Adicionar ações contextuais baseadas no horário
    if (timeOfDay === 'morning') {
      baseActions.push({
        id: 'morning-intention',
        title: 'Intenção do Dia',
        subtitle: 'Como quer se sentir hoje?',
        gradient: ['#ffecd2', '#fcb69f'],
        icon: '🌅',
        prompt: 'Minha intenção para hoje é...',
        category: 'intention'
      });
    } else if (timeOfDay === 'evening') {
      baseActions.push({
        id: 'reflection',
        title: 'Reflexão do Dia',
        subtitle: 'Como foi seu dia?',
        gradient: ['#a18cd1', '#fbc2eb'],
        icon: '🌙',
        prompt: 'Refletindo sobre hoje...',
        category: 'reflection'
      });
    }
    
    return baseActions;
  };
  
  const actions = getContextualActions();
  
  return (
    <TutorialZone zone="quick-actions">
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.actionsContainer}
      >
        {actions.map((action) => (
          <QuickActionCard
            key={action.id}
            action={action}
            onPress={() => startEntryWithAction(action)}
          />
        ))}
      </ScrollView>
    </TutorialZone>
  );
};

const QuickActionCard: React.FC<{
  action: QuickAction;
  onPress: () => void;
}> = ({ action, onPress }) => (
  <TouchableOpacity
    style={styles.actionCard}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <LinearGradient
      colors={action.gradient}
      style={styles.cardGradient}
    >
      <Text style={styles.actionIcon}>{action.icon}</Text>
      <ThemedText style={styles.actionTitle}>{action.title}</ThemedText>
      <ThemedText style={styles.actionSubtitle}>{action.subtitle}</ThemedText>
    </LinearGradient>
  </TouchableOpacity>
);
```

#### **Tasks:**
- [ ] Install lottie: `npm install lottie-react-native`
- [ ] Install tour guide: `npm install rn-tourguide`
- [ ] Create empty state animations
- [ ] Implement `JournalEmptyState` component
- [ ] Implement `JournalTutorial` system
- [ ] Create smart quick actions with time context
- [ ] Update all screens to use new empty states
- [ ] Test tutorial flow on different screen sizes

---

### ⚡ **5. Performance Optimizations**
**Deadline:** 3 dias  
**Impacto:** Médio - App responsiveness

#### **5.1 Implement FlashList**
```tsx
// 📁 modules/journal/components/OptimizedEntriesList.tsx
import { FlashList } from '@shopify/flash-list';

interface OptimizedEntriesListProps {
  entries: JournalEntry[];
  onEntryPress: (entry: JournalEntry) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export const OptimizedEntriesList: React.FC<OptimizedEntriesListProps> = ({
  entries,
  onEntryPress,
  refreshing = false,
  onRefresh
}) => {
  const renderEntry = useCallback(({ item }: { item: JournalEntry }) => (
    <MemoizedEntryCard 
      entry={item} 
      onPress={() => onEntryPress(item)}
    />
  ), [onEntryPress]);
  
  const keyExtractor = useCallback((item: JournalEntry) => item.id, []);
  
  return (
    <FlashList
      data={entries}
      renderItem={renderEntry}
      keyExtractor={keyExtractor}
      estimatedItemSize={120}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
      refreshing={refreshing}
      onRefresh={onRefresh}
      // ✅ Otimizações adicionais
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={5}
      // ✅ Empty state
      ListEmptyComponent={() => (
        <JournalEmptyState 
          type="no-entries"
          onAction={() => router.push('/journal-entry?tutorial=true')}
        />
      )}
      // ✅ Loading footer
      ListFooterComponent={() => (
        refreshing ? <LoadingSpinner /> : null
      )}
    />
  );
};

// ✅ Memoized entry card para evitar re-renders
const MemoizedEntryCard = React.memo<{
  entry: JournalEntry;
  onPress: () => void;
}>(({ entry, onPress }) => (
  <EntryCard entry={entry} onPress={onPress} />
), (prevProps, nextProps) => {
  // ✅ Custom comparator
  return (
    prevProps.entry.id === nextProps.entry.id &&
    prevProps.entry.updatedAt === nextProps.entry.updatedAt
  );
});
```

#### **5.2 Memoize Heavy Calculations**
```tsx
// 📁 modules/journal/pages/JournalAnalyticsScreen.tsx
export default function JournalAnalyticsScreen() {
  const { entries } = useJournalStore();
  
  // ✅ Memoize expensive calculations
  const analyticsData = useMemo(() => {
    return {
      stats: JournalStatsService.calculateStats(entries),
      chartData: generateChartData(entries),
      insights: generateInsights(entries),
      trends: analyzeTrends(entries)
    };
  }, [entries]);
  
  // ✅ Memoize chart components
  const MemoizedChart = useMemo(() => (
    <MoodTimelineChart data={analyticsData.chartData} />
  ), [analyticsData.chartData]);
  
  return (
    <ScrollView>
      <AnalyticsHeroSection stats={analyticsData.stats} />
      {MemoizedChart}
      <InsightsSection insights={analyticsData.insights} />
      <TrendsSection trends={analyticsData.trends} />
    </ScrollView>
  );
}

// ✅ Memoized analytics components
const AnalyticsHeroSection = React.memo<{ stats: JournalStats }>(({ stats }) => (
  <View style={styles.heroSection}>
    <StatsCard label="Entradas" value={stats.totalEntries} icon="📝" />
    <StatsCard label="Dias únicos" value={stats.uniqueDays} icon="📅" />
    <StatsCard label="Positividade" value={`${stats.percentPositive}%`} icon="😊" />
  </View>
));
```

#### **5.3 Optimize Images and Assets**
```tsx
// 📁 modules/journal/components/OptimizedImage.tsx
import { Image } from 'expo-image';

interface OptimizedImageProps {
  source: string | { uri: string };
  style?: any;
  placeholder?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  placeholder = 'blurhash:LGF5]+Yk^6#M@-5c,1J5@[or[Q6.'
}) => (
  <Image
    source={source}
    style={style}
    placeholder={placeholder}
    contentFit="cover"
    transition={200}
    cachePolicy="memory-disk"
  />
);
```

#### **Tasks:**
- [ ] Install FlashList: `npm install @shopify/flash-list`
- [ ] Install Expo Image: `npx expo install expo-image`
- [ ] Replace ScrollView with FlashList in entries list
- [ ] Add memoization to all expensive calculations
- [ ] Memoize all heavy components
- [ ] Replace Image with expo-image for better performance
- [ ] Test performance improvements with React DevTools
- [ ] Measure bundle size impact

---

## 📊 PRIORIDADE MÉDIA (SPRINT 3 - Semana 3)

### 🤖 **6. Smart Features with AI**
**Deadline:** 4 dias  
**Impacto:** Alto - Product differentiation

#### **6.1 Smart Prompt Generation**
```typescript
// 📁 modules/journal/services/SmartPromptService.ts
export class SmartPromptService {
  static async generatePersonalizedPrompts(
    userContext: {
      recentEntries: JournalEntry[];
      currentMood: MoodTag[];
      timeOfDay: 'morning' | 'afternoon' | 'evening';
      dayOfWeek: string;
      weather?: string;
    }
  ): Promise<JournalPrompt[]> {
    
    // ✅ Analisar padrões do usuário
    const patterns = this.analyzeUserPatterns(userContext.recentEntries);
    
    const promptRequest = {
      userEmotionalState: userContext.currentMood.map(m => m.label),
      recentThemes: patterns.topThemes,
      timeContext: userContext.timeOfDay,
      emotionalTrends: patterns.emotionalTrends,
      language: 'pt-BR',
      promptCount: 5,
      difficulty: patterns.preferredComplexity
    };
    
    try {
      const response = await ClaudeAPI.generatePrompts(promptRequest);
      return response.prompts.map(p => ({
        id: `ai-${Date.now()}-${Math.random()}`,
        question: p.question,
        category: 'ai-generated',
        icon: p.suggestedIcon || '🤖',
        difficulty: p.difficulty,
        tags: p.tags,
        isPersonalized: true,
        estimatedTime: p.estimatedMinutes
      }));
    } catch (error) {
      console.error('Error generating AI prompts:', error);
      return this.getFallbackPrompts(userContext);
    }
  }
  
  private static analyzeUserPatterns(entries: JournalEntry[]) {
    // ✅ Extrair temas recorrentes
    const topThemes = this.extractTopics(entries);
    
    // ✅ Analisar tendências emocionais
    const emotionalTrends = this.analyzeEmotionalTrends(entries);
    
    // ✅ Determinar complexidade preferida
    const preferredComplexity = this.calculateComplexityPreference(entries);
    
    return {
      topThemes,
      emotionalTrends,
      preferredComplexity
    };
  }
}
```

#### **6.2 Real-time Sentiment Analysis**
```typescript
// 📁 modules/journal/services/SentimentAnalysisService.ts
export class SentimentAnalysisService {
  private static analysisCache = new Map<string, SentimentAnalysis>();
  
  static async analyzeTextRealTime(
    text: string,
    debounceMs: number = 1000
  ): Promise<SentimentAnalysis | null> {
    // ✅ Debounce para evitar muitas calls
    if (text.length < 50) return null;
    
    const cacheKey = this.generateCacheKey(text);
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey)!;
    }
    
    try {
      const analysis = await ClaudeAPI.analyzeSentiment({
        text,
        language: 'pt-BR',
        includeEmotions: true,
        includeKeywords: true,
        includeSuggestions: true
      });
      
      const result = {
        sentimentScore: analysis.sentiment, // -1 to 1
        emotions: analysis.emotions,
        keywords: analysis.keywords,
        suggestedMoodTags: analysis.suggestedMoodTags,
        insights: analysis.insights,
        warningFlags: analysis.warningFlags // For crisis detection
      };
      
      // ✅ Cache result
      this.analysisCache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('Sentiment analysis failed:', error);
      return null;
    }
  }
  
  static async generatePersonalInsights(
    entries: JournalEntry[]
  ): Promise<PersonalInsight[]> {
    const insights = [];
    
    // ✅ Análise de padrões temporais
    const patterns = this.analyzeTemporalPatterns(entries);
    if (patterns.hasPattern) {
      insights.push({
        type: 'pattern',
        title: 'Padrão Identificado',
        description: patterns.description,
        recommendation: patterns.recommendation,
        confidence: patterns.confidence
      });
    }
    
    // ✅ Análise de crescimento emocional
    const growth = this.analyzeEmotionalGrowth(entries);
    if (growth.hasGrowth) {
      insights.push({
        type: 'growth',
        title: 'Evolução Emocional',
        description: growth.description,
        celebration: growth.celebration,
        nextSteps: growth.nextSteps
      });
    }
    
    return insights;
  }
}
```

#### **6.3 Crisis Detection Integration**
```typescript
// 📁 modules/journal/services/CrisisDetectionService.ts
export class CrisisDetectionService {
  static async assessCrisisRisk(
    recentEntries: JournalEntry[],
    currentText: string
  ): Promise<CrisisAssessment> {
    
    const factors = {
      // ✅ Análise do texto atual
      currentTextFlags: await this.analyzeTextForCrisisFlags(currentText),
      
      // ✅ Padrões históricos
      historicalPatterns: this.analyzeHistoricalPatterns(recentEntries),
      
      // ✅ Tendências recentes
      recentTrends: this.analyzeRecentTrends(recentEntries.slice(0, 7))
    };
    
    const riskScore = this.calculateRiskScore(factors);
    
    return {
      riskLevel: this.getRiskLevel(riskScore),
      riskScore,
      triggerFactors: this.identifyTriggerFactors(factors),
      recommendations: await this.generateRecommendations(riskScore, factors),
      shouldNotifySupport: riskScore > 0.7,
      supportResources: this.getSupportResources()
    };
  }
  
  private static async analyzeTextForCrisisFlags(text: string): Promise<CrisisFlag[]> {
    // ✅ Usar Claude para detectar linguagem de crise
    const analysis = await ClaudeAPI.detectCrisisLanguage({
      text,
      language: 'pt-BR',
      sensitivity: 'high'
    });
    
    return analysis.flags.map(flag => ({
      type: flag.type,
      severity: flag.severity,
      context: flag.context,
      suggestion: flag.suggestion
    }));
  }
  
  private static getSupportResources(): SupportResource[] {
    return [
      {
        type: 'emergency',
        title: 'Centro de Valorização da Vida',
        subtitle: 'Apoio emocional 24h',
        phone: '188',
        description: 'Conversa sigilosa com voluntários treinados'
      },
      {
        type: 'professional',
        title: 'Buscar Ajuda Profissional',
        subtitle: 'Encontre um psicólogo',
        action: 'find_therapist',
        description: 'Conecte-se com profissionais qualificados'
      }
    ];
  }
}
```

#### **Tasks:**
- [ ] Setup Claude API integration
- [ ] Implement `SmartPromptService`
- [ ] Implement real-time sentiment analysis with debouncing
- [ ] Create crisis detection system
- [ ] Add AI-generated prompts to prompt selector
- [ ] Implement sentiment feedback in text editor
- [ ] Add crisis support resources
- [ ] Test AI features with various text samples
- [ ] Implement fallback for API failures

---

### 📱 **7. Offline Capabilities**
**Deadline:** 2 dias  
**Impacto:** Médio - User reliability

#### **7.1 SQLite Local Database**
```typescript
// 📁 modules/journal/services/OfflineStorageService.ts
import * as SQLite from 'expo-sqlite';

export class OfflineStorageService {
  private static db: SQLite.SQLiteDatabase;
  
  static async initialize(): Promise<void> {
    this.db = await SQLite.openDatabaseAsync('journal.db');
    await this.createTables();
  }
  
  private static async createTables(): Promise<void> {
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS journal_entries (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        prompt_id TEXT,
        prompt_category TEXT,
        mood_tags TEXT, -- JSON array
        created_at TEXT NOT NULL,
        updated_at TEXT,
        word_count INTEGER,
        sentiment_score REAL,
        synced INTEGER DEFAULT 0,
        deleted INTEGER DEFAULT 0
      );
      
      CREATE TABLE IF NOT EXISTS journal_prompts (
        id TEXT PRIMARY KEY,
        question TEXT NOT NULL,
        category TEXT,
        icon TEXT,
        difficulty TEXT,
        is_personalized INTEGER DEFAULT 0,
        created_at TEXT
      );
      
      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        action TEXT NOT NULL, -- 'create', 'update', 'delete'
        payload TEXT, -- JSON
        created_at TEXT NOT NULL,
        retry_count INTEGER DEFAULT 0
      );
      
      CREATE INDEX IF NOT EXISTS idx_entries_created_at ON journal_entries(created_at);
      CREATE INDEX IF NOT EXISTS idx_entries_synced ON journal_entries(synced);
      CREATE INDEX IF NOT EXISTS idx_sync_queue_created_at ON sync_queue(created_at);
    `);
  }
  
  // ✅ CRUD Operations
  static async saveEntryOffline(entry: JournalEntry): Promise<void> {
    const query = `
      INSERT OR REPLACE INTO journal_entries 
      (id, content, prompt_id, prompt_category, mood_tags, created_at, updated_at, word_count, sentiment_score, synced)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await this.db.runAsync(query, [
      entry.id,
      entry.content,
      entry.selectedPrompt?.id || null,
      entry.promptCategory,
      JSON.stringify(entry.moodTags),
      entry.createdAt,
      entry.updatedAt || new Date().toISOString(),
      entry.wordCount,
      entry.sentimentScore || null,
      0 // not synced
    ]);
    
    // ✅ Add to sync queue
    await this.addToSyncQueue('journal_entry', entry.id, 'create', entry);
  }
  
  static async getEntriesOffline(): Promise<JournalEntry[]> {
    const result = await this.db.getAllAsync(`
      SELECT * FROM journal_entries 
      WHERE deleted = 0 
      ORDER BY created_at DESC
    `);
    
    return result.map(row => this.mapRowToEntry(row));
  }
  
  // ✅ Sync Operations
  static async addToSyncQueue(
    entityType: string,
    entityId: string,
    action: 'create' | 'update' | 'delete',
    payload?: any
  ): Promise<void> {
    await this.db.runAsync(`
      INSERT INTO sync_queue (id, entity_type, entity_id, action, payload, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      `${entityType}-${entityId}-${action}-${Date.now()}`,
      entityType,
      entityId,
      action,
      JSON.stringify(payload),
      new Date().toISOString()
    ]);
  }
  
  static async processSyncQueue(): Promise<void> {
    const pendingItems = await this.db.getAllAsync(`
      SELECT * FROM sync_queue 
      ORDER BY created_at ASC 
      LIMIT 50
    `);
    
    for (const item of pendingItems) {
      try {
        await this.syncItem(item);
        await this.removeSyncItem(item.id);
      } catch (error) {
        console.error('Sync failed for item:', item.id, error);
        await this.incrementRetryCount(item.id);
      }
    }
  }
  
  private static async syncItem(item: any): Promise<void> {
    const payload = JSON.parse(item.payload);
    
    switch (item.entity_type) {
      case 'journal_entry':
        if (item.action === 'create') {
          await JournalApiService.createEntry(payload);
        } else if (item.action === 'update') {
          await JournalApiService.updateEntry(item.entity_id, payload);
        }
        // Mark as synced in local DB
        await this.markAsSynced(item.entity_id);
        break;
    }
  }
}
```

#### **7.2 Network-Aware Sync**
```typescript
// 📁 modules/journal/services/SyncService.ts
import NetInfo from '@react-native-community/netinfo';

export class SyncService {
  private static syncInProgress = false;
  private static syncInterval: NodeJS.Timeout | null = null;
  
  static async startSyncService(): Promise<void> {
    // ✅ Listen to network changes
    NetInfo.addEventListener(state => {
      if (state.isConnected && !this.syncInProgress) {
        this.performSync();
      }
    });
    
    // ✅ Periodic sync when online
    this.syncInterval = setInterval(() => {
      this.checkAndSync();
    }, 30000); // Every 30 seconds
  }
  
  static stopSyncService(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
  
  private static async checkAndSync(): Promise<void> {
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected && !this.syncInProgress) {
      await this.performSync();
    }
  }
  
  private static async performSync(): Promise<void> {
    if (this.syncInProgress) return;
    
    try {
      this.syncInProgress = true;
      
      // ✅ Sync pending local changes to server
      await OfflineStorageService.processSyncQueue();
      
      // ✅ Pull latest data from server
      await this.pullLatestData();
      
      // ✅ Update store
      const localEntries = await OfflineStorageService.getEntriesOffline();
      useJournalStore.getState().setEntries(localEntries);
      
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }
  
  private static async pullLatestData(): Promise<void> {
    try {
      // ✅ Get latest entries from server
      const serverEntries = await JournalApiService.getEntries();
      
      // ✅ Merge with local data
      for (const serverEntry of serverEntries) {
        await OfflineStorageService.saveEntryOffline({
          ...serverEntry,
          synced: true
        });
      }
    } catch (error) {
      console.error('Failed to pull latest data:', error);
    }
  }
}
```

#### **Tasks:**
- [ ] Install SQLite: `npx expo install expo-sqlite`
- [ ] Install NetInfo: `npm install @react-native-community/netinfo`
- [ ] Implement `OfflineStorageService`
- [ ] Implement `SyncService` with network awareness
- [ ] Update store to use offline-first approach
- [ ] Add sync status indicators in UI
- [ ] Test offline functionality
- [ ] Test sync after reconnection

---

## 📈 PRIORIDADE BAIXA (SPRINT 4 - Semana 4)

### 🎮 **8. Gamification & Advanced Features**
**Deadline:** 3 dias  
**Impacto:** Baixo - User engagement

#### **8.1 Achievement System**
```typescript
// 📁 modules/journal/services/AchievementService.ts
interface JournalAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'consistency' | 'depth' | 'reflection' | 'milestone';
  requirement: {
    type: 'entries_count' | 'streak_days' | 'word_count' | 'mood_improvement';
    target: number;
  };
  reward: {
    points: number;
    badge: string;
    title?: string;
  };
  unlocked?: boolean;
  unlockedAt?: string;
}

const JOURNAL_ACHIEVEMENTS: JournalAchievement[] = [
  {
    id: 'first_entry',
    title: 'Primeira Palavra',
    description: 'Escreveu sua primeira entrada no diário',
    icon: '✍️',
    category: 'milestone',
    requirement: { type: 'entries_count', target: 1 },
    reward: { points: 10, badge: '🏆' }
  },
  {
    id: 'week_streak',
    title: 'Semana Consistente',
    description: 'Escreveu todos os dias por uma semana',
    icon: '🔥',
    category: 'consistency',
    requirement: { type: 'streak_days', target: 7 },
    reward: { points: 50, badge: '🔥', title: 'Escritor Consistente' }
  },
  {
    id: 'deep_thinker',
    title: 'Pensador Profundo',
    description: 'Escreveu uma entrada com mais de 500 palavras',
    icon: '🤔',
    category: 'depth',
    requirement: { type: 'word_count', target: 500 },
    reward: { points: 25, badge: '📝' }
  }
];

export class AchievementService {
  static async checkAchievements(
    entries: JournalEntry[],
    userAchievements: JournalAchievement[]
  ): Promise<JournalAchievement[]> {
    const newAchievements: JournalAchievement[] = [];
    
    for (const achievement of JOURNAL_ACHIEVEMENTS) {
      const alreadyUnlocked = userAchievements.some(ua => ua.id === achievement.id);
      if (alreadyUnlocked) continue;
      
      const isUnlocked = this.checkAchievementRequirement(achievement, entries);
      if (isUnlocked) {
        newAchievements.push({
          ...achievement,
          unlocked: true,
          unlockedAt: new Date().toISOString()
        });
      }
    }
    
    return newAchievements;
  }
  
  private static checkAchievementRequirement(
    achievement: JournalAchievement,
    entries: JournalEntry[]
  ): boolean {
    switch (achievement.requirement.type) {
      case 'entries_count':
        return entries.length >= achievement.requirement.target;
        
      case 'word_count':
        return entries.some(entry => entry.wordCount >= achievement.requirement.target);
        
      case 'streak_days':
        return this.calculateCurrentStreak(entries) >= achievement.requirement.target;
        
      default:
        return false;
    }
  }
}
```

#### **8.2 Export & Sharing Features**
```typescript
// 📁 modules/journal/services/ExportService.ts
export class JournalExportService {
  static async exportToPDF(
    entries: JournalEntry[],
    options: {
      dateRange?: { start: string; end: string };
      includeStats?: boolean;
      includeMoodTags?: boolean;
    } = {}
  ): Promise<string> {
    const filteredEntries = this.filterEntriesByDateRange(entries, options.dateRange);
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Meu Diário PulseZen</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .entry { margin-bottom: 30px; page-break-inside: avoid; }
            .entry-date { font-weight: bold; color: #666; }
            .entry-content { margin-top: 10px; line-height: 1.6; }
            .mood-tags { margin-top: 10px; font-style: italic; color: #999; }
            .stats { margin-bottom: 30px; padding: 20px; background: #f5f5f5; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Meu Diário Pessoal</h1>
            <p>Período: ${this.formatDateRange(options.dateRange)}</p>
          </div>
          
          ${options.includeStats ? this.generateStatsHTML(filteredEntries) : ''}
          
          ${filteredEntries.map(entry => `
            <div class="entry">
              <div class="entry-date">${new Date(entry.createdAt).toLocaleDateString('pt-BR')}</div>
              <div class="entry-content">${entry.content}</div>
              ${options.includeMoodTags && entry.moodTags.length > 0 ? 
                `<div class="mood-tags">Humor: ${entry.moodTags.map(tag => tag.label).join(', ')}</div>` : 
                ''
              }
            </div>
          `).join('')}
        </body>
      </html>
    `;
    
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false
    });
    
    return uri;
  }
  
  static async shareEntry(entry: JournalEntry): Promise<void> {
    const shareContent = `
      📝 Reflexão do dia ${new Date(entry.createdAt).toLocaleDateString('pt-BR')}
      
      ${entry.content}
      
      ${entry.moodTags.length > 0 ? `Humor: ${entry.moodTags.map(tag => tag.label).join(', ')}` : ''}
      
      Escrito com ❤️ no PulseZen
    `;
    
    await Share.share({
      message: shareContent,
      title: 'Minha reflexão do dia'
    });
  }
}
```

#### **Tasks:**
- [ ] Implement achievement system
- [ ] Create achievement UI components
- [ ] Implement PDF export functionality
- [ ] Add sharing capabilities
- [ ] Create achievement notification system
- [ ] Test export with various entry counts
- [ ] Test sharing functionality

---

## 🎯 DEFINITION OF DONE

### ✅ **Sprint 1 - Critical Fixes**
- [ ] All TypeScript errors resolved
- [ ] Zustand store implemented and tested
- [ ] Navigation working correctly with proper parameters
- [ ] Service provider pattern working
- [ ] All screens loading without errors
- [ ] State persistence working across app restarts

### ✅ **Sprint 2 - UI/UX Improvements**
- [ ] Empty states implemented with animations
- [ ] Tutorial system working on first app launch
- [ ] Smart quick actions responding to time context
- [ ] Performance improvements measurable
- [ ] FlashList working smoothly
- [ ] App feels responsive on low-end devices

### ✅ **Sprint 3 - Smart Features**
- [ ] AI prompts generating successfully
- [ ] Sentiment analysis providing real-time feedback
- [ ] Crisis detection system operational (if applicable)
- [ ] Offline functionality working
- [ ] Sync working reliably
- [ ] No data loss during offline periods

### ✅ **Sprint 4 - Polish & Gamification**
- [ ] Achievement system working
- [ ] Export functionality generating proper PDFs
- [ ] Sharing working across platforms
- [ ] All features tested on iOS and Android
- [ ] Performance metrics within acceptable ranges
- [ ] User testing feedback incorporated

---

## 📊 SUCCESS METRICS

### **Performance Targets:**
- [ ] App launch time < 2 seconds
- [ ] Journal list scrolling 60fps
- [ ] Entry creation < 1 second save time
- [ ] Search results < 500ms
- [ ] Memory usage < 150MB during normal operation

### **Quality Targets:**
- [ ] 0 TypeScript errors
- [ ] 0 critical accessibility issues
- [ ] 95%+ crash-free rate
- [ ] < 3 user taps to create entry
- [ ] 100% offline capability for core features

### **User Experience Targets:**
- [ ] < 30 seconds to complete first entry (new users)
- [ ] 80%+ task completion rate for core flows
- [ ] < 2 support requests per 100 users
- [ ] 4.5+ app store rating
- [ ] 60%+ day-1 retention rate

**🎯 Final Goal:** Transform Journal module from "functional" to "exceptional" - making it a key differentiator for PulseZen with best-in-class UX and innovative AI features.
