import { router } from 'expo-router';
import { JournalEntry, JournalPrompt } from '../types';

/**
 * Navigation utilities for Journal Module
 * Provides centralized navigation with state management and deep linking
 */
export class JournalNavigation {
  
  // === Core Navigation Methods ===
  
  /**
   * Navigate to journal home screen
   */
  static toHome() {
    router.push('/journal');
  }

  /**
   * Navigate to create new journal entry
   */
  static toCreateEntry(prompt?: JournalPrompt) {
    const params = prompt ? { promptId: prompt.id, promptText: prompt.question } : {};
    router.push({
      pathname: '/journal-entry',
      params
    });
  }

  /**
   * Navigate to view/edit existing entry
   */
  static toViewEntry(entry: JournalEntry, mode: 'view' | 'edit' = 'view') {
    router.push({
      pathname: '/journal-entry',
      params: {
        entryId: entry.id,
        mode
      }
    });
  }

  /**
   * Navigate to journal analytics/stats screen
   */
  static toAnalytics() {
    router.push('/prediction-dashboard');
  }

  /**
   * Navigate to journal search screen
   */
  static toSearch(initialQuery?: string) {
    router.push({
      pathname: '/journal',
      params: {
        tab: 'search',
        query: initialQuery || ''
      }
    });
  }

  // === Advanced Navigation with Context ===

  /**
   * Navigate with entry context (for related entries, similar moods, etc.)
   */
  static toEntryWithContext(entry: JournalEntry, context: {
    source?: 'search' | 'mood-filter' | 'date-filter' | 'analytics';
    relatedEntries?: string[];
    returnPath?: string;
  }) {
    router.push({
      pathname: '/journal-entry',
      params: {
        entryId: entry.id,
        mode: 'view',
        source: context.source || 'direct',
        relatedEntries: context.relatedEntries ? JSON.stringify(context.relatedEntries) : undefined,
        returnPath: context.returnPath || '/journal'
      }
    });
  }

  /**
   * Navigate to mood-based entry creation
   */
  static toCreateWithMood(moodLabel: string, category: 'positive' | 'negative' | 'neutral') {
    router.push({
      pathname: '/journal-entry',
      params: {
        suggestedMood: moodLabel,
        moodCategory: category
      }
    });
  }

  /**
   * Navigate to entry creation with prompt category
   */
  static toCreateWithCategory(category: string) {
    router.push({
      pathname: '/journal-entry',
      params: {
        promptCategory: category
      }
    });
  }

  // === Navigation Stack Management ===

  /**
   * Go back with state preservation
   */
  static goBack(fallbackRoute?: '/journal' | '/') {
    if (router.canGoBack()) {
      router.back();
    } else if (fallbackRoute) {
      router.push(fallbackRoute);
    } else {
      this.toHome();
    }
  }

  /**
   * Replace current route (no back navigation)
   */
  static replace(route: '/journal' | '/journal-entry' | '/', params?: Record<string, any>) {
    router.replace({
      pathname: route,
      params
    });
  }

  /**
   * Reset navigation stack to journal home
   */
  static resetToHome() {
    router.replace('/journal');
  }

  // === Deep Linking Support ===

  /**
   * Handle deep link to specific entry
   */
  static handleDeepLink(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      const pathname = parsedUrl.pathname;
      
      // Handle /journal/entry/:id deep links
      if (pathname.startsWith('/journal/entry/')) {
        const entryId = pathname.split('/').pop();
        if (entryId) {
          router.push({
            pathname: '/journal-entry',
            params: { entryId, mode: 'view' }
          });
          return true;
        }
      }
      
      // Handle /journal/create with prompt
      if (pathname === '/journal/create') {
        const promptId = parsedUrl.searchParams.get('promptId');
        const params = promptId ? { promptId } : {};
        router.push({
          pathname: '/journal-entry',
          params
        });
        return true;
      }

      // Handle /journal/search
      if (pathname === '/journal/search') {
        const query = parsedUrl.searchParams.get('q');
        this.toSearch(query || undefined);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error handling deep link:', error);
      return false;
    }
  }

  /**
   * Generate shareable deep link for entry
   */
  static generateEntryLink(entryId: string): string {
    return `pulsezen://journal/entry/${entryId}`;
  }

  /**
   * Generate shareable link for prompt-based creation
   */
  static generatePromptLink(promptId: string): string {
    return `pulsezen://journal/create?promptId=${promptId}`;
  }

  // === Navigation Analytics ===

