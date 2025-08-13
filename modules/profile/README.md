# 👤 PulseZen Profile Module

## 📊 Status: ✅ **FUNCTIONAL - READY FOR COMPLETION**

O módulo Profile gerencia informações do usuário, configurações da aplicação, preferências personalizadas e apresenta estatísticas agregadas de todo o ecossistema PulseZen.

---

## 🏗️ Arquitetura

### 📦 Estrutura do Módulo

```
modules/profile/
├── README.md                    # 📖 Este documento
├── index.ts                     # 🔄 Exports principais
├── constants/                   # 📋 Constantes e configurações
│   └── index.ts                # Configurações padrão
├── hooks/                       # 🎣 React Hooks
│   ├── useProfile.ts           # Hook principal do perfil
│   ├── useSettings.ts          # Hook de configurações
│   └── index.ts
├── pages/                       # 📱 Telas/Páginas
│   ├── ProfileScreen.tsx       # Tela principal do perfil
│   ├── SettingsScreen.tsx      # Tela de configurações
│   ├── StatsScreen.tsx         # Tela de estatísticas
│   └── index.ts
├── services/                    # 🔧 Lógica de negócio
│   ├── ProfileService.ts       # Service principal
│   ├── ProfileApiService.ts    # Cliente API (futuro)
│   ├── SettingsService.ts      # Gerenciamento de configurações
│   └── index.ts
├── types/                       # 📝 TypeScript Types
│   └── index.ts                # Definições de tipos
└── utils/                       # 🛠️ Utilitários
    ├── avatarGenerator.ts      # Geração de avatares
    ├── dataExport.ts          # Export de dados
    └── index.ts
```

---

## 🎯 Funcionalidades Principais

### ✅ **Gerenciamento de Perfil**

1. **Informações Básicas**
   - Nome e foto do usuário
   - Data de nascimento e idade
   - Objetivos de bem-estar
   - Configurações de privacidade

2. **Personalização**
   - Avatar personalizado
   - Temas e cores
   - Preferências de interface
   - Configurações de acessibilidade

3. **Configurações da Aplicação**
   - Notificações e lembretes
   - Configurações de áudio
   - Backup e sincronização
   - Privacidade e segurança

### ✅ **Estatísticas Agregadas**

1. **Dashboard de Bem-estar**
   - Score geral de bem-estar
   - Progresso em diferentes módulos
   - Streaks e conquistas
   - Insights de melhoria

2. **Analytics Personalizadas**
   - Padrões de uso da aplicação
   - Horários mais ativos
   - Funcionalidades mais utilizadas
   - Correlações entre módulos

3. **Relatórios de Progresso**
   - Relatórios semanais/mensais
   - Comparações temporais
   - Metas e objetivos
   - Recomendações personalizadas

### ✅ **Configurações Avançadas**

1. **Backup e Sincronização**
   - Export completo de dados
   - Backup automático
   - Sincronização entre dispositivos
   - Restore de dados

2. **Privacidade e Segurança**
   - Controle de dados compartilhados
   - Configurações de anonimização
   - Autenticação biométrica
   - Logs de acesso

---

## 🔧 API e Services

### 🏗️ **ProfileService**

**Status:** ✅ **IMPLEMENTADO (Local Storage)**

```typescript
interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  dateOfBirth?: string;
  goals: WellnessGoal[];
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

interface WellnessGoal {
  id: string;
  title: string;
  description: string;
  category: 'mood' | 'breathing' | 'journal' | 'overall';
  target: number;
  current: number;
  deadline?: string;
  completed: boolean;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'pt-BR' | 'en-US';
  notifications: NotificationPreferences;
  accessibility: AccessibilityPreferences;
  privacy: PrivacyPreferences;
  dataRetention: DataRetentionPreferences;
}
```

### 🔧 **Service Methods**

```typescript
class ProfileService {
  // Gerenciamento de perfil
  static async getProfile(): Promise<UserProfile | null>;
  static async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile>;
  static async createProfile(profile: CreateProfileRequest): Promise<UserProfile>;
  static async deleteProfile(): Promise<void>;
  
  // Configurações
  static async getPreferences(): Promise<UserPreferences>;
  static async updatePreferences(preferences: Partial<UserPreferences>): Promise<void>;
  static async resetPreferences(): Promise<void>;
  
  // Estatísticas agregadas
  static async getAggregatedStats(): Promise<AggregatedStats>;
  static async getModuleStats(): Promise<ModuleStats[]>;
  static async getProgressReport(period: 'week' | 'month' | 'year'): Promise<ProgressReport>;
  
  // Backup e export
  static async exportUserData(format: 'json' | 'csv'): Promise<ExportResult>;
  static async importUserData(data: string): Promise<ImportResult>;
  static async createBackup(): Promise<BackupResult>;
  static async restoreBackup(backupId: string): Promise<RestoreResult>;
  
  // Conquistas e metas
  static async getAchievements(): Promise<Achievement[]>;
  static async unlockAchievement(achievementId: string): Promise<void>;
  static async updateGoals(goals: WellnessGoal[]): Promise<void>;
  static async checkGoalProgress(): Promise<GoalProgressUpdate[]>;
}
```

