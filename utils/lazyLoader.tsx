/**
 * Lazy Loading Utilities - Optimize component loading and performance
 */

import React, { ComponentType, Suspense, lazy, LazyExoticComponent } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { logger } from './logger';

export interface LazyLoadOptions {
  fallback?: ComponentType;
  errorBoundary?: boolean;
  preload?: boolean;
  delay?: number;
  retryCount?: number;
}

export interface LazyComponentConfig {
  name: string;
  loader: () => Promise<{ default: ComponentType<any> }>;
  options?: LazyLoadOptions;
}

// Default loading component
const DefaultLoadingComponent: ComponentType = () => {
  return React.createElement(
    View,
    { style: styles.loadingContainer },
    React.createElement(ActivityIndicator, { size: 'large', color: '#007AFF' }),
    React.createElement(Text, { style: styles.loadingText }, 'Loading...')
  );
};

// Default error component
const DefaultErrorComponent: ComponentType<{ error?: Error; retry?: () => void }> = ({ error, retry }) => {
  const retryElement = retry ? React.createElement(
    Text,
    { style: styles.retryButton, onPress: retry },
    'Tap to retry'
  ) : null;

  return React.createElement(
    View,
    { style: styles.errorContainer },
    React.createElement(Text, { style: styles.errorTitle }, 'Failed to load component'),
    React.createElement(Text, { style: styles.errorMessage }, error?.message || 'Unknown error'),
    retryElement
  );
};

class LazyLoadManager {
  private static instance: LazyLoadManager;
  private loadingStates = new Map<string, boolean>();
  private loadedComponents = new Map<string, ComponentType>();
  private failedComponents = new Map<string, Error>();
  private preloadPromises = new Map<string, Promise<ComponentType>>();

  private constructor() {}

  static getInstance(): LazyLoadManager {
    if (!LazyLoadManager.instance) {
      LazyLoadManager.instance = new LazyLoadManager();
    }
    return LazyLoadManager.instance;
  }

  /**
   * Create a lazy-loaded component with enhanced features
   */
  createLazyComponent<T = any>(
    loader: () => Promise<{ default: ComponentType<T> }>,
    options: LazyLoadOptions = {}
  ): LazyExoticComponent<ComponentType<T>> {
    const { delay = 0, retryCount = 3 } = options;

    const wrappedLoader = async (): Promise<{ default: ComponentType<T> }> => {
      let attempts = 0;
      
      while (attempts <= retryCount) {
        try {
          // Add artificial delay if specified
          if (delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
          }

          const module = await loader();
          logger.info('LazyLoadManager', 'Component loaded successfully', { attempts });
          return module;
        } catch (error) {
          attempts++;
          
          if (attempts > retryCount) {
            logger.error('LazyLoadManager', 'Failed to load component after retries', error instanceof Error ? error : new Error(String(error)));
            throw error;
          }

          // Exponential backoff for retries
          const backoffDelay = Math.min(1000 * Math.pow(2, attempts), 5000);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          
          logger.warn('LazyLoadManager', 'Retrying component load', { attempts, nextDelay: backoffDelay });
        }
      }

      throw new Error('Failed to load component');
    };

    return lazy(wrappedLoader);
  }

  /**
   * Create a lazy component with comprehensive error handling
   */
  createEnhancedLazyComponent<T = any>(
    config: LazyComponentConfig
  ): ComponentType<T> {
    const { name, loader, options = {} } = config;
    const {
      fallback = DefaultLoadingComponent,
      errorBoundary = true,
      preload = false,
    } = options;

    // Create the lazy component
    const LazyComponent = this.createLazyComponent(loader, options);

    // Track loading state
    const EnhancedComponent: ComponentType<T> = (props) => {
      const [error, setError] = React.useState<Error | null>(null);
      const [retryKey, setRetryKey] = React.useState(0);

      const handleError = React.useCallback((error: Error) => {
        setError(error);
        this.failedComponents.set(name, error);
        logger.error('LazyLoadManager', `Component ${name} failed to load`, error);
      }, [name]);

      const handleRetry = React.useCallback(() => {
        setError(null);
        setRetryKey(prev => prev + 1);
        this.failedComponents.delete(name);
      }, [name]);

      // Preload if requested
      React.useEffect(() => {
        if (preload) {
          this.preloadComponent(name, loader);
        }
      }, []);

      if (error) {
        return React.createElement(DefaultErrorComponent, { error, retry: handleRetry });
      }

      const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => {
        return React.createElement(
          Suspense,
          { fallback: React.createElement(fallback) },
          children
        );
      };

      const ComponentWithErrorBoundary = () => {
        try {
          return React.createElement(LazyComponent, props as T);
        } catch (err) {
          handleError(err instanceof Error ? err : new Error(String(err)));
          return null;
        }
      };

      return React.createElement(
        SuspenseWrapper,
        { key: retryKey, children: React.createElement(ComponentWithErrorBoundary) }
      );
    };

    EnhancedComponent.displayName = `LazyLoaded(${name})`;

    return EnhancedComponent;
  }