  /**
   * Track navigation events for analytics
   */
  static trackNavigation(action: string, params?: Record<string, any>) {
    // This would integrate with your analytics service
    console.log('Journal Navigation:', action, params);
  }

  // === Gesture-Based Navigation Helpers ===

  /**
   * Handle swipe gestures for entry navigation
   */
  static handleEntrySwipe(
    currentEntryId: string, 
    entries: JournalEntry[], 
    direction: 'left' | 'right'
  ) {
    const currentIndex = entries.findIndex(e => e.id === currentEntryId);
    if (currentIndex === -1) return;

    const nextIndex = direction === 'left' 
      ? currentIndex + 1 
      : currentIndex - 1;

    if (nextIndex >= 0 && nextIndex < entries.length) {
      const nextEntry = entries[nextIndex];
      this.toViewEntry(nextEntry, 'view');
      this.trackNavigation('swipe_navigation', {
        direction,
        fromEntry: currentEntryId,
        toEntry: nextEntry.id
      });
    }
  }

  /**
   * Quick actions navigation (for long press, shortcuts, etc.)
   */
  static quickActions = {
    /**
     * Quick create new entry
     */
    quickCreate: () => {
      this.toCreateEntry();
      this.trackNavigation('quick_create');
    },

    /**
     * Quick search
     */
    quickSearch: () => {
      this.toSearch();
      this.trackNavigation('quick_search');
    },

    /**
     * Quick analytics
     */
    quickAnalytics: () => {
      this.toAnalytics();
      this.trackNavigation('quick_analytics');
    },

    /**
     * Quick mood entry
     */
    quickMoodEntry: (mood: string, category: 'positive' | 'negative' | 'neutral') => {
      this.toCreateWithMood(mood, category);
      this.trackNavigation('quick_mood_entry', { mood, category });
    }
  };

  // === Navigation State Management ===

  /**
   * Save navigation context for restoration
   */
  static saveNavigationContext(context: {
    currentRoute: string;
    params?: Record<string, any>;
    scrollPosition?: number;
    filterState?: any;
  }) {
    try {
      // This would save to AsyncStorage or similar
      console.log('Saving navigation context:', context);
    } catch (error) {
      console.error('Error saving navigation context:', error);
    }
  }

  /**
   * Restore navigation context
   */
  static async restoreNavigationContext(): Promise<any> {
    try {
      // This would restore from AsyncStorage
      console.log('Restoring navigation context');
      return null;
    } catch (error) {
      console.error('Error restoring navigation context:', error);
      return null;
    }
  }

  // === Tab-based Navigation Support ===

  /**
   * Navigate within journal tabs
   */
  static toTab(tab: 'entries' | 'search' | 'analytics' | 'prompts') {
    router.push({
      pathname: '/journal',
      params: { tab }
    });
  }

  /**
   * Navigate to filtered entries view
   */
  static toFilteredEntries(filter: {
    mood?: string;
    category?: string;
    dateRange?: { start: string; end: string };
    searchQuery?: string;
  }) {
    router.push({
      pathname: '/journal',
      params: {
        tab: 'entries',
        filter: JSON.stringify(filter)
      }
    });
  }
}

/**
 * Hook for navigation with journal context
 */
export const useJournalNavigation = () => {
  return {
    // Core navigation
    toHome: JournalNavigation.toHome,
    toCreateEntry: JournalNavigation.toCreateEntry,
    toViewEntry: JournalNavigation.toViewEntry,
    toAnalytics: JournalNavigation.toAnalytics,
    toSearch: JournalNavigation.toSearch,
    
    // Advanced navigation
    toEntryWithContext: JournalNavigation.toEntryWithContext,
    toCreateWithMood: JournalNavigation.toCreateWithMood,
    toCreateWithCategory: JournalNavigation.toCreateWithCategory,
    
    // Stack management
    goBack: JournalNavigation.goBack,
    replace: JournalNavigation.replace,
    resetToHome: JournalNavigation.resetToHome,
    
    // Quick actions
    quickActions: JournalNavigation.quickActions,
    
    // Gestures
    handleEntrySwipe: JournalNavigation.handleEntrySwipe,
    
    // Tab navigation
    toTab: JournalNavigation.toTab,
    toFilteredEntries: JournalNavigation.toFilteredEntries,
    
    // Utilities
    generateEntryLink: JournalNavigation.generateEntryLink,
    generatePromptLink: JournalNavigation.generatePromptLink,
  };
};
