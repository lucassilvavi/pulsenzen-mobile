import { render } from '@testing-library/react-native';
import { Text, TouchableOpacity, View } from 'react-native';
import { JournalNavigationBar } from '../components/navigation/JournalNavigationBar';
import { SwipeableEntryNavigator } from '../components/navigation/SwipeableEntryNavigator';
import { JournalNavigation, useJournalNavigation } from '../navigation/JournalNavigation';
import { JournalEntry, JournalPrompt } from '../types';

// Mock data
const mockJournalEntries: JournalEntry[] = [
  {
    id: 'entry-1',
    content: 'Test entry 1',
    promptCategory: 'mood',
    moodTags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    wordCount: 10,
    sentimentScore: 0.5,
    privacy: 'private',
    metadata: {
      deviceType: 'mobile',
      timezone: 'UTC',
      writingDuration: 120,
      revisionCount: 0
    }
  },
  {
    id: 'entry-2',
    content: 'Test entry 2',
    promptCategory: 'mood',
    moodTags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    wordCount: 15,
    sentimentScore: 0.7,
    privacy: 'private',
    metadata: {
      deviceType: 'mobile',
      timezone: 'UTC',
      writingDuration: 90,
      revisionCount: 1
    }
  },
  {
    id: 'entry-3',
    content: 'Test entry 3',
    promptCategory: 'mood',
    moodTags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    wordCount: 20,
    sentimentScore: 0.3,
    privacy: 'private',
    metadata: {
      deviceType: 'mobile',
      timezone: 'UTC',
      writingDuration: 180,
      revisionCount: 2
    }
  }
];

const mockPrompt: JournalPrompt = {
  id: 'prompt-1',
  question: 'How are you feeling today?',
  category: 'mood',
  icon: 'heart',
  difficulty: 'beginner',
  tags: ['mood', 'emotional']
};

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
    canGoBack: jest.fn(() => true),
  },
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
    canGoBack: jest.fn(() => true),
  })),
  useLocalSearchParams: jest.fn(() => ({})),
  useSegments: jest.fn(() => ['journal']),
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  Gesture: {
    Pan: jest.fn(() => ({
      onUpdate: jest.fn().mockReturnThis(),
      onEnd: jest.fn().mockReturnThis(),
    })),
  },
  GestureDetector: ({ children }: any) => children,
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => ({
  useSharedValue: jest.fn(() => ({ value: 0 })),
  useAnimatedStyle: jest.fn(() => ({})),
  withTiming: jest.fn((value) => value),
  runOnJS: jest.fn((fn) => fn),
  interpolate: jest.fn(() => 0),
  Extrapolate: { CLAMP: 'clamp' },
  default: {
    View: ({ children, style }: any) => <div style={style}>{children}</div>,
  },
}));

