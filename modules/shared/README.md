# 🔗 PulseZen Shared Module

## 📊 Status: ✅ **UTILITIES - PRODUCTION READY**

O módulo Shared contém componentes, utilitários, tipos e constantes compartilhados entre todos os módulos do PulseZen, promovendo reutilização de código e consistência na aplicação.

---

## 🏗️ Arquitetura

### 📦 Estrutura do Módulo

```
modules/shared/
├── README.md                    # 📖 Este documento  
├── index.ts                     # 🔄 Exports principais
├── components/                  # 🧩 Componentes reutilizáveis
│   ├── base/                    # Componentes base
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── index.ts
│   ├── layout/                  # Componentes de layout
│   │   ├── ScreenContainer.tsx
│   │   ├── Section.tsx
│   │   ├── Header.tsx
│   │   └── index.ts
│   ├── feedback/                # Componentes de feedback
│   │   ├── LoadingSpinner.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── index.ts
│   ├── navigation/              # Componentes de navegação
│   │   ├── TabBar.tsx
│   │   ├── BackButton.tsx
│   │   └── index.ts
│   └── index.ts
├── hooks/                       # 🎣 Hooks compartilhados
│   ├── useTheme.ts             # Theme management
│   ├── useResponsive.ts        # Responsive utilities
│   ├── useAccessibility.ts     # Accessibility helpers
│   ├── usePerformance.ts       # Performance monitoring
│   ├── useNetwork.ts           # Network state
│   └── index.ts
├── utils/                       # 🛠️ Utilitários
│   ├── validation.ts           # Validação de dados
│   ├── formatting.ts           # Formatação
│   ├── storage.ts              # Storage helpers
│   ├── analytics.ts            # Analytics helpers
│   ├── permissions.ts          # Permissions management
│   └── index.ts
├── types/                       # 📝 Types compartilhados
│   ├── common.ts               # Tipos comuns
│   ├── api.ts                  # Tipos de API
│   ├── navigation.ts           # Tipos de navegação
│   └── index.ts
├── constants/                   # 📋 Constantes globais
│   ├── storage.ts              # Chaves de storage
│   ├── endpoints.ts            # Endpoints da API
│   ├── permissions.ts          # Constantes de permissões
│   └── index.ts
└── services/                    # 🔧 Serviços compartilhados
    ├── ApiClient.ts            # Cliente HTTP base
    ├── StorageService.ts       # Serviço de storage
    ├── AnalyticsService.ts     # Serviço de analytics
    ├── PermissionsService.ts   # Gerenciamento de permissões
    └── index.ts
```

---

## 🧩 Componentes Base

### 🔘 **Button Component**

Componente base para todos os botões da aplicação:

```typescript
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  testID?: string;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  testID,
}) => {
  // Implementation
};

// Uso
<Button 
  title="Salvar"
  onPress={handleSave}
  variant="primary"
  size="large"
  icon="save"
  loading={isLoading}
/>
```

### 🃏 **Card Component**

Container base para conteúdo agrupado:

```typescript
interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  margin?: 'none' | 'small' | 'medium' | 'large';
  onPress?: () => void;
  testID?: string;
  style?: ViewStyle;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  margin = 'none',
  onPress,
  testID,
  style,
}) => {
  // Implementation
};

// Uso
<Card variant="elevated" padding="large" onPress={handleCardPress}>
  <Text>Conteúdo do card</Text>
</Card>
```

### 📝 **Input Component**

Campo de entrada padronizado:

```typescript
interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  secureTextEntry?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  testID?: string;
}

const Input: React.FC<InputProps> = (props) => {
  // Implementation
};

// Uso
<Input
  label="Nome"
  placeholder="Digite seu nome"
  value={name}
  onChangeText={setName}
  variant="outlined"
  leftIcon="user"
  error={nameError}
/>
```

### 🪟 **Modal Component**

Modal base com animações e acessibilidade:

