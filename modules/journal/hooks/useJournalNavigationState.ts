import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter, useSegments } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { JournalEntry } from '../types';

interface NavigationState {
  currentRoute: string;
  params?: Record<string, any>;
  scrollPosition?: number;
  filterState?: any;
  history: string[];
  canGoBack: boolean;
}

interface NavigationContext {
  source?: 'search' | 'mood-filter' | 'date-filter' | 'analytics' | 'direct';
  relatedEntries?: string[];
  returnPath?: string;
  searchQuery?: string;
  filterOptions?: any;
}

const NAVIGATION_STORAGE_KEY = '@journal_navigation_state';
const MAX_HISTORY_LENGTH = 10;

/**
 * Hook for managing journal navigation state with persistence
 */
export const useJournalNavigationState = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const segments = useSegments();
  
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentRoute: '/journal',
    params: {},
    history: [],
    canGoBack: false,
  });

  const [navigationContext, setNavigationContext] = useState<NavigationContext>({});
  const [isRestoring, setIsRestoring] = useState(true);

  // Save navigation state to storage
  const saveNavigationState = useCallback(async (state: NavigationState) => {
    try {
      await AsyncStorage.setItem(NAVIGATION_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving navigation state:', error);
    }
  }, []);

  // Restore navigation state from storage
  const restoreNavigationState = useCallback(async () => {
    try {
      const savedState = await AsyncStorage.getItem(NAVIGATION_STORAGE_KEY);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        setNavigationState(parsedState);
      }
    } catch (error) {
      console.error('Error restoring navigation state:', error);
    } finally {
      setIsRestoring(false);
    }
  }, []);

  // Update navigation state
  const updateNavigationState = useCallback((updates: Partial<NavigationState>) => {
    setNavigationState(prevState => {
      const newState = { ...prevState, ...updates };
      
      // Update history
      if (updates.currentRoute && updates.currentRoute !== prevState.currentRoute) {
        newState.history = [
          prevState.currentRoute,
          ...prevState.history.slice(0, MAX_HISTORY_LENGTH - 1)
        ];
        newState.canGoBack = newState.history.length > 0;
      }
      
      // Save to storage
      saveNavigationState(newState);
      
      return newState;
    });
  }, [saveNavigationState]);

  // Set navigation context
  const setContext = useCallback((context: NavigationContext) => {
    setNavigationContext(context);
  }, []);

  // Navigate with context
  const navigateWithContext = useCallback((route: string, context: NavigationContext = {}) => {
    setContext(context);
    updateNavigationState({
      currentRoute: route,
      params: context as any,
    });
  }, [setContext, updateNavigationState]);

  // Go back with state restoration
  const goBackWithState = useCallback(() => {
    if (navigationState.canGoBack && navigationState.history.length > 0) {
      const previousRoute = navigationState.history[0];
      const newHistory = navigationState.history.slice(1);
      
      updateNavigationState({
        currentRoute: previousRoute,
        history: newHistory,
        canGoBack: newHistory.length > 0,
      });
      
      router.push(previousRoute as any);
      return true;
    }
    return false;
  }, [navigationState, updateNavigationState, router]);

  // Save scroll position
  const saveScrollPosition = useCallback((position: number) => {
    updateNavigationState({ scrollPosition: position });
  }, [updateNavigationState]);

  // Save filter state
  const saveFilterState = useCallback((filterState: any) => {
    updateNavigationState({ filterState });
  }, [updateNavigationState]);

  // Clear navigation history
  const clearHistory = useCallback(() => {
    updateNavigationState({
      history: [],
      canGoBack: false,
    });
  }, [updateNavigationState]);

  // Get navigation breadcrumbs
  const getBreadcrumbs = useCallback(() => {
    return navigationState.history.map(route => {
      // Convert route to readable name
      switch (route) {
        case '/journal': return 'Journal';
        case '/journal-entry': return 'Entrada';
        case '/prediction-dashboard': return 'Análise';
        default: return route.replace('/', '').replace('-', ' ');
      }
    });
  }, [navigationState.history]);

  // Get current entry context from params
  const getCurrentEntryContext = useCallback(() => {
    if (params.entryId) {
      return {
        entryId: params.entryId as string,
        mode: (params.mode as 'view' | 'edit') || 'view',
        source: navigationContext.source || 'direct',
        relatedEntries: navigationContext.relatedEntries || [],
        returnPath: navigationContext.returnPath || '/journal',
      };
    }
    return null;
  }, [params, navigationContext]);

  // Check if should show back button
  const shouldShowBackButton = useCallback(() => {
    return navigationState.canGoBack || navigationContext.returnPath;
  }, [navigationState.canGoBack, navigationContext.returnPath]);

  // Get optimal return path
  const getReturnPath = useCallback(() => {
    return navigationContext.returnPath || 
           (navigationState.history.length > 0 ? navigationState.history[0] : '/journal');
  }, [navigationContext.returnPath, navigationState.history]);

  // Initialize navigation state
  useEffect(() => {
    restoreNavigationState();
  }, [restoreNavigationState]);

  // Update current route based on router state
  useEffect(() => {
    if (!isRestoring) {
      // Get current route from segments
      const currentRoute = segments.length > 0 ? `/${segments.join('/')}` : '/journal';
      updateNavigationState({
        currentRoute,
        params: params as any,
      });
    }
  }, [params, segments, isRestoring, updateNavigationState]);

  return {
    // State
    navigationState,
    navigationContext,
    isRestoring,
    
    // Navigation methods
    navigateWithContext,
    goBackWithState,
    setContext,
    
    // State management
    saveScrollPosition,
    saveFilterState,
    clearHistory,
    
    // Utilities
    getBreadcrumbs,
    getCurrentEntryContext,
    shouldShowBackButton,
    getReturnPath,
    
    // State updater
    updateNavigationState,
  };
};