### 🌐 **ProfileApiService (Future)**

**Status:** 🔄 **PLANEJADO PARA FASE 2**

```typescript
interface ProfileApiService {
  // Sync com backend
  syncProfile(profile: UserProfile): Promise<SyncResult>;
  syncPreferences(preferences: UserPreferences): Promise<SyncResult>;
  
  // Social features
  shareProgress(moduleId: string, achievement: Achievement): Promise<ShareResult>;
  getLeaderboard(category: string): Promise<LeaderboardEntry[]>;
  
  // Insights avançados
  getPersonalizedInsights(): Promise<PersonalizedInsight[]>;
  getRecommendations(): Promise<Recommendation[]>;
  
  // Professional features
  shareWithTherapist(data: TherapistShareData): Promise<ShareResult>;
  generateClinicalReport(): Promise<ClinicalReport>;
}
```

---

## 🎣 Hooks Principais

### 👤 **useProfile**

```typescript
interface UseProfileReturn {
  // Estado do perfil
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  
  // Métodos de perfil
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  uploadAvatar: (imageUri: string) => Promise<void>;
  deleteProfile: () => Promise<void>;
  
  // Metas e conquistas
  goals: WellnessGoal[];
  achievements: Achievement[];
  updateGoals: (goals: WellnessGoal[]) => Promise<void>;
  completeGoal: (goalId: string) => Promise<void>;
  
  // Estatísticas
  aggregatedStats: AggregatedStats | null;
  progressReport: ProgressReport | null;
  refreshStats: () => Promise<void>;
}

// Uso
const {
  profile,
  updateProfile,
  goals,
  achievements,
  aggregatedStats,
  uploadAvatar,
} = useProfile();
```

### ⚙️ **useSettings**

```typescript
interface UseSettingsReturn {
  // Configurações atuais
  preferences: UserPreferences;
  isLoading: boolean;
  error: string | null;
  
  // Métodos de configuração
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  
  // Configurações específicas
  toggleTheme: () => Promise<void>;
  updateNotifications: (notifications: NotificationPreferences) => Promise<void>;
  updateAccessibility: (accessibility: AccessibilityPreferences) => Promise<void>;
  updatePrivacy: (privacy: PrivacyPreferences) => Promise<void>;
  
  // Backup e export
  exportData: (format: 'json' | 'csv') => Promise<ExportResult>;
  importData: (data: string) => Promise<ImportResult>;
  createBackup: () => Promise<BackupResult>;
}

// Uso
const {
  preferences,
  updatePreferences,
  toggleTheme,
  exportData,
  createBackup,
} = useSettings();
```

---

## 📱 Componentes de Tela

### 👤 **ProfileScreen**

Tela principal do perfil do usuário:

```typescript
const ProfileScreen = () => {
  const { profile, updateProfile, aggregatedStats } = useProfile();
  const { preferences } = useSettings();
  
  return (
    <ScrollView>
      {/* Header com avatar e info básica */}
      <ProfileHeader 
        profile={profile}
        onAvatarPress={handleAvatarEdit}
        onEditPress={handleProfileEdit}
      />
      
      {/* Dashboard de bem-estar */}
      <WellnessDashboard stats={aggregatedStats} />
      
      {/* Metas e conquistas */}
      <GoalsSection goals={profile?.goals} />
      <AchievementsSection achievements={achievements} />
      
      {/* Quick actions */}
      <QuickActions 
        onSettingsPress={() => navigate('Settings')}
        onExportPress={handleExport}
        onStatsPress={() => navigate('Stats')}
      />
    </ScrollView>
  );
};
```

### ⚙️ **SettingsScreen**

Tela de configurações detalhadas:

```typescript
const SettingsScreen = () => {
  const { preferences, updatePreferences } = useSettings();
  
  return (
    <ScrollView>
      {/* Configurações de aparência */}
      <SettingsSection title="Aparência">
        <ThemeSelector 
          value={preferences.theme}
          onChange={(theme) => updatePreferences({ theme })}
        />
        <LanguageSelector 
          value={preferences.language}
          onChange={(language) => updatePreferences({ language })}
        />
      </SettingsSection>
      
      {/* Configurações de notificação */}
      <SettingsSection title="Notificações">
        <NotificationSettings 
          preferences={preferences.notifications}
          onChange={(notifications) => updatePreferences({ notifications })}
        />
      </SettingsSection>
      
      {/* Configurações de acessibilidade */}
      <SettingsSection title="Acessibilidade">
        <AccessibilitySettings 
          preferences={preferences.accessibility}
          onChange={(accessibility) => updatePreferences({ accessibility })}
        />
      </SettingsSection>
      
      {/* Privacidade e segurança */}
      <SettingsSection title="Privacidade">
        <PrivacySettings 
          preferences={preferences.privacy}
          onChange={(privacy) => updatePreferences({ privacy })}
        />
      </SettingsSection>
      
      {/* Backup e dados */}
      <SettingsSection title="Dados">
        <DataManagementSettings />
      </SettingsSection>
    </ScrollView>
  );
};
```

### 📊 **StatsScreen**

Tela de estatísticas detalhadas:

```typescript
const StatsScreen = () => {
  const { aggregatedStats, progressReport } = useProfile();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  
  return (
    <ScrollView>
      {/* Período selector */}
      <PeriodSelector 
        value={selectedPeriod}
        onChange={setSelectedPeriod}
      />
      
      {/* Overview cards */}
      <StatsOverview stats={aggregatedStats} />
      
      {/* Charts por módulo */}
      <ModuleStatsCharts 
        period={selectedPeriod}
        data={progressReport?.moduleStats}
      />
      
      {/* Insights e recomendações */}
      <InsightsSection insights={progressReport?.insights} />
      
      {/* Relatório de progresso */}
      <ProgressReportSection report={progressReport} />
    </ScrollView>
  );
};
```

---

## 📝 Types e Interfaces

### 🏷️ **Core Types**

```typescript
// Perfil do usuário
interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  dateOfBirth?: string;
  goals: WellnessGoal[];
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
  metadata: {
    appVersion: string;
    lastActiveAt: string;
    totalSessions: number;
    streakDays: number;
  };
}

// Meta de bem-estar
interface WellnessGoal {
  id: string;
  title: string;
  description: string;
  category: 'mood' | 'breathing' | 'journal' | 'prediction' | 'overall';
  type: 'daily' | 'weekly' | 'monthly' | 'milestone';
  target: number;
  current: number;
  unit: 'sessions' | 'minutes' | 'entries' | 'score' | 'streak';
  deadline?: string;
  completed: boolean;
  completedAt?: string;
  rewards: string[];
}

// Conquista
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
  progress?: {
    current: number;
    target: number;
  };
  rewards: {
    points: number;
    badges: string[];
    unlocks: string[];
  };
}
```

### ⚙️ **Preferences Types**

```typescript
// Preferências do usuário
interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'pt-BR' | 'en-US' | 'es-ES';
  notifications: NotificationPreferences;
  accessibility: AccessibilityPreferences;
  privacy: PrivacyPreferences;
  dataRetention: DataRetentionPreferences;
  ui: UIPreferences;
}

// Preferências de notificação
interface NotificationPreferences {
  enabled: boolean;
  moodReminders: {
    enabled: boolean;
    times: string[]; // ["08:00", "14:00", "20:00"]
    days: number[]; // [1,2,3,4,5,6,7] (0=domingo)
  };
  breathingReminders: {
    enabled: boolean;
    frequency: 'daily' | 'twiceDaily' | 'custom';
    customTimes?: string[];
  };
  journalReminders: {
    enabled: boolean;
    time: string;
    days: number[];
  };
  achievementNotifications: boolean;
  weeklyReports: boolean;
  inactivityReminders: {
    enabled: boolean;
    daysThreshold: number;
  };
}

// Preferências de acessibilidade
interface AccessibilityPreferences {
  fontSize: 'small' | 'medium' | 'large' | 'extraLarge';
  contrast: 'normal' | 'high';
  reduceMotion: boolean;
  voiceOver: boolean;
  hapticFeedback: 'none' | 'light' | 'medium' | 'strong';
  colorBlindSupport: boolean;
  screenReader: boolean;
}

// Preferências de privacidade
interface PrivacyPreferences {
  dataCollection: {
    analytics: boolean;
    crashReports: boolean;
    performance: boolean;
    usage: boolean;
  };
  sharing: {
    allowProfileSharing: boolean;
    allowProgressSharing: boolean;
    allowAchievementSharing: boolean;
  };
  biometricAuth: boolean;
  dataRetentionPeriod: number; // dias
  anonymizeData: boolean;
}

// Retenção de dados
interface DataRetentionPreferences {
  moodData: number; // dias
  journalData: number;
  breathingData: number;
  predictionData: number;
  autoCleanup: boolean;
  backupBeforeCleanup: boolean;
}

// Preferências de UI
interface UIPreferences {
  homeLayout: 'cards' | 'list' | 'grid';
  animationSpeed: 'slow' | 'normal' | 'fast';
  soundEffects: boolean;
  vibrationFeedback: boolean;
  compactMode: boolean;
  showTips: boolean;
  tutorialCompleted: string[]; // IDs dos tutoriais concluídos
}
```