```typescript
interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  position?: 'center' | 'bottom' | 'top';
  backdropClosable?: boolean;
  showCloseButton?: boolean;
  children: React.ReactNode;
  testID?: string;
}

const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  size = 'medium',
  position = 'center',
  backdropClosable = true,
  showCloseButton = true,
  children,
  testID,
}) => {
  // Implementation with animations and accessibility
};

// Uso
<Modal
  visible={showModal}
  onClose={() => setShowModal(false)}
  title="Configurações"
  size="large"
  position="bottom"
>
  <SettingsContent />
</Modal>
```

---

## 🏗️ Layout Components

### 📱 **ScreenContainer**

Container base para todas as telas:

```typescript
interface ScreenContainerProps {
  children: React.ReactNode;
  background?: 'default' | 'gradient' | 'image';
  gradientColors?: string[];
  backgroundImage?: string;
  safeArea?: boolean;
  scrollable?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  testID?: string;
}

const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  background = 'default',
  gradientColors,
  backgroundImage,
  safeArea = true,
  scrollable = false,
  refreshing = false,
  onRefresh,
  header,
  footer,
  testID,
}) => {
  // Implementation
};

// Uso
<ScreenContainer 
  background="gradient"
  gradientColors={['#667eea', '#764ba2']}
  scrollable={true}
  header={<Header title="Perfil" />}
>
  <ProfileContent />
</ScreenContainer>
```

### 📄 **Section**

Componente para organizar conteúdo em seções:

```typescript
interface SectionProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  spacing?: 'none' | 'small' | 'medium' | 'large';
  action?: {
    title: string;
    onPress: () => void;
  };
  collapsible?: boolean;
  defaultExpanded?: boolean;
  testID?: string;
}

const Section: React.FC<SectionProps> = (props) => {
  // Implementation
};

// Uso
<Section 
  title="Estatísticas"
  subtitle="Seu progresso este mês"
  action={{ title: "Ver mais", onPress: handleViewMore }}
  collapsible={true}
>
  <StatsCards />
</Section>
```

### 🎯 **Header**

Header padronizado para telas:

```typescript
interface HeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: {
    icon: string;
    onPress: () => void;
    accessibilityLabel?: string;
  };
  rightAction?: {
    icon: string;
    onPress: () => void;
    accessibilityLabel?: string;
  };
  variant?: 'default' | 'large' | 'minimal';
  showBackButton?: boolean;
  onBackPress?: () => void;
  testID?: string;
}

const Header: React.FC<HeaderProps> = (props) => {
  // Implementation
};

// Uso
<Header
  title="Configurações"
  subtitle="Personalize sua experiência"
  leftAction={{ icon: "back", onPress: handleBack }}
  rightAction={{ icon: "save", onPress: handleSave }}
  showBackButton={true}
/>
```

---

## 🔔 Feedback Components

### ⏳ **LoadingSpinner**

Indicador de carregamento padronizado:

```typescript
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  message?: string;
  overlay?: boolean;
  testID?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color,
  message,
  overlay = false,
  testID,
}) => {
  // Implementation
};

// Uso
<LoadingSpinner 
  size="large"
  message="Carregando dados..."
  overlay={true}
/>
```

### 📭 **EmptyState**

Estado vazio padronizado:

```typescript
interface EmptyStateProps {
  title: string;
  subtitle?: string;
  icon?: string;
  illustration?: string;
  action?: {
    title: string;
    onPress: () => void;
  };
  testID?: string;
}

const EmptyState: React.FC<EmptyStateProps> = (props) => {
  // Implementation
};

// Uso
<EmptyState
  title="Nenhuma entrada encontrada"
  subtitle="Comece escrevendo sua primeira entrada no diário"
  icon="journal"
  action={{ title: "Criar entrada", onPress: handleCreate }}
/>
```

### 🚫 **ErrorBoundary**

Boundary para captura de erros:

```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorBoundaryState>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Implementation
}

// Uso
<ErrorBoundary onError={logError}>
  <SomeComponent />
</ErrorBoundary>
```

---