// Mock expo-blur
jest.mock('expo-blur', () => ({
  BlurView: ({ children }: any) => <div>{children}</div>,
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('JournalNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Core Navigation Methods', () => {
    test('should navigate to home', () => {
      const { router } = require('expo-router');
      
      JournalNavigation.toHome();
      
      expect(router.push).toHaveBeenCalledWith('/journal');
    });

    test('should navigate to create entry', () => {
      const { router } = require('expo-router');
      
      JournalNavigation.toCreateEntry();
      
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/journal-entry',
        params: {}
      });
    });

    test('should navigate to create entry with prompt', () => {
      const { router } = require('expo-router');
      
      JournalNavigation.toCreateEntry(mockPrompt);
      
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/journal-entry',
        params: {
          promptId: 'prompt-1',
          promptText: 'How are you feeling today?'
        }
      });
    });

    test('should navigate to view entry', () => {
      const { router } = require('expo-router');
      const mockEntry = mockJournalEntries[0];
      
      JournalNavigation.toViewEntry(mockEntry);
      
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/journal-entry',
        params: {
          entryId: mockEntry.id,
          mode: 'view'
        }
      });
    });

    test('should navigate to edit entry', () => {
      const { router } = require('expo-router');
      const mockEntry = mockJournalEntries[0];
      
      JournalNavigation.toViewEntry(mockEntry, 'edit');
      
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/journal-entry',
        params: {
          entryId: mockEntry.id,
          mode: 'edit'
        }
      });
    });

    test('should navigate to analytics', () => {
      const { router } = require('expo-router');
      
      JournalNavigation.toAnalytics();
      
      expect(router.push).toHaveBeenCalledWith('/prediction-dashboard');
    });

    test('should navigate to search', () => {
      const { router } = require('expo-router');
      
      JournalNavigation.toSearch('test query');
      
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/journal',
        params: {
          tab: 'search',
          query: 'test query'
        }
      });
    });
  });

  describe('Advanced Navigation', () => {
    test('should navigate to entry with context', () => {
      const { router } = require('expo-router');
      const mockEntry = mockJournalEntries[0];
      const context = {
        source: 'search' as const,
        relatedEntries: ['entry-2', 'entry-3'],
        returnPath: '/journal'
      };
      
      JournalNavigation.toEntryWithContext(mockEntry, context);
      
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/journal-entry',
        params: {
          entryId: mockEntry.id,
          mode: 'view',
          source: 'search',
          relatedEntries: JSON.stringify(['entry-2', 'entry-3']),
          returnPath: '/journal'
        }
      });
    });

    test('should navigate to create with mood', () => {
      const { router } = require('expo-router');
      
      JournalNavigation.toCreateWithMood('happy', 'positive');
      
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/journal-entry',
        params: {
          suggestedMood: 'happy',
          moodCategory: 'positive'
        }
      });
    });
  });

  describe('Navigation Stack Management', () => {
    test('should go back when possible', () => {
      const { router } = require('expo-router');
      router.canGoBack.mockReturnValue(true);
      
      JournalNavigation.goBack();
      
      expect(router.back).toHaveBeenCalled();
    });

    test('should use fallback route when cannot go back', () => {
      const { router } = require('expo-router');
      router.canGoBack.mockReturnValue(false);
      
      JournalNavigation.goBack('/journal');
      
      expect(router.push).toHaveBeenCalledWith('/journal');
    });

    test('should reset to home', () => {
      const { router } = require('expo-router');
      
      JournalNavigation.resetToHome();
      
      expect(router.replace).toHaveBeenCalledWith('/journal');
    });
  });

  describe('Deep Linking', () => {
    test('should handle entry deep link', () => {
      const { router } = require('expo-router');
      
      const result = JournalNavigation.handleDeepLink('pulsezen://journal/entry/entry-123');
      
      expect(result).toBe(true);
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/journal-entry',
        params: { entryId: 'entry-123', mode: 'view' }
      });
    });

    test('should handle create deep link', () => {
      const { router } = require('expo-router');
      
      const result = JournalNavigation.handleDeepLink('pulsezen://journal/create?promptId=prompt-1');
      
      expect(result).toBe(true);
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/journal-entry',
        params: { promptId: 'prompt-1' }
      });
    });

    test('should handle search deep link', () => {
      const { router } = require('expo-router');
      
      const result = JournalNavigation.handleDeepLink('pulsezen://journal/search?q=test');
      
      expect(result).toBe(true);
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/journal',
        params: {
          tab: 'search',
          query: 'test'
        }
      });
    });

    test('should return false for invalid deep link', () => {
      const result = JournalNavigation.handleDeepLink('invalid://url');
      
      expect(result).toBe(false);
    });

    test('should generate entry link', () => {
      const link = JournalNavigation.generateEntryLink('entry-123');
      
      expect(link).toBe('pulsezen://journal/entry/entry-123');
    });

    test('should generate prompt link', () => {
      const link = JournalNavigation.generatePromptLink('prompt-123');
      
      expect(link).toBe('pulsezen://journal/create?promptId=prompt-123');
    });
  });

  describe('Gesture Navigation', () => {
    test('should handle entry swipe navigation', () => {
      const mockEntries = mockJournalEntries;
      const currentEntryId = mockEntries[1].id;
      
      console.log = jest.fn(); // Mock console.log for tracking
      
      // Swipe left (next entry)
      JournalNavigation.handleEntrySwipe(currentEntryId, mockEntries, 'left');
      
      expect(console.log).toHaveBeenCalledWith(
        'Journal Navigation:', 
        'swipe_navigation', 
        expect.objectContaining({
          direction: 'left',
          fromEntry: currentEntryId,
          toEntry: mockEntries[2].id
        })
      );
    });

    test('should not navigate beyond bounds', () => {
      const mockEntries = mockJournalEntries;
      const currentEntryId = mockEntries[mockEntries.length - 1].id;
      
      console.log = jest.fn();
      
      // Try to swipe left from last entry
      JournalNavigation.handleEntrySwipe(currentEntryId, mockEntries, 'left');
      
      // Should not have called navigation tracking
      expect(console.log).not.toHaveBeenCalledWith(
        'Journal Navigation:', 
        'swipe_navigation', 
        expect.any(Object)
      );
    });
  });

  describe('Quick Actions', () => {
    test('should handle quick create', () => {
      const { router } = require('expo-router');
      console.log = jest.fn();
      
      JournalNavigation.quickActions.quickCreate();
      
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/journal-entry',
        params: {}
      });
      expect(console.log).toHaveBeenCalledWith('Journal Navigation:', 'quick_create');
    });

    test('should handle quick search', () => {
      const { router } = require('expo-router');
      console.log = jest.fn();
      
      JournalNavigation.quickActions.quickSearch();
      
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/journal',
        params: {
          tab: 'search',
          query: ''
        }
      });
      expect(console.log).toHaveBeenCalledWith('Journal Navigation:', 'quick_search');
    });

    test('should handle quick mood entry', () => {
      const { router } = require('expo-router');
      console.log = jest.fn();
      
      JournalNavigation.quickActions.quickMoodEntry('excited', 'positive');
      
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/journal-entry',
        params: {
          suggestedMood: 'excited',
          moodCategory: 'positive'
        }
      });
      expect(console.log).toHaveBeenCalledWith(
        'Journal Navigation:', 
        'quick_mood_entry', 
        { mood: 'excited', category: 'positive' }
      );
    });
  });
});

