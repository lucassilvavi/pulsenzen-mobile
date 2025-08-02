import { usePathname, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { APP_CONSTANTS } from '../constants/appConstants';
import { useAuth } from '../context/AuthContext';
import { logger } from '../utils/secureLogger';
import { secureStorage } from '../utils/secureStorage';

interface NavigationState {
  isReady: boolean;
  shouldRedirect: boolean;
  targetRoute: string | null;
}

export function useNavigationLogic() {
  const { isAuthenticated, isLoading, setOnAuthStateChangeCallback } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const [navigationState, setNavigationState] = useState<NavigationState>({
    isReady: false,
    shouldRedirect: false,
    targetRoute: null,
  });
  
  // Use ref to prevent multiple navigation calls
  const navigationInProgress = useRef(false);
  const lastRoute = useRef<string>('');
  const cleanupTimeouts = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  // Cleanup function for all timeouts
  const cleanupAllTimeouts = () => {
    cleanupTimeouts.current.forEach(timeout => clearTimeout(timeout));
    cleanupTimeouts.current = [];
  };

  // Add timeout to cleanup list
  const addTimeout = (timeout: ReturnType<typeof setTimeout>) => {
    cleanupTimeouts.current.push(timeout);
  };

  // Check onboarding status
  const checkOnboardingStatus = async (): Promise<boolean> => {
    try {
      const status = await secureStorage.getItem<string>(APP_CONSTANTS.STORAGE_KEYS.ONBOARDING_DONE);
      const isComplete = status === 'true';
      setOnboardingComplete(isComplete);
      
      logger.debug('NavigationHook', 'Onboarding status checked', {
        isComplete,
        isAuthenticated,
        currentPath: pathname
      });
      
      return isComplete;
    } catch (error) {
      logger.error('NavigationHook', 'Failed to check onboarding status', error as Error);
      setOnboardingComplete(false);
      return false;
    }
  };

  // Determine target route based on auth and onboarding state
  const getTargetRoute = (
    isAuth: boolean, 
    onboardingDone: boolean, 
    currentPath: string
  ): string | null => {
    // Don't redirect if already on the correct path
    if (isAuth && onboardingDone && !currentPath.includes('/onboarding')) {
      return null; // User is authenticated and onboarded, stay where they are
    }
    
    if (isAuth && !onboardingDone && !currentPath.includes('/onboarding')) {
      return APP_CONSTANTS.NAVIGATION.ROUTES.ONBOARDING_BENEFITS;
    }
    
    if (isAuth && onboardingDone && currentPath.includes('/onboarding')) {
      return APP_CONSTANTS.NAVIGATION.ROUTES.HOME;
    }
    
    if (!isAuth && !currentPath.includes('/onboarding')) {
      return APP_CONSTANTS.NAVIGATION.ROUTES.ONBOARDING_WELCOME;
    }
    
    return null;
  };

  // Perform navigation with safety checks
  const navigateToRoute = async (route: string, reason: string) => {
    if (navigationInProgress.current || lastRoute.current === route) {
      return;
    }

    try {
      navigationInProgress.current = true;
      lastRoute.current = route;
      
      logger.navigation('NavigationHook', pathname, route, reason);
      
      await router.replace(route as any);
      
      // Reset navigation lock after a delay with cleanup tracking
      const timeoutId = setTimeout(() => {
        navigationInProgress.current = false;
      }, 1000);
      addTimeout(timeoutId);
      
    } catch (error) {
      logger.error('NavigationHook', 'Navigation failed', error as Error, {
        from: pathname,
        to: route,
        reason
      });
      navigationInProgress.current = false;
    }
  };

  // Initial onboarding check
  useEffect(() => {
    checkOnboardingStatus();
  }, [isAuthenticated]);

  // Setup callback for auth state changes
  useEffect(() => {
    if (setOnAuthStateChangeCallback) {
      setOnAuthStateChangeCallback(() => {
        // Force navigation check after callback
        setTimeout(() => {
          checkOnboardingStatus();
        }, 100);
      });
    }
  }, [setOnAuthStateChangeCallback, checkOnboardingStatus]);

  // Main navigation logic
  useEffect(() => {
    if (isLoading || onboardingComplete === null || navigationInProgress.current) {
      return;
    }

    const targetRoute = getTargetRoute(isAuthenticated, onboardingComplete, pathname);
    
    if (targetRoute) {
      setNavigationState({
        isReady: true,
        shouldRedirect: true,
        targetRoute,
      });
    } else {
      setNavigationState({
        isReady: true,
        shouldRedirect: false,
        targetRoute: null,
      });
    }
  }, [isLoading, isAuthenticated, onboardingComplete, pathname]);

  // Execute navigation when state changes
  useEffect(() => {
    if (navigationState.shouldRedirect && navigationState.targetRoute) {
      const reason = !isAuthenticated 
        ? 'User not authenticated'
        : !onboardingComplete 
        ? 'Onboarding not complete'
        : 'Onboarding complete, redirecting home';
        
      navigateToRoute(navigationState.targetRoute, reason);
    }
  }, [navigationState, isAuthenticated, onboardingComplete]);

  // Public methods for external use
  const refreshOnboardingStatus = () => {
    checkOnboardingStatus();
  };

  const forceNavigation = (route: string, reason: string = 'Force navigation') => {
    navigateToRoute(route, reason);
  };

  // Cleanup effect for component unmount
  useEffect(() => {
    return () => {
      cleanupAllTimeouts();
      navigationInProgress.current = false;
      logger.debug('NavigationHook', 'Cleaning up navigation hook resources');
    };
  }, []);

  return {
    isNavigationReady: navigationState.isReady,
    onboardingComplete,
    refreshOnboardingStatus,
    forceNavigation,
    currentRoute: pathname,
  };
}