## 🎣 Hooks Compartilhados

### 🎨 **useTheme**

Hook para gerenciamento de tema:

```typescript
interface ThemeHook {
  theme: 'light' | 'dark' | 'auto';
  colors: ColorScheme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
}

const useTheme = (): ThemeHook => {
  // Implementation
};

// Uso
const { colors, isDark, toggleTheme } = useTheme();
```

### 📱 **useResponsive**

Hook para responsividade:

```typescript
interface ResponsiveHook {
  screenSize: 'small' | 'medium' | 'large' | 'xlarge';
  isTablet: boolean;
  isPhone: boolean;
  orientation: 'portrait' | 'landscape';
  dimensions: {
    width: number;
    height: number;
  };
  safeArea: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

const useResponsive = (): ResponsiveHook => {
  // Implementation
};

// Uso
const { isTablet, screenSize, dimensions } = useResponsive();
```

### ♿ **useAccessibility**

Hook para funcionalidades de acessibilidade:

```typescript
interface AccessibilityHook {
  isScreenReaderEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isHighContrastEnabled: boolean;
  preferredContentSize: 'small' | 'medium' | 'large' | 'xlarge';
  announceForScreenReader: (message: string) => void;
  focusElement: (ref: React.RefObject<any>) => void;
}

const useAccessibility = (): AccessibilityHook => {
  // Implementation
};

// Uso
const { isScreenReaderEnabled, announceForScreenReader } = useAccessibility();
```

### 📊 **usePerformance**

Hook para monitoramento de performance:

```typescript
interface PerformanceHook {
  startTimer: (name: string) => void;
  endTimer: (name: string) => number;
  measureComponent: (name: string) => void;
  getMetrics: () => PerformanceMetrics;
  reportMetrics: () => void;
}

interface PerformanceMetrics {
  renderTimes: Record<string, number>;
  memoryUsage: number;
  componentCounts: Record<string, number>;
}

const usePerformance = (): PerformanceHook => {
  // Implementation
};

// Uso
const { startTimer, endTimer, measureComponent } = usePerformance();
```

### 🌐 **useNetwork**

Hook para estado da rede:

```typescript
interface NetworkHook {
  isConnected: boolean;
  isInternetReachable: boolean;
  connectionType: 'wifi' | 'cellular' | 'none' | 'unknown';
  isExpensive: boolean;
  onConnectionChange: (callback: (state: NetworkState) => void) => () => void;
}

const useNetwork = (): NetworkHook => {
  // Implementation
};

// Uso
const { isConnected, connectionType } = useNetwork();
```

---

## 🛠️ Utilitários

### ✅ **Validation Utils**

```typescript
// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password strength
export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  // Implementation
};

// Required field validation
export const isRequired = (value: any): boolean => {
  return value !== null && value !== undefined && value !== '';
};

// Zod schema helpers
export const createValidationSchema = <T>(fields: ValidationFields<T>) => {
  // Implementation using Zod
};
```

### 📅 **Formatting Utils**

```typescript
// Date formatting
export const formatDate = (date: string | Date, format?: 'short' | 'long' | 'relative'): string => {
  // Implementation
};

// Number formatting
export const formatNumber = (number: number, options?: Intl.NumberFormatOptions): string => {
  // Implementation
};

// Duration formatting
export const formatDuration = (seconds: number): string => {
  // Implementation (e.g., "2m 30s")
};

// Currency formatting
export const formatCurrency = (amount: number, currency?: string): string => {
  // Implementation
};

// File size formatting
export const formatFileSize = (bytes: number): string => {
  // Implementation (e.g., "1.2 MB")
};
```

### 💾 **Storage Utils**