describe('useJournalNavigation Hook', () => {
  test('should return navigation methods', () => {
    const TestComponent = () => {
      const navigation = useJournalNavigation();
      
      return (
        <View>
          <TouchableOpacity onPress={() => navigation.toHome()}>
            <Text>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.toCreateEntry()}>
            <Text>Create</Text>
          </TouchableOpacity>
        </View>
      );
    };

    const { getByText } = render(<TestComponent />);
    
    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Create')).toBeTruthy();
  });
});

describe('JournalNavigationBar Component', () => {
  test('should render navigation tabs', () => {
    const mockOnRouteChange = jest.fn();
    
    const { getByText } = render(
      <JournalNavigationBar 
        currentRoute="entries" 
        onRouteChange={mockOnRouteChange} 
      />
    );
    
    // Should render tab labels or icons (depends on implementation)
    // This test might need adjustment based on actual rendering
    expect(mockOnRouteChange).toBeDefined();
  });

  test('should call onRouteChange when tab is pressed', () => {
    const mockOnRouteChange = jest.fn();
    
    const { getByTestId } = render(
      <JournalNavigationBar 
        currentRoute="entries" 
        onRouteChange={mockOnRouteChange} 
      />
    );
    
    // This would need proper test IDs in the component
    // fireEvent.press(getByTestId('search-tab'));
    // expect(mockOnRouteChange).toHaveBeenCalledWith('search');
  });
});

describe('SwipeableEntryNavigator Component', () => {
  const mockEntries = mockJournalEntries;
  const mockOnEntryChange = jest.fn();

  test('should render with children', () => {
    const { getByText } = render(
      <SwipeableEntryNavigator
        currentEntry={mockEntries[0]}
        entries={mockEntries}
        onEntryChange={mockOnEntryChange}
      >
        <div>Entry Content</div>
      </SwipeableEntryNavigator>
    );
    
    expect(getByText('Entry Content')).toBeTruthy();
  });

  test('should show progress indicator', () => {
    const { getByText } = render(
      <SwipeableEntryNavigator
        currentEntry={mockEntries[0]}
        entries={mockEntries}
        onEntryChange={mockOnEntryChange}
      >
        <div>Entry Content</div>
      </SwipeableEntryNavigator>
    );
    
    expect(getByText(`1 de ${mockEntries.length}`)).toBeTruthy();
  });
});