/**
 * Hook for managing entry navigation state
 */
export const useEntryNavigationState = (entries: JournalEntry[], currentEntryId?: string) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewHistory, setViewHistory] = useState<string[]>([]);

  // Find current index
  useEffect(() => {
    if (currentEntryId) {
      const index = entries.findIndex(entry => entry.id === currentEntryId);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [currentEntryId, entries]);

  // Add to view history
  const addToViewHistory = useCallback((entryId: string) => {
    setViewHistory(prev => {
      const filtered = prev.filter(id => id !== entryId);
      return [entryId, ...filtered].slice(0, 20); // Keep last 20 viewed
    });
  }, []);

  // Get navigation info
  const getNavigationInfo = useCallback(() => {
    const currentEntry = entries[currentIndex];
    const previousEntry = currentIndex > 0 ? entries[currentIndex - 1] : null;
    const nextEntry = currentIndex < entries.length - 1 ? entries[currentIndex + 1] : null;
    
    return {
      currentEntry,
      previousEntry,
      nextEntry,
      currentIndex,
      totalEntries: entries.length,
      hasPrevious: currentIndex > 0,
      hasNext: currentIndex < entries.length - 1,
      progress: entries.length > 0 ? (currentIndex + 1) / entries.length : 0,
    };
  }, [entries, currentIndex]);

  // Navigate to entry by index
  const navigateToIndex = useCallback((index: number) => {
    if (index >= 0 && index < entries.length) {
      setCurrentIndex(index);
      addToViewHistory(entries[index].id);
      return entries[index];
    }
    return null;
  }, [entries, addToViewHistory]);

  // Navigate to previous/next
  const navigateToPrevious = useCallback(() => {
    return navigateToIndex(currentIndex - 1);
  }, [currentIndex, navigateToIndex]);

  const navigateToNext = useCallback(() => {
    return navigateToIndex(currentIndex + 1);
  }, [currentIndex, navigateToIndex]);

  return {
    // State
    currentIndex,
    viewHistory,
    
    // Navigation methods
    navigateToIndex,
    navigateToPrevious,
    navigateToNext,
    addToViewHistory,
    
    // Utilities
    getNavigationInfo,
  };
};