```typescript
// Secure storage
export const secureStorage = {
  setItem: async (key: string, value: string): Promise<void> => {
    // Implementation with encryption
  },
  getItem: async (key: string): Promise<string | null> => {
    // Implementation with decryption
  },
  removeItem: async (key: string): Promise<void> => {
    // Implementation
  },
  clear: async (): Promise<void> => {
    // Implementation
  },
};

// Regular storage with TTL
export const storage = {
  setItem: async (key: string, value: any, ttl?: number): Promise<void> => {
    // Implementation with TTL
  },
  getItem: async <T>(key: string): Promise<T | null> => {
    // Implementation with TTL check
  },
  removeItem: async (key: string): Promise<void> => {
    // Implementation
  },
  clear: async (): Promise<void> => {
    // Implementation
  },
};

// Cache with LRU
export const cache = {
  set: (key: string, value: any, ttl?: number): void => {
    // LRU cache implementation
  },
  get: <T>(key: string): T | null => {
    // Implementation
  },
  invalidate: (pattern: string): void => {
    // Implementation
  },
  clear: (): void => {
    // Implementation
  },
};
```

### 📈 **Analytics Utils**

```typescript
// Event tracking
export const trackEvent = (eventName: string, properties?: Record<string, any>): void => {
  // Implementation
};

// Screen tracking
export const trackScreen = (screenName: string, properties?: Record<string, any>): void => {
  // Implementation
};

// User identification
export const identifyUser = (userId: string, traits?: Record<string, any>): void => {
  // Implementation
};

// Performance tracking
export const trackPerformance = (metricName: string, value: number, unit?: string): void => {
  // Implementation
};

// Error tracking
export const trackError = (error: Error, context?: Record<string, any>): void => {
  // Implementation
};
```

### 🔒 **Permissions Utils**

```typescript
// Permission checking
export const checkPermission = async (permission: Permission): Promise<PermissionStatus> => {
  // Implementation
};

// Permission requesting
export const requestPermission = async (permission: Permission): Promise<PermissionStatus> => {
  // Implementation
};

// Multiple permissions
export const requestMultiplePermissions = async (permissions: Permission[]): Promise<Record<Permission, PermissionStatus>> => {
  // Implementation
};

// Permission status
export const getPermissionStatus = async (permission: Permission): Promise<PermissionStatus> => {
  // Implementation
};
```

---

## 📝 Types Compartilhados

### 🌐 **API Types**

```typescript
// Base API response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
  meta?: ApiMeta;
}

// API error
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  field?: string;
}

// API metadata
export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  hasMore?: boolean;
}

// Request configuration
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
  retries: number;
  retryDelay: number;
}
```

### 🧭 **Navigation Types**

```typescript
// Stack navigation
export type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  Breathing: { techniqueId?: string };
  Journal: { entryId?: string };
  Mood: { period?: 'manha' | 'tarde' | 'noite' };
  SOS: undefined;
  Prediction: undefined;
};

// Tab navigation
export type TabParamList = {
  Home: undefined;
  Breathing: undefined;
  Journal: undefined;
  Profile: undefined;
};

// Navigation props
export type NavigationProps<T extends keyof RootStackParamList> = {
  navigation: NavigationProp<RootStackParamList, T>;
  route: RouteProp<RootStackParamList, T>;
};
```

### 🎨 **Theme Types**

```typescript
// Color scheme
export interface ColorScheme {
  primary: string;
  primaryVariant: string;
  secondary: string;
  secondaryVariant: string;
  background: string;
  surface: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  onPrimary: string;
  onSecondary: string;
  onBackground: string;
  onSurface: string;
  onError: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  border: string;
  divider: string;
}

// Typography
export interface Typography {
  heading1: TextStyle;
  heading2: TextStyle;
  heading3: TextStyle;
  body1: TextStyle;
  body2: TextStyle;
  caption: TextStyle;
  button: TextStyle;
}

// Spacing
export interface Spacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}
```

---

## 🔧 Serviços Compartilhados

### 🌐 **ApiClient**

Cliente HTTP base para todas as APIs:

```typescript
class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;
  
  constructor(config: ApiConfig) {
    // Implementation
  }
  
  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    // Implementation
  }
  
  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    // Implementation
  }
  
  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    // Implementation
  }
  
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    // Implementation
  }
  
  setAuthToken(token: string): void {
    // Implementation
  }
  
  clearAuthToken(): void {
    // Implementation
  }
}

// Usage
const apiClient = new ApiClient({
  baseURL: 'https://api.pulsezen.com',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  retries: 3,
  retryDelay: 1000,
});
```

### 💾 **StorageService**

Serviço unificado de armazenamento:

```typescript
class StorageService {
  // Secure storage for sensitive data
  async setSecure(key: string, value: string): Promise<void> {
    // Implementation using SecureStore
  }
  
  async getSecure(key: string): Promise<string | null> {
    // Implementation
  }
  
  // Regular storage with encryption
  async set(key: string, value: any, options?: StorageOptions): Promise<void> {
    // Implementation with optional encryption and TTL
  }
  
  async get<T>(key: string): Promise<T | null> {
    // Implementation with TTL check
  }
  
  async remove(key: string): Promise<void> {
    // Implementation
  }
  
  async clear(): Promise<void> {
    // Implementation
  }
  
  // Batch operations
  async multiSet(items: Array<[string, any]>): Promise<void> {
    // Implementation
  }
  
  async multiGet(keys: string[]): Promise<Record<string, any>> {
    // Implementation
  }
}
```

### 📊 **AnalyticsService**

Serviço de analytics unificado:

```typescript
class AnalyticsService {
  private providers: AnalyticsProvider[];
  
  constructor(providers: AnalyticsProvider[]) {
    // Implementation
  }
  
  identify(userId: string, traits?: Record<string, any>): void {
    // Implementation
  }
  
  track(event: string, properties?: Record<string, any>): void {
    // Implementation
  }
  
  screen(name: string, properties?: Record<string, any>): void {
    // Implementation
  }
  
  group(groupId: string, traits?: Record<string, any>): void {
    // Implementation
  }
  
  reset(): void {
    // Implementation
  }
  
  flush(): Promise<void> {
    // Implementation
  }
}
```

### 🔒 **PermissionsService**

Serviço de gerenciamento de permissões:

```typescript
class PermissionsService {
  async check(permission: Permission): Promise<PermissionStatus> {
    // Implementation
  }
  
  async request(permission: Permission): Promise<PermissionStatus> {
    // Implementation
  }
  
  async requestMultiple(permissions: Permission[]): Promise<Record<Permission, PermissionStatus>> {
    // Implementation
  }
  
  async openSettings(): Promise<void> {
    // Implementation
  }
  
  async shouldShowRationale(permission: Permission): Promise<boolean> {
    // Implementation
  }
}
```

---

## 📋 Constantes

### 🗄️ **Storage Keys**

```typescript
export const STORAGE_KEYS = {
  // User data
  USER_PROFILE: 'user_profile_v2',
  USER_PREFERENCES: 'user_preferences_v2',
  
  // Module data
  MOOD_ENTRIES: 'mood_entries_v2',
  BREATHING_SESSIONS: 'breathing_sessions_v2',
  JOURNAL_ENTRIES: 'journal_entries_v2',
  PREDICTION_DATA: 'prediction_data_v2',
  
  // App state
  ONBOARDING_COMPLETED: 'onboarding_completed_v1',
  LAST_APP_VERSION: 'last_app_version_v1',
  FEATURE_FLAGS: 'feature_flags_v1',
  
  // Cache
  API_CACHE: 'api_cache_v1',
  IMAGE_CACHE: 'image_cache_v1',
  
  // Security
  AUTH_TOKEN: 'auth_token_secure',
  BIOMETRIC_ENABLED: 'biometric_enabled_secure',
} as const;
```

### 🌐 **API Endpoints**