### 📊 **Statistics Types**

```typescript
// Estatísticas agregadas
interface AggregatedStats {
  overallWellnessScore: number; // 0-100
  totalSessions: number;
  totalMinutes: number;
  streakDays: number;
  longestStreak: number;
  
  moduleStats: ModuleStats[];
  
  trends: {
    wellnessScore: TrendData[];
    activity: TrendData[];
    mood: TrendData[];
  };
  
  insights: {
    mostActiveTime: string;
    preferredActivities: string[];
    improvementAreas: string[];
    achievements: string[];
  };
  
  goals: {
    completed: number;
    active: number;
    overdue: number;
  };
  
  lastUpdated: string;
}

// Estatísticas por módulo
interface ModuleStats {
  moduleId: string;
  moduleName: string;
  totalSessions: number;
  totalMinutes: number;
  averageScore?: number;
  lastUsed: string;
  weeklyUsage: number[];
  achievements: number;
  
  specific: {
    // Breathing
    techniquesUsed?: string[];
    averageSessionLength?: number;
    
    // Mood
    averageMood?: number;
    moodDistribution?: Record<string, number>;
    
    // Journal
    entriesCount?: number;
    averageWordCount?: number;
    cbtAnalyses?: number;
    
    // Prediction
    averageScore?: number;
    scoreImprovement?: number;
  };
}

// Relatório de progresso
interface ProgressReport {
  period: 'week' | 'month' | 'year';
  startDate: string;
  endDate: string;
  
  summary: {
    overallImprovement: number; // percentual
    goalsCompleted: number;
    newAchievements: number;
    totalEngagement: number; // minutos
  };
  
  moduleStats: ModuleStats[];
  
  insights: PersonalizedInsight[];
  
  recommendations: Recommendation[];
  
  nextGoals: WellnessGoal[];
}
```

---

## 🎨 Componentes UI Especializados

### 👤 **ProfileHeader**

```typescript
interface ProfileHeaderProps {
  profile: UserProfile | null;
  onAvatarPress: () => void;
  onEditPress: () => void;
}

const ProfileHeader = ({ profile, onAvatarPress, onEditPress }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onAvatarPress}>
      <Avatar 
        uri={profile?.avatar}
        name={profile?.name}
        size={80}
      />
    </TouchableOpacity>
    
    <View style={styles.info}>
      <Text style={styles.name}>{profile?.name}</Text>
      <Text style={styles.subtitle}>
        Membro desde {formatDate(profile?.createdAt)}
      </Text>
      <WellnessScoreBadge score={aggregatedStats?.overallWellnessScore} />
    </View>
    
    <TouchableOpacity onPress={onEditPress}>
      <Icon name="edit" size={24} />
    </TouchableOpacity>
  </View>
);
```

### 📊 **WellnessDashboard**

```typescript
interface WellnessDashboardProps {
  stats: AggregatedStats | null;
}

const WellnessDashboard = ({ stats }) => (
  <View style={styles.dashboard}>
    <Text style={styles.title}>Dashboard de Bem-estar</Text>
    
    <View style={styles.scoreContainer}>
      <CircularProgress 
        value={stats?.overallWellnessScore || 0}
        maxValue={100}
        radius={60}
        activeStrokeColor={getScoreColor(stats?.overallWellnessScore)}
      />
      <Text style={styles.scoreLabel}>Score Geral</Text>
    </View>
    
    <View style={styles.quickStats}>
      <StatCard 
        title="Sessões"
        value={stats?.totalSessions || 0}
        icon="activity"
      />
      <StatCard 
        title="Minutos"
        value={stats?.totalMinutes || 0}
        icon="clock"
      />
      <StatCard 
        title="Sequência"
        value={stats?.streakDays || 0}
        icon="fire"
      />
    </View>
  </View>
);
```

### 🎯 **GoalsSection**

