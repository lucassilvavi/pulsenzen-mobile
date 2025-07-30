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
  error: string;
  code?: string;
  details?: Record<string, any>;
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
}

export interface UserProfile {
  id: string;
  email: string;
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
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheTtl?: number;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  offline?: boolean;
}

export interface NetworkResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
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

export function isValidUser(data: any): data is User {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.id === 'string' &&
    typeof data.email === 'string' &&
    typeof data.emailVerified === 'boolean'
  );
}

export function isValidAuthData(data: any): data is AuthData {
  return (
    data &&
    typeof data === 'object' &&
    isValidUser(data.user) &&
    typeof data.token === 'string'
  );
}

export function isValidOnboardingData(data: any): data is OnboardingData {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.dateOfBirth === 'string' &&
    Array.isArray(data.goals) &&
    Array.isArray(data.mentalHealthConcerns) &&
    Array.isArray(data.preferredActivities) &&
    typeof data.currentStressLevel === 'number' &&
    typeof data.sleepHours === 'number' &&
    typeof data.exerciseFrequency === 'string' &&
    typeof data.preferredContactMethod === 'string' &&
    data.notificationPreferences &&
    typeof data.notificationPreferences === 'object'
  );
}