```typescript
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    REGISTER: '/auth/register',
  },
  
  // User
  USER: {
    PROFILE: '/user/profile',
    PREFERENCES: '/user/preferences',
    STATS: '/user/stats',
  },
  
  // Modules
  MOOD: {
    ENTRIES: '/mood/entries',
    STATS: '/mood/stats',
    VALIDATE: '/mood/validate',
  },
  
  BREATHING: {
    TECHNIQUES: '/breathing/techniques',
    SESSIONS: '/breathing/sessions',
    STATS: '/breathing/stats',
  },
  
  JOURNAL: {
    ENTRIES: '/journal/entries',
    PROMPTS: '/journal/prompts',
    ANALYSIS: '/journal/analysis',
  },
  
  PREDICTION: {
    CURRENT: '/prediction/current',
    HISTORY: '/prediction/history',
    FACTORS: '/prediction/factors',
  },
  
  SOS: {
    STRATEGIES: '/sos/strategies',
    CONTACTS: '/sos/contacts',
    SESSIONS: '/sos/sessions',
  },
} as const;
```

### 🔑 **Permissions**

```typescript
export const PERMISSIONS = {
  CAMERA: 'camera',
  MICROPHONE: 'microphone',
  LOCATION: 'location',
  NOTIFICATIONS: 'notifications',
  BIOMETRIC: 'biometric',
  STORAGE: 'storage',
  CONTACTS: 'contacts',
} as const;

export const PERMISSION_MESSAGES = {
  [PERMISSIONS.CAMERA]: {
    title: 'Acesso à Câmera',
    message: 'O PulseZen precisa acessar sua câmera para tirar fotos do perfil.',
    buttonPositive: 'Permitir',
    buttonNegative: 'Negar',
  },
  [PERMISSIONS.NOTIFICATIONS]: {
    title: 'Notificações',
    message: 'Permitir notificações para lembretes de bem-estar?',
    buttonPositive: 'Sim',
    buttonNegative: 'Não',
  },
  // ... outras mensagens
} as const;
```

---

## 🧪 Testing Utilities

### 🔧 **Test Helpers**

```typescript
// Render with providers
export const renderWithProviders = (
  component: React.ReactElement,
  options?: RenderOptions
) => {
  const AllProviders = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>
      <NavigationContainer>
        <SafeAreaProvider>
          {children}
        </SafeAreaProvider>
      </NavigationContainer>
    </ThemeProvider>
  );
  
  return render(component, { wrapper: AllProviders, ...options });
};

// Mock navigation
export const createMockNavigation = (): Partial<NavigationProp<any>> => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  push: jest.fn(),
  pop: jest.fn(),
  reset: jest.fn(),
});

// Mock storage
export const createMockStorage = () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
});

// Wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Create test user
export const createTestUser = (overrides: Partial<UserProfile> = {}): UserProfile => ({
  id: 'test-user-1',
  name: 'Test User',
  email: 'test@example.com',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  goals: [],
  preferences: createDefaultPreferences(),
  ...overrides,
});
```

### 📊 **Performance Testing**

```typescript
// Measure component render time
export const measureRenderTime = (component: React.ReactElement): number => {
  const start = performance.now();
  render(component);
  const end = performance.now();
  return end - start;
};

// Memory usage testing
export const measureMemoryUsage = async (fn: () => Promise<void>): Promise<number> => {
  const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
  await fn();
  const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
  return finalMemory - initialMemory;
};

// Batch operation testing
export const testBatchOperations = async (operations: Array<() => Promise<void>>): Promise<number[]> => {
  const times: number[] = [];
  
  for (const operation of operations) {
    const start = performance.now();
    await operation();
    const end = performance.now();
    times.push(end - start);
  }
  
  return times;
};
```

---

## 🚀 Performance Optimizations

### ⚡ **Component Optimizations**