```typescript
interface GoalsSectionProps {
  goals: WellnessGoal[];
  onGoalPress: (goal: WellnessGoal) => void;
  onAddGoal: () => void;
}

const GoalsSection = ({ goals, onGoalPress, onAddGoal }) => (
  <View style={styles.section}>
    <SectionHeader 
      title="Metas de Bem-estar"
      action={{ title: "Adicionar", onPress: onAddGoal }}
    />
    
    {goals.map(goal => (
      <GoalCard 
        key={goal.id}
        goal={goal}
        onPress={() => onGoalPress(goal)}
      />
    ))}
    
    {goals.length === 0 && (
      <EmptyState 
        title="Nenhuma meta definida"
        subtitle="Defina metas para acompanhar seu progresso"
        action={{ title: "Adicionar Meta", onPress: onAddGoal }}
      />
    )}
  </View>
);
```

### 🏆 **AchievementsSection**

```typescript
interface AchievementsSectionProps {
  achievements: Achievement[];
  onAchievementPress: (achievement: Achievement) => void;
}

const AchievementsSection = ({ achievements, onAchievementPress }) => {
  const unlockedAchievements = achievements.filter(a => a.unlockedAt);
  const lockedAchievements = achievements.filter(a => !a.unlockedAt);
  
  return (
    <View style={styles.section}>
      <SectionHeader title="Conquistas" />
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {unlockedAchievements.map(achievement => (
          <AchievementBadge 
            key={achievement.id}
            achievement={achievement}
            unlocked={true}
            onPress={() => onAchievementPress(achievement)}
          />
        ))}
        
        {lockedAchievements.slice(0, 3).map(achievement => (
          <AchievementBadge 
            key={achievement.id}
            achievement={achievement}
            unlocked={false}
            onPress={() => onAchievementPress(achievement)}
          />
        ))}
      </ScrollView>
    </View>
  );
};
```

---

## ⚙️ Settings Components

### 🎨 **ThemeSelector**

```typescript
interface ThemeSelectorProps {
  value: 'light' | 'dark' | 'auto';
  onChange: (theme: 'light' | 'dark' | 'auto') => void;
}

const ThemeSelector = ({ value, onChange }) => (
  <SettingsRow title="Tema">
    <SegmentedControl
      values={[
        { label: 'Claro', value: 'light' },
        { label: 'Escuro', value: 'dark' },
        { label: 'Auto', value: 'auto' },
      ]}
      selectedValue={value}
      onChange={onChange}
    />
  </SettingsRow>
);
```

### 🔔 **NotificationSettings**

```typescript
interface NotificationSettingsProps {
  preferences: NotificationPreferences;
  onChange: (preferences: NotificationPreferences) => void;
}

const NotificationSettings = ({ preferences, onChange }) => (
  <View>
    <SettingsSwitch
      title="Ativar Notificações"
      value={preferences.enabled}
      onChange={(enabled) => onChange({ ...preferences, enabled })}
    />
    
    {preferences.enabled && (
      <>
        <SettingsRow title="Lembretes de Humor">
          <NotificationTimePicker
            enabled={preferences.moodReminders.enabled}
            times={preferences.moodReminders.times}
            days={preferences.moodReminders.days}
            onChange={(moodReminders) => onChange({ ...preferences, moodReminders })}
          />
        </SettingsRow>
        
        <SettingsRow title="Lembretes de Respiração">
          <BreathingReminderSettings
            preferences={preferences.breathingReminders}
            onChange={(breathingReminders) => onChange({ ...preferences, breathingReminders })}
          />
        </SettingsRow>
        
        <SettingsSwitch
          title="Conquistas"
          value={preferences.achievementNotifications}
          onChange={(achievementNotifications) => onChange({ ...preferences, achievementNotifications })}
        />
      </>
    )}
  </View>
);
```

### 🔐 **PrivacySettings**

```typescript
interface PrivacySettingsProps {
  preferences: PrivacyPreferences;
  onChange: (preferences: PrivacyPreferences) => void;
}

const PrivacySettings = ({ preferences, onChange }) => (
  <View>
    <SettingsSection title="Coleta de Dados">
      <SettingsSwitch
        title="Analytics"
        subtitle="Ajuda a melhorar o aplicativo"
        value={preferences.dataCollection.analytics}
        onChange={(analytics) => onChange({
          ...preferences,
          dataCollection: { ...preferences.dataCollection, analytics }
        })}
      />
      
      <SettingsSwitch
        title="Relatórios de Crash"
        value={preferences.dataCollection.crashReports}
        onChange={(crashReports) => onChange({
          ...preferences,
          dataCollection: { ...preferences.dataCollection, crashReports }
        })}
      />
    </SettingsSection>
    
    <SettingsSection title="Compartilhamento">
      <SettingsSwitch
        title="Permitir Compartilhamento de Progresso"
        value={preferences.sharing.allowProgressSharing}
        onChange={(allowProgressSharing) => onChange({
          ...preferences,
          sharing: { ...preferences.sharing, allowProgressSharing }
        })}
      />
    </SettingsSection>
    
    <SettingsSection title="Segurança">
      <SettingsSwitch
        title="Autenticação Biométrica"
        value={preferences.biometricAuth}
        onChange={(biometricAuth) => onChange({ ...preferences, biometricAuth })}
      />
      
      <SettingsRow title="Anonimizar Dados">
        <Switch 
          value={preferences.anonymizeData}
          onValueChange={(anonymizeData) => onChange({ ...preferences, anonymizeData })}
        />
      </SettingsRow>
    </SettingsSection>
  </View>
);
```

