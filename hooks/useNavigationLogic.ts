import { usePathname, useRouter } from 'expo-router';
import { useEffect, useRef, useState, useCallback } from 'react';
import { APP_CONSTANTS } from '../constants/appConstants';
import { useAuth } from '../context/AuthContext';
import { logger } from '../utils/secureLogger';
import { secureStorage } from '../utils/secureStorage';

export function useNavigationLogic() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const navigationInProgress = useRef(false);

  // Check onboarding status - memoized to prevent recreation
  const checkOnboardingStatus = useCallback(async (): Promise<boolean> => {
    try {
      let isComplete = false;
      
      if (user?.onboardingComplete) {
        isComplete = true;
      } else {
        const status = await secureStorage.getItem<string>(APP_CONSTANTS.STORAGE_KEYS.ONBOARDING_DONE);
        isComplete = status === 'true';
      }
      
      setOnboardingComplete(isComplete);
      return isComplete;
    } catch (error) {
      logger.error('NavigationHook', 'Failed to check onboarding status', error as Error);
      setOnboardingComplete(false);
      return false;
    }
  }, [user?.onboardingComplete]); // Only depend on user's onboarding status

  // Simplified navigation logic
  useEffect(() => {
    console.log('NavigationLogic: Effect triggered - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading, 'pathname:', pathname, 'navigationInProgress:', navigationInProgress.current);
    
    if (isLoading || navigationInProgress.current) {
      return;
    }

    const handleNavigation = async () => {
      navigationInProgress.current = true;

      // Se não está autenticado e não está em uma rota pública, redireciona
      if (!isAuthenticated) {
        const publicRoutes = ['/onboarding/welcome', '/onboarding/auth'];
        const isOnPublicRoute = publicRoutes.some(route => pathname.includes(route));
        
        console.log('NavigationLogic: Usuário não autenticado - pathname:', pathname, 'isOnPublicRoute:', isOnPublicRoute);
        
        if (!isOnPublicRoute) {
          console.log('NavigationLogic: Usuário não autenticado tentando acessar rota privada, redirecionando para welcome');
          await router.replace('/onboarding/welcome');
        }
      } else {
        // Se está autenticado, verifica onboarding
        const onboardingDone = await checkOnboardingStatus();
        
        if (onboardingDone) {
          // Onboarding completo - pode acessar rotas privadas
          if (pathname.includes('/onboarding')) {
            console.log('NavigationLogic: Onboarding completo, redirecionando para home');
            await router.replace('/');
          }
        } else {
          // Onboarding não completo - vai para setup
          if (pathname === '/onboarding/auth') {
            console.log('NavigationLogic: Login feito, indo para benefits');
            await router.replace('/onboarding/benefits');
          } else if (!pathname.includes('/onboarding') || pathname === '/onboarding/welcome') {
            console.log('NavigationLogic: Onboarding não completo, indo para benefits');
            await router.replace('/onboarding/benefits');
          }
        }
      }

      // Reset navigation lock
      setTimeout(() => {
        navigationInProgress.current = false;
      }, 500);
    };

    handleNavigation();
  }, [isAuthenticated, isLoading, pathname]);

  return {
    isNavigationReady: !isLoading,
    onboardingComplete,
    refreshOnboardingStatus: checkOnboardingStatus,
    currentRoute: pathname,
  };
}