```typescript
// Memoized base components
export const Button = React.memo<ButtonProps>((props) => {
  // Implementation
});

export const Card = React.memo<CardProps>((props) => {
  // Implementation
});

// Optimized list rendering
export const OptimizedFlatList = <T,>({
  data,
  renderItem,
  keyExtractor,
  ...props
}: FlatListProps<T>) => (
  <FlatList
    data={data}
    renderItem={renderItem}
    keyExtractor={keyExtractor}
    removeClippedSubviews={true}
    maxToRenderPerBatch={10}
    updateCellsBatchingPeriod={100}
    windowSize={10}
    getItemLayout={getItemLayout}
    {...props}
  />
);

// Image optimization
export const OptimizedImage = React.memo<ImageProps>(({ source, ...props }) => {
  const [loaded, setLoaded] = useState(false);
  
  return (
    <View>
      {!loaded && <ImageSkeleton />}
      <Image
        source={source}
        onLoad={() => setLoaded(true)}
        style={[{ opacity: loaded ? 1 : 0 }, props.style]}
        {...props}
      />
    </View>
  );
});
```

### 🗂️ **Caching Strategies**

```typescript
// LRU Cache implementation
class LRUCache<T> {
  private capacity: number;
  private cache: Map<string, T>;
  
  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }
  
  get(key: string): T | null {
    if (!this.cache.has(key)) return null;
    
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }
  
  set(key: string, value: T): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, value);
  }
}

// Global cache instances
export const componentCache = new LRUCache<React.ComponentType>(50);
export const dataCache = new LRUCache<any>(100);
export const imageCache = new LRUCache<string>(200);
```

---

## 🔐 Security Best Practices

### 🛡️ **Input Sanitization**

```typescript
// HTML sanitization
export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
};

// SQL injection prevention
export const sanitizeSqlInput = (input: string): string => {
  return input.replace(/['"\\;]/g, '');
};

// XSS prevention
export const sanitizeUserInput = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};
```

### 🔒 **Encryption Utilities**

```typescript
// Data encryption
export const encrypt = (data: string, key: string): string => {
  // Implementation using crypto
};

export const decrypt = (encryptedData: string, key: string): string => {
  // Implementation using crypto
};

// Hash generation
export const generateHash = (data: string): string => {
  // Implementation using crypto
};

// Token validation
export const validateToken = (token: string): boolean => {
  // Implementation
};
```

---

## 📚 Documentation

### 📖 **Component Documentation**

Todos os componentes incluem:
- Descrição clara da funcionalidade
- Props interface com TypeScript
- Exemplos de uso
- Guidelines de acessibilidade
- Considerações de performance

### 🎯 **Best Practices**

1. **Naming Conventions**
   - Components: PascalCase (e.g., `Button`, `Card`)
   - Hooks: camelCase with "use" prefix (e.g., `useTheme`)
   - Utilities: camelCase (e.g., `formatDate`)
   - Constants: SCREAMING_SNAKE_CASE (e.g., `STORAGE_KEYS`)

2. **File Organization**
   - Index files for clean exports
   - Separate files for each component
   - Co-located tests and stories
   - Clear folder structure

3. **Performance**
   - Use React.memo for expensive components
   - Implement proper key props for lists
   - Lazy load heavy components
   - Optimize images and assets

4. **Accessibility**
   - Provide accessibility labels
   - Support keyboard navigation
   - Test with screen readers
   - Consider color contrast

---

## 🔄 Migration Guide

### 📈 **Upgrading Components**

```typescript
// Old usage (deprecated)
import { Button } from '@/components/Button';

// New usage (recommended)
import { Button } from '@/modules/shared';

// Or specific import
import { Button } from '@/modules/shared/components';
```

### 🎨 **Theme Migration**

```typescript
// Old theme access
import { colors } from '@/constants/theme';

// New theme access with hook
import { useTheme } from '@/modules/shared';
const { colors } = useTheme();
```

### 💾 **Storage Migration**

```typescript
// Old storage usage
import AsyncStorage from '@react-native-async-storage/async-storage';

// New storage service
import { StorageService } from '@/modules/shared';
await StorageService.set('key', value);
```

---

## 📄 License

This module is part of the PulseZen mobile application and provides foundational utilities and components for all other modules.

---

**Last Updated:** August 12, 2025  
**Version:** 2.0.0  
**Status:** ✅ Production Ready - Utilities Foundation  
**Dependencies:** React Native, Expo, TypeScript
