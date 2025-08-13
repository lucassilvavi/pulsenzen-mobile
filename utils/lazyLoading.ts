import { ComponentType, lazy, LazyExoticComponent } from 'react';

/**
 * Lazy load utility for components with loading fallback
 * Improves performance by code splitting at component level
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): LazyExoticComponent<T> {
  return lazy(importFunc);
}

/**
 * Lazy loaded components for better performance
 */
export const LazyComponents = {
  // Onboarding screens (loaded only when needed)
  OnboardingWelcome: lazyLoad(() => import('../app/onboarding/welcome')),
  OnboardingAuth: lazyLoad(() => import('../app/onboarding/auth')),
  OnboardingBenefits: lazyLoad(() => import('../app/onboarding/benefits')),
  OnboardingFeatures: lazyLoad(() => import('../app/onboarding/features')),
  OnboardingSetup: lazyLoad(() => import('../app/onboarding/setup')),

  // Secondary screens (loaded when accessed)
  Profile: lazyLoad(() => import('../app/profile')),
  Journal: lazyLoad(() => import('../app/journal')),
  JournalEntry: lazyLoad(() => import('../app/journal-entry')),
  BreathingSession: lazyLoad(() => import('../app/breathing-session')),

  // Heavy components (lazy loaded for performance)
  SOS: lazyLoad(() => import('../app/sos')),
} as const;

/**
 * Component names for easier reference
 */
export type LazyComponentName = keyof typeof LazyComponents;

/**
 * Preload specific components for better UX
 */
export const preloadComponent = (componentName: LazyComponentName): void => {
  // Trigger the import to start preloading
  LazyComponents[componentName];
};

/**
 * Preload critical components after app initialization
 */
export const preloadCriticalComponents = (): void => {
  // Preload commonly accessed screens
  setTimeout(() => {
    preloadComponent('Profile');
    preloadComponent('Journal');
    preloadComponent('BreathingSession');
  }, 1000); // Delay to not block initial render

  // Preload SOS after 2 seconds (emergency feature)
  setTimeout(() => {
    preloadComponent('SOS');
  }, 2000);
};

/**
 * Performance utilities
 */
export const PerformanceUtils = {
  lazyLoad,
  preloadComponent,
  preloadCriticalComponents,
  LazyComponents,
} as const;

export default PerformanceUtils;
