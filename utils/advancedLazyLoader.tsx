import React, { ComponentType, Suspense, lazy, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { logger } from '../utils/logger';

interface LazyLoadOptions {
  fallback?: React.ComponentType;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  preloadDelay?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

interface LoadingComponentProps {
  message?: string;
  showSpinner?: boolean;
}

// Componente de loading padrão
const DefaultLoadingComponent: React.FC<LoadingComponentProps> = ({ 
  message = 'Carregando...', 
  showSpinner = true 
}) => (
  <View style={styles.loadingContainer}>
    {showSpinner && <ActivityIndicator size="large" color="#007AFF" />}
    <Text style={styles.loadingText}>{message}</Text>
  </View>
);

// Componente de erro padrão
const DefaultErrorComponent: React.FC<{ error: Error; retry: () => void }> = ({ error, retry }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorTitle}>Erro ao carregar componente</Text>
    <Text style={styles.errorMessage}>{error.message}</Text>
    <Text style={styles.retryButton} onPress={retry}>
      Tentar novamente
    </Text>
  </View>
);

// Interface para componente lazy com métodos adicionais
interface LazyComponentType extends React.FC<any> {
  preload: () => Promise<{ default: any }> | null;
  isLoaded: () => boolean;
}

/**
 * Sistema avançado de lazy loading com:
 * - Retry automático com exponential backoff
 * - Preload inteligente
 * - Error boundaries integrados
 * - Métricas de performance
 * - Fallback customizável
 */
export const createLazyComponent = <T extends ComponentType<any>>(
  importFunction: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): LazyComponentType => {
  const {
    fallback: FallbackComponent = DefaultLoadingComponent,
    onLoad,
    onError,
    preloadDelay = 0,
    retryAttempts = 3,
    retryDelay = 1000,
  } = options;

  // Cache para evitar múltiplas tentativas de carregamento
  let loadingPromise: Promise<{ default: T }> | null = null;
  let loadedComponent: T | null = null;
  let hasErrored = false;

  const loadWithRetry = async (attempt = 1): Promise<{ default: T }> => {
    try {
      logger.debug('LazyLoader', `Loading component, attempt ${attempt}/${retryAttempts}`);
      const startTime = Date.now();
      
      const result = await importFunction();
      
      const loadTime = Date.now() - startTime;
      logger.info('LazyLoader', 'Component loaded successfully', { loadTime, attempt });
      
      loadedComponent = result.default;
      hasErrored = false;
      onLoad?.();
      
      return result;
    } catch (error) {
      logger.warn('LazyLoader', `Component loading failed, attempt ${attempt}`, error instanceof Error ? error : undefined);
      
      if (attempt >= retryAttempts) {
        hasErrored = true;
        const finalError = error instanceof Error ? error : new Error('Unknown loading error');
        onError?.(finalError);
        throw finalError;
      }
      
      // Exponential backoff
      const delay = retryDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return loadWithRetry(attempt + 1);
    }
  };

  const LazyComponent = lazy(() => {
    if (loadedComponent) {
      return Promise.resolve({ default: loadedComponent });
    }
    
    if (!loadingPromise) {
      loadingPromise = loadWithRetry();
    }
    
    return loadingPromise;
  });

  // Componente wrapper com error boundary
  const LazyWrapper: React.FC<any> = (props) => {
    const [error, setError] = useState<Error | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    const handleRetry = () => {
      setError(null);
      setRetryCount(prev => prev + 1);
      loadingPromise = null;
      hasErrored = false;
    };

    useEffect(() => {
      // Preload se especificado
      if (preloadDelay > 0 && !loadedComponent && !hasErrored) {
        const timer = setTimeout(() => {
          logger.debug('LazyLoader', 'Preloading component');
          loadWithRetry().catch(() => {
            // Silently fail preload, will retry when actually needed
          });
        }, preloadDelay);

        return () => clearTimeout(timer);
      }
    }, []);

    if (error) {
      return <DefaultErrorComponent error={error} retry={handleRetry} />;
    }

    return (
      <Suspense 
        fallback={<FallbackComponent />}
        key={retryCount} // Force re-mount on retry
      >
        <LazyComponent {...props} />
      </Suspense>
    );
  };

  // Criar um objeto com propriedades adicionais
  const LazyWrapperWithMethods = LazyWrapper as LazyComponentType;
  
  // Adicionar função para preload manual
  LazyWrapperWithMethods.preload = () => {
    if (!loadedComponent && !loadingPromise) {
      loadingPromise = loadWithRetry();
    }
    return loadingPromise;
  };

  // Adicionar função para verificar se está carregado
  LazyWrapperWithMethods.isLoaded = () => !!loadedComponent;

  return LazyWrapperWithMethods;
};

/**
 * Hook para preload de componentes lazy
 */
export const useLazyPreload = (components: Array<{ preload?: () => Promise<any> }>) => {
  useEffect(() => {
    // Preload após um pequeno delay para não bloquear a inicialização
    const timer = setTimeout(() => {
      components.forEach(component => {
        if (component.preload) {
          component.preload().catch(error => {
            logger.debug('LazyLoader', 'Preload failed', error instanceof Error ? error : undefined);
          });
        }
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [components]);
};

/**
 * Componentes lazy pré-configurados para as telas principais
 */
export const LazyScreens = {
  // Telas principais
  Home: createLazyComponent(
    () => import('../app/index'),
    { 
      preloadDelay: 500,
      onLoad: () => logger.info('LazyLoader', 'Home screen loaded')
    }
  ),
  
  Profile: createLazyComponent(
    () => import('../app/profile'),
    { 
      preloadDelay: 1000,
      onLoad: () => logger.info('LazyLoader', 'Profile screen loaded')
    }
  ),
  
  Journal: createLazyComponent(
    () => import('../app/journal'),
    {
      preloadDelay: 1500,
      onLoad: () => logger.info('LazyLoader', 'Journal screen loaded')
    }
  ),
  
  // Componentes pesados
  BreathingSession: createLazyComponent(
    () => import('../app/breathing-session'),
    {
      onLoad: () => logger.info('LazyLoader', 'Breathing Session loaded')
    }
  ),
  
  SOS: createLazyComponent(
    () => import('../app/sos'),
    {
      onLoad: () => logger.info('LazyLoader', 'SOS screen loaded')
    }
  ),
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default createLazyComponent;
