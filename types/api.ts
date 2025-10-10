// Base API response structure
export interface BaseApiResponse {
  success: boolean;
  message: string;
  timestamp?: string;
}

export interface ApiSuccessResponse<T = any> extends BaseApiResponse {
  success: true;
  data: T;
}

export interface ApiErrorResponse extends BaseApiResponse {
  success: false;
  message: string;
  error?: string;
  details?: Record<string, unknown>;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// User related types
export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  onboardingComplete?: boolean;
  createdAt?: string;
  updatedAt?: string;
  profile?: {
    firstName: string;
    lastName: string;
    onboardingCompleted: boolean;
    dateOfBirth?: string;
    goals?: string[];
    mentalHealthConcerns?: string[];
    preferredActivities?: string[];
    currentStressLevel?: number;
    sleepHours?: number;
    exerciseFrequency?: string;
    preferredContactMethod?: string;
    notificationPreferences?: {
      reminders: boolean;
      progress: boolean;
      tips: boolean;
    };
  };
}

export interface UserProfile {
  id: string;
  email: string;
  profile?: {
    firstName: string;
    lastName: string;
    onboardingCompleted: boolean;
    dateOfBirth?: string;
    sex?: string; // Add sex field
    age?: number; // Add age field
    goals?: string[];
    mentalHealthConcerns?: string[];
    preferredActivities?: string[];
    currentStressLevel?: number;
    sleepHours?: number;
    exerciseFrequency?: string;
    preferredContactMethod?: string;
    notificationPreferences?: {
      reminders: boolean;
      progress: boolean;
      tips: boolean;
    };
  };
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  password_confirmation: string;
  firstName: string;
  lastName: string;
}

export interface AuthTokens {
  token: string;
  refreshToken?: string;
  expiresAt?: string;
  tokenType?: string;
}

export interface AuthData {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface LoginResponse extends BaseApiResponse {
  data?: AuthData;
}

export interface RegisterResponse extends BaseApiResponse {
  data?: AuthData;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse extends BaseApiResponse {
  data?: AuthTokens;
}

// Onboarding types
export interface OnboardingData {
  dateOfBirth: string;
  goals: string[];
  mentalHealthConcerns: string[];
  preferredActivities: string[];
  currentStressLevel: number;
  sleepHours: number;
  exerciseFrequency: string;
  preferredContactMethod: string;
  notificationPreferences: {
    reminders: boolean;
    progress: boolean;
    tips: boolean;
  };
}

export interface OnboardingCompleteRequest {
  onboardingData: OnboardingData;
}

export interface OnboardingCompleteResponse extends BaseApiResponse {
  data?: {
    user: User;
    profile: UserProfile;
  };
}

// Network types
export interface NetworkRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  body?: unknown;
  cache?: boolean;
  cacheTtl?: number;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
}

export interface NetworkResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  status: number;
  cached?: boolean;
  retryCount?: number;
  duration?: number;
  headers?: Record<string, string>;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  context?: string;
}

export interface ValidationError extends AppError {
  code: 'VALIDATION_ERROR';
  field: string;
  rule: string;
}

export interface NetworkError extends AppError {
  code: 'NETWORK_ERROR';
  status?: number;
  url?: string;
}

export interface AuthError extends AppError {
  code: 'AUTH_ERROR';
  authAction?: 'login' | 'register' | 'refresh' | 'logout';
}

// Storage types
export interface StorageItem<T = any> {
  value: T;
  timestamp: number;
  ttl?: number;
}

// Navigation types
export interface NavigationState {
  isAuthenticated: boolean;
  onboardingComplete: boolean;
  currentRoute: string;
  previousRoute?: string;
}

// Context types
export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (userData: RegisterRequest) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  completeOnboarding: (onboardingData: OnboardingData) => Promise<{ success: boolean; message: string }>;
  updateProfile: (profileData: any) => Promise<{ success: boolean; message: string }>;
}

// Type guards for runtime validation
export function isApiSuccessResponse<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return response.success === true && 'data' in response;
}

export function isApiErrorResponse(response: ApiResponse): response is ApiErrorResponse {
  return response.success === false && 'error' in response;
}

export function isValidUser(data: unknown): data is User {
  return (
    data != null &&
    typeof data === 'object' &&
    'id' in data &&
    'email' in data &&
    'emailVerified' in data &&
    typeof (data as any).id === 'string' &&
    typeof (data as any).email === 'string' &&
    typeof (data as any).emailVerified === 'boolean'
  );
}

export function isValidAuthData(data: unknown): data is AuthData {
  return (
    data != null &&
    typeof data === 'object' &&
    'user' in data &&
    'token' in data &&
    isValidUser((data as any).user) &&
    typeof (data as any).token === 'string'
  );
}

export function isValidOnboardingData(data: unknown): data is OnboardingData {
  return (
    data != null &&
    typeof data === 'object' &&
    'dateOfBirth' in data &&
    'goals' in data &&
    'mentalHealthConcerns' in data &&
    'preferredActivities' in data &&
    'currentStressLevel' in data &&
    'sleepHours' in data &&
    'exerciseFrequency' in data &&
    'preferredContactMethod' in data &&
    'notificationPreferences' in data &&
    typeof (data as any).dateOfBirth === 'string' &&
    Array.isArray((data as any).goals) &&
    Array.isArray((data as any).mentalHealthConcerns) &&
    Array.isArray((data as any).preferredActivities) &&
    typeof (data as any).currentStressLevel === 'number' &&
    typeof (data as any).sleepHours === 'number' &&
    typeof (data as any).exerciseFrequency === 'string' &&
    typeof (data as any).preferredContactMethod === 'string' &&
    (data as any).notificationPreferences &&
    typeof (data as any).notificationPreferences === 'object'
  );
}