---

## 🧪 Testing Strategy

### ✅ **Cobertura Atual: 60%**

### 🎯 **Unit Tests**

```typescript
// ProfileService.test.ts
describe('ProfileService', () => {
  test('creates new profile correctly', async () => {
    const profileData = {
      name: 'Test User',
      email: 'test@example.com',
      goals: [],
    };
    
    const profile = await ProfileService.createProfile(profileData);
    
    expect(profile).toMatchObject(profileData);
    expect(profile.id).toBeDefined();
    expect(profile.createdAt).toBeDefined();
  });
  
  test('updates profile preferences', async () => {
    const updates = { theme: 'dark' as const };
    
    await ProfileService.updatePreferences(updates);
    const preferences = await ProfileService.getPreferences();
    
    expect(preferences.theme).toBe('dark');
  });
  
  test('calculates aggregated stats correctly', async () => {
    // Mock data from other modules
    const stats = await ProfileService.getAggregatedStats();
    
    expect(stats.overallWellnessScore).toBeGreaterThanOrEqual(0);
    expect(stats.overallWellnessScore).toBeLessThanOrEqual(100);
    expect(stats.moduleStats).toBeInstanceOf(Array);
  });
});
```

### 🎯 **Hook Tests**

```typescript
// useProfile.test.ts
describe('useProfile Hook', () => {
  test('loads profile on mount', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useProfile());
    
    await waitForNextUpdate();
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.profile).toBeTruthy();
  });
  
  test('updates profile correctly', async () => {
    const { result } = renderHook(() => useProfile());
    
    await act(async () => {
      await result.current.updateProfile({ name: 'Updated Name' });
    });
    
    expect(result.current.profile?.name).toBe('Updated Name');
  });
});
```

### 🎯 **Component Tests**

```typescript
// ProfileScreen.test.tsx
describe('ProfileScreen', () => {
  test('renders profile information', () => {
    const mockProfile = {
      id: '1',
      name: 'Test User',
      createdAt: '2025-01-01',
    };
    
    render(<ProfileScreen />, {
      preloadedState: { profile: mockProfile }
    });
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText(/Membro desde/)).toBeInTheDocument();
  });
  
  test('navigates to settings when pressed', () => {
    const mockNavigate = jest.fn();
    jest.mock('@react-navigation/native', () => ({
      useNavigation: () => ({ navigate: mockNavigate }),
    }));
    
    render(<ProfileScreen />);
    
    fireEvent.press(screen.getByText('Configurações'));
    expect(mockNavigate).toHaveBeenCalledWith('Settings');
  });
});
```

---

## 🚀 Performance Optimizations

### ⚡ **Current Optimizations**

1. **Lazy Loading**
   ```typescript
   const StatsScreen = React.lazy(() => import('./StatsScreen'));
   const SettingsScreen = React.lazy(() => import('./SettingsScreen'));
   
   // Usage with Suspense
   <Suspense fallback={<ProfileSkeleton />}>
     <StatsScreen />
   </Suspense>
   ```

2. **Memoized Calculations**
   ```typescript
   const aggregatedStats = useMemo(() => {
     if (!rawData) return null;
     return calculateAggregatedStats(rawData);
   }, [rawData]);
   
   const sortedAchievements = useMemo(() => {
     return achievements.sort((a, b) => {
       if (a.unlockedAt && !b.unlockedAt) return -1;
       if (!a.unlockedAt && b.unlockedAt) return 1;
       return new Date(b.unlockedAt || 0).getTime() - new Date(a.unlockedAt || 0).getTime();
     });
   }, [achievements]);
   ```

3. **Optimized Storage**
   ```typescript
   // Batch multiple updates
   const updateProfileBatch = async (updates: ProfileUpdate[]) => {
     const currentProfile = await getProfile();
     const updatedProfile = updates.reduce((acc, update) => ({ ...acc, ...update }), currentProfile);
     await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(updatedProfile));
   };
   ```