  /**
   * Preload a component without rendering
   */
  async preloadComponent(
    name: string,
    loader: () => Promise<{ default: ComponentType<any> }>
  ): Promise<ComponentType> {
    if (this.loadedComponents.has(name)) {
      return this.loadedComponents.get(name)!;
    }

    if (this.preloadPromises.has(name)) {
      return this.preloadPromises.get(name)!;
    }

    const promise = this.loadComponentWithRetry(name, loader);
    this.preloadPromises.set(name, promise);

    try {
      const component = await promise;
      this.loadedComponents.set(name, component);
      this.preloadPromises.delete(name);
      
      logger.info('LazyLoadManager', `Component ${name} preloaded successfully`);
      return component;
    } catch (error) {
      this.preloadPromises.delete(name);
      throw error;
    }
  }

  /**
   * Load component with retry logic
   */
  private async loadComponentWithRetry(
    name: string,
    loader: () => Promise<{ default: ComponentType<any> }>,
    maxRetries = 3
  ): Promise<ComponentType> {
    let attempts = 0;

    while (attempts <= maxRetries) {
      try {
        this.loadingStates.set(name, true);
        const module = await loader();
        this.loadingStates.set(name, false);
        return module.default;
      } catch (error) {
        attempts++;
        
        if (attempts > maxRetries) {
          this.loadingStates.set(name, false);
          this.failedComponents.set(name, error instanceof Error ? error : new Error(String(error)));
          throw error;
        }

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempts), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error(`Failed to load component ${name} after ${maxRetries} retries`);
  }

  /**
   * Batch preload multiple components
   */
  async batchPreload(configs: LazyComponentConfig[]): Promise<void> {
    const preloadPromises = configs.map(config => 
      this.preloadComponent(config.name, config.loader).catch(error => {
        logger.warn('LazyLoadManager', `Failed to preload ${config.name}`, error instanceof Error ? error.message : String(error));
        return null;
      })
    );

    await Promise.all(preloadPromises);
    logger.info('LazyLoadManager', 'Batch preload completed', { count: configs.length });
  }

  /**
   * Get loading statistics
   */
  getStats(): {
    loaded: number;
    loading: number;
    failed: number;
    preloaded: number;
  } {
    const loading = Array.from(this.loadingStates.values()).filter(Boolean).length;
    
    return {
      loaded: this.loadedComponents.size,
      loading,
      failed: this.failedComponents.size,
      preloaded: this.loadedComponents.size,
    };
  }

  /**
   * Clear all caches
   */
  clearCaches(): void {
    this.loadingStates.clear();
    this.loadedComponents.clear();
    this.failedComponents.clear();
    this.preloadPromises.clear();
    
    logger.info('LazyLoadManager', 'All caches cleared');
  }

  /**
   * Check if component is loaded
   */
  isComponentLoaded(name: string): boolean {
    return this.loadedComponents.has(name);
  }

  /**
   * Check if component is currently loading
   */
  isComponentLoading(name: string): boolean {
    return this.loadingStates.get(name) === true;
  }

  /**
   * Check if component failed to load
   */
  hasComponentFailed(name: string): boolean {
    return this.failedComponents.has(name);
  }

  /**
   * Get component failure error
   */
  getComponentError(name: string): Error | null {
    return this.failedComponents.get(name) || null;
  }
}

// Styles
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
    color: '#FF3B30',
    marginBottom: 10,
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
    textDecorationLine: 'underline',
  },
});

// Export singleton instance and utilities
export const lazyLoadManager = LazyLoadManager.getInstance();

// Convenience function for creating lazy components
export const createLazyComponent = <T = any>(
  loader: () => Promise<{ default: ComponentType<T> }>,
  options?: LazyLoadOptions
): LazyExoticComponent<ComponentType<T>> => {
  return lazyLoadManager.createLazyComponent(loader, options);
};

// Convenience function for enhanced lazy components
export const createEnhancedLazyComponent = <T = any>(
  config: LazyComponentConfig
): ComponentType<T> => {
  return lazyLoadManager.createEnhancedLazyComponent(config);
};
