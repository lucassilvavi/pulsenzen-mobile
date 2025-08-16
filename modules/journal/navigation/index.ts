// Navigation Module Exports
// Enhanced navigation system for Journal Module

// Core Navigation
export { JournalNavigation, useJournalNavigation } from './JournalNavigation';

// Navigation Components
export { JournalNavigationBar } from '../components/navigation/JournalNavigationBar';
export { SwipeableEntryNavigator } from '../components/navigation/SwipeableEntryNavigator';

// Navigation Hooks
export {
    useEntryNavigationState, useJournalNavigationState
} from '../hooks/useJournalNavigationState';

/**
 * Re-export main types for convenience
 */
export type { JournalEntry, JournalPrompt } from '../types';