4. **Image Optimization**
   ```typescript
   // Optimized avatar handling
   const optimizeAvatar = async (imageUri: string): Promise<string> => {
     const resized = await ImageManipulator.manipulateAsync(
       imageUri,
       [{ resize: { width: 200, height: 200 } }],
       { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
     );
     return resized.uri;
   };
   ```

### 📊 **Performance Metrics**

- **Profile Load Time:** <1s
- **Settings Update:** <200ms
- **Stats Calculation:** <500ms
- **Avatar Upload:** <3s
- **Data Export:** <5s (depending on data size)

---

## 🔮 Future Enhancements

### 🎯 **Phase 2 - Advanced Features**

**Gamification Enhancement:**

```typescript
interface GamificationSystem {
  // Sistema de pontos
  pointsSystem: {
    dailyLogin: number;
    sessionCompletion: number;
    goalAchievement: number;
    streakBonus: number;
  };
  
  // Níveis do usuário
  userLevels: {
    level: number;
    title: string;
    requiredPoints: number;
    benefits: string[];
  }[];
  
  // Challenges sociais
  socialChallenges: {
    weeklyChallenge: Challenge;
    monthlyChallenge: Challenge;
    communityGoals: CommunityGoal[];
  };
}
```

**Social Features:**

```typescript
interface SocialFeatures {
  // Amigos e seguidores
  friends: Friend[];
  followers: Follower[];
  following: Following[];
  
  // Compartilhamento
  shareProgress: (moduleId: string, progress: Progress) => Promise<void>;
  shareAchievement: (achievement: Achievement) => Promise<void>;
  
  // Leaderboards
  getLeaderboard: (category: string, period: 'week' | 'month' | 'all') => Promise<LeaderboardEntry[]>;
  
  // Grupos de apoio
  supportGroups: SupportGroup[];
  joinGroup: (groupId: string) => Promise<void>;
}
```

### 🤖 **Phase 3 - AI Integration**

**Personalized Insights:**

```typescript
interface AIInsights {
  // Análise de padrões
  patternAnalysis: {
    optimalTimes: string[];
    preferredActivities: string[];
    moodTriggers: string[];
    improvementOpportunities: string[];
  };
  
  // Recomendações personalizadas
  recommendations: {
    nextSession: RecommendedSession;
    goalSuggestions: WellnessGoal[];
    interventions: Intervention[];
  };
  
  // Predições
  predictions: {
    moodForecast: MoodPrediction[];
    riskAssessment: RiskAssessment;
    goalLikelihood: GoalPrediction[];
  };
}
```

### 🏥 **Phase 4 - Professional Integration**

**Clinical Features:**

```typescript
interface ClinicalIntegration {
  // Relatórios clínicos
  generateClinicalReport: (period: string) => Promise<ClinicalReport>;
  
  // Compartilhamento com profissionais
  shareWithTherapist: (therapistId: string, data: ClinicalData) => Promise<void>;
  
  // Monitoramento de progresso
  professionalDashboard: {
    patientProgress: PatientProgress[];
    alerts: ClinicalAlert[];
    recommendations: ProfessionalRecommendation[];
  };
  
  // Compliance
  hipaaCompliance: boolean;
  lgpdCompliance: boolean;
  dataEncryption: boolean;
}
```

---

## 🔐 Security & Privacy

### 🛡️ **Data Protection**

1. **Local Encryption**
   ```typescript
   import { encrypt, decrypt } from '@/utils/encryption';
   
   const saveSecureProfile = async (profile: UserProfile) => {
     const encrypted = encrypt(JSON.stringify(profile), userKey);
     await SecureStore.setItemAsync(PROFILE_KEY, encrypted);
   };
   
   const loadSecureProfile = async (): Promise<UserProfile | null> => {
     const encrypted = await SecureStore.getItemAsync(PROFILE_KEY);
     if (!encrypted) return null;
     
     const decrypted = decrypt(encrypted, userKey);
     return JSON.parse(decrypted);
   };
   ```

2. **Biometric Authentication**
   ```typescript
   import * as LocalAuthentication from 'expo-local-authentication';
   
   const authenticateUser = async (): Promise<boolean> => {
     const hasHardware = await LocalAuthentication.hasHardwareAsync();
     const isEnrolled = await LocalAuthentication.isEnrolledAsync();
     
     if (hasHardware && isEnrolled) {
       const result = await LocalAuthentication.authenticateAsync({
         promptMessage: 'Autentique-se para acessar seu perfil',
         fallbackLabel: 'Usar senha',
       });
       return result.success;
     }
     
     return false;
   };
   ```

3. **Data Anonymization**
   ```typescript
   const anonymizeProfileData = (profile: UserProfile): AnonymizedProfile => ({
     id: hashString(profile.id),
     ageGroup: getAgeGroup(profile.dateOfBirth),
     region: getRegion(profile.location),
     preferences: profile.preferences,
     // Remove dados pessoais identificáveis
   });
   ```

### 🔒 **Privacy Controls**

```typescript
interface PrivacyControls {
  // Controle de dados
  dataRetention: {
    setRetentionPeriod: (days: number) => Promise<void>;
    scheduleDataCleanup: () => Promise<void>;
    exportDataBeforeCleanup: boolean;
  };
  
  // Controle de acesso
  accessControl: {
    requireBiometric: boolean;
    sessionTimeout: number;
    autoLock: boolean;
  };
  
  // Controle de compartilhamento
  sharingControl: {
    allowAnalytics: boolean;
    allowCrashReports: boolean;
    allowPerformanceData: boolean;
    allowUsageData: boolean;
  };
}
```

---

## 📚 Integration with Other Modules

### 🔗 **Module Data Aggregation**

```typescript
// Coleta dados de todos os módulos
const aggregateModuleData = async (): Promise<AggregatedStats> => {
  const [moodStats, breathingStats, journalStats, predictionStats] = await Promise.all([
    MoodService.getStats(),
    BreathingService.getStats(),
    JournalService.getStats(),
    PredictionService.getStats(),
  ]);
  
  return {
    overallWellnessScore: calculateOverallScore([moodStats, breathingStats, journalStats, predictionStats]),
    totalSessions: sum([moodStats.totalSessions, breathingStats.totalSessions, journalStats.totalSessions]),
    totalMinutes: sum([breathingStats.totalMinutes]),
    moduleStats: [
      { moduleId: 'mood', ...moodStats },
      { moduleId: 'breathing', ...breathingStats },
      { moduleId: 'journal', ...journalStats },
      { moduleId: 'prediction', ...predictionStats },
    ],
    // ... outras métricas agregadas
  };
};
```

### 🎯 **Goal Tracking Integration**

```typescript
// Acompanha progresso de metas através dos módulos
const trackGoalProgress = async (goal: WellnessGoal): Promise<GoalProgress> => {
  switch (goal.category) {
    case 'mood':
      const moodEntries = await MoodService.getEntries();
      return calculateMoodGoalProgress(goal, moodEntries);
      
    case 'breathing':
      const breathingSessions = await BreathingService.getSessions();
      return calculateBreathingGoalProgress(goal, breathingSessions);
      
    case 'journal':
      const journalEntries = await JournalService.getEntries();
      return calculateJournalGoalProgress(goal, journalEntries);
      
    // ... outros módulos
      
    default:
      return { current: 0, target: goal.target, percentage: 0 };
  }
};
```

### 🏆 **Achievement System Integration**

```typescript
// Sistema de conquistas cross-module
const checkAchievements = async (): Promise<Achievement[]> => {
  const newAchievements: Achievement[] = [];
  
  // Conquista: Primeira semana completa
  const weekStreak = await calculateWeekStreak();
  if (weekStreak >= 7) {
    newAchievements.push(achievements.firstWeekComplete);
  }
  
  // Conquista: Master de todas as funcionalidades
  const moduleUsage = await getModuleUsage();
  if (moduleUsage.every(m => m.sessionsCount > 0)) {
    newAchievements.push(achievements.allModulesMaster);
  }
  
  // Conquista: Streak de 30 dias
  const overallStreak = await calculateOverallStreak();
  if (overallStreak >= 30) {
    newAchievements.push(achievements.monthStreak);
  }
  
  return newAchievements;
};
```

---

## 📄 License & Contributing

This module is part of the PulseZen mobile application.

### 🔧 **Development Setup**

```bash
# Install dependencies
npm install

# Run profile-specific tests
npm run test:profile

# Run in development mode
npm run dev:profile
```

### 📋 **Contributing Guidelines**

1. **Code Standards**
   - TypeScript strict mode
   - ESLint + Prettier compliance
   - 80%+ test coverage for new features
   - Documentation for all public APIs

2. **Privacy-First Development**
   - Always consider privacy implications
   - Implement data minimization
   - Encrypt sensitive data
   - Provide clear consent mechanisms

3. **Accessibility Requirements**
   - Support screen readers
   - Provide proper contrast ratios
   - Implement keyboard navigation
   - Test with accessibility tools

---

**Last Updated:** August 12, 2025  
**Version:** 1.5.0  
**Status:** ✅ Functional - Ready for Completion  
**Next Milestone:** API Integration & Gamification (Phase 2)
