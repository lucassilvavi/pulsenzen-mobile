import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { EnhancedJournalCard } from '../../../components/enhanced/EnhancedJournalCard';
import { AccessibilityProvider } from '../../../context/AccessibilityContext';

// Mock dependencies
jest.mock('expo-haptics');
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

const mockHaptics = Haptics as jest.Mocked<typeof Haptics>;

const mockJournalEntry = {
  id: '1',
  title: 'Test Entry',
  content: 'This is a test journal entry content.',
  mood: 5,
  createdAt: new Date('2024-01-15T10:30:00Z'),
  updatedAt: new Date('2024-01-15T10:30:00Z'),
  tags: ['happy', 'productive'],
  category: 'work',
  images: [],
};

const renderWithAccessibility = (component: React.ReactElement, accessibilityConfig = {}) => {
  const defaultConfig = {
    reducedMotion: false,
    highContrast: false,
    fontSize: 16,
    ...accessibilityConfig,
  };

  return render(
    <AccessibilityProvider value={defaultConfig}>
      {component}
    </AccessibilityProvider>
  );
};

describe('EnhancedJournalCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('renders correctly with required props', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedJournalCard
          entry={mockJournalEntry}
          onPress={jest.fn()}
          testID="test-journal-card"
        />
      );

      expect(getByTestId('test-journal-card')).toBeTruthy();
    });

    it('displays entry title', () => {
      const { getByText } = renderWithAccessibility(
        <EnhancedJournalCard
          entry={mockJournalEntry}
          onPress={jest.fn()}
          testID="test-journal-card"
        />
      );

      expect(getByText('Test Entry')).toBeTruthy();
    });

    it('displays entry content', () => {
      const { getByText } = renderWithAccessibility(
        <EnhancedJournalCard
          entry={mockJournalEntry}
          onPress={jest.fn()}
          testID="test-journal-card"
        />
      );

      expect(getByText('This is a test journal entry content.')).toBeTruthy();
    });

    it('displays creation date', () => {
      const { getByText } = renderWithAccessibility(
        <EnhancedJournalCard
          entry={mockJournalEntry}
          onPress={jest.fn()}
          testID="test-journal-card"
        />
      );

      // Should display formatted date
      expect(getByText(/Jan 15, 2024/)).toBeTruthy();
    });

    it('calls onPress when card is pressed', async () => {
      const onPressMock = jest.fn();
      
      const { getByTestId } = renderWithAccessibility(
        <EnhancedJournalCard
          entry={mockJournalEntry}
          onPress={onPressMock}
          testID="test-journal-card"
        />
      );

      fireEvent.press(getByTestId('test-journal-card'));

      await waitFor(() => {
        expect(onPressMock).toHaveBeenCalledWith(mockJournalEntry);
      });
    });
  });

  describe('Mood Display', () => {
    it('displays mood indicator when mood is provided', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedJournalCard
          entry={mockJournalEntry}
          onPress={jest.fn()}
          showMood={true}
          testID="test-journal-card"
        />
      );

      expect(getByTestId('test-journal-card-mood')).toBeTruthy();
    });

    it('displays correct mood level', () => {
      const { getByText } = renderWithAccessibility(
        <EnhancedJournalCard
          entry={{ ...mockJournalEntry, mood: 8 }}
          onPress={jest.fn()}
          showMood={true}
          testID="test-journal-card"
        />
      );

      expect(getByText('8/10')).toBeTruthy();
    });

    it('handles mood of 1', () => {
      const { getByText } = renderWithAccessibility(
        <EnhancedJournalCard
          entry={{ ...mockJournalEntry, mood: 1 }}
          onPress={jest.fn()}
          showMood={true}
          testID="test-journal-card"
        />
      );

      expect(getByText('1/10')).toBeTruthy();
    });

    it('handles mood of 10', () => {
      const { getByText } = renderWithAccessibility(
        <EnhancedJournalCard
          entry={{ ...mockJournalEntry, mood: 10 }}
          onPress={jest.fn()}
          showMood={true}
          testID="test-journal-card"
        />
      );

      expect(getByText('10/10')).toBeTruthy();
    });

    it('hides mood when showMood is false', () => {
      const { queryByTestId } = renderWithAccessibility(
        <EnhancedJournalCard
          entry={mockJournalEntry}
          onPress={jest.fn()}
          showMood={false}
          testID="test-journal-card"
        />
      );

      expect(queryByTestId('test-journal-card-mood')).toBeNull();
    });
  });

  describe('Tags Display', () => {
    it('displays tags when showTags is true', () => {
      const { getByText } = renderWithAccessibility(
        <EnhancedJournalCard
          entry={mockJournalEntry}
          onPress={jest.fn()}
          showTags={true}
          testID="test-journal-card"
        />
      );

      expect(getByText('happy')).toBeTruthy();
      expect(getByText('productive')).toBeTruthy();
    });

    it('hides tags when showTags is false', () => {
      const { queryByText } = renderWithAccessibility(
        <EnhancedJournalCard
          entry={mockJournalEntry}
          onPress={jest.fn()}
          showTags={false}
          testID="test-journal-card"
        />
      );

      expect(queryByText('happy')).toBeNull();
      expect(queryByText('productive')).toBeNull();
    });

    it('handles entries without tags', () => {
      const entryWithoutTags = { ...mockJournalEntry, tags: [] };
      
      const { queryByTestId } = renderWithAccessibility(
        <EnhancedJournalCard
          entry={entryWithoutTags}
          onPress={jest.fn()}
          showTags={true}
          testID="test-journal-card"
        />
      );

      expect(queryByTestId('test-journal-card-tags')).toBeNull();
    });

    it('limits tag display to maximum number', () => {
      const entryWithManyTags = {
        ...mockJournalEntry,
        tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6'],
      };
      
      const { getByText, queryByText } = renderWithAccessibility(
        <EnhancedJournalCard
          entry={entryWithManyTags}
          onPress={jest.fn()}
          showTags={true}
          maxTags={3}
          testID="test-journal-card"
        />
      );

      expect(getByText('tag1')).toBeTruthy();
      expect(getByText('tag2')).toBeTruthy();
      expect(getByText('tag3')).toBeTruthy();
      expect(getByText('+3 more')).toBeTruthy();
      expect(queryByText('tag4')).toBeNull();
    });
  });

  describe('Content Truncation', () => {
    it('truncates long content when specified', () => {
      const longContent = 'This is a very long journal entry content that should be truncated when the maxLines prop is set to a specific value to prevent the card from becoming too tall.';
      const entryWithLongContent = { ...mockJournalEntry, content: longContent };
      
      const { getByText } = renderWithAccessibility(
        <EnhancedJournalCard
          entry={entryWithLongContent}
          onPress={jest.fn()}
          maxLines={2}
          testID="test-journal-card"
        />
      );

      const contentElement = getByText(longContent);
      expect(contentElement.props.numberOfLines).toBe(2);
    });

    it('does not truncate short content', () => {
      const { getByText } = renderWithAccessibility(
        <EnhancedJournalCard
          entry={mockJournalEntry}
          onPress={jest.fn()}
          maxLines={2}
          testID="test-journal-card"
        />
      );

      const contentElement = getByText(mockJournalEntry.content);
      expect(contentElement.props.numberOfLines).toBe(2);
    });
  });

  describe('Card Variants', () => {
    it('handles compact variant', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedJournalCard
          entry={mockJournalEntry}
          onPress={jest.fn()}
          variant="compact"
          testID="test-journal-card"
        />
      );

      expect(getByTestId('test-journal-card')).toBeTruthy();
    });

    it('handles detailed variant', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedJournalCard
          entry={mockJournalEntry}
          onPress={jest.fn()}
          variant="detailed"
          testID="test-journal-card"
        />
      );

      expect(getByTestId('test-journal-card')).toBeTruthy();
    });

    it('handles minimal variant', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedJournalCard
          entry={mockJournalEntry}
          onPress={jest.fn()}
          variant="minimal"
          testID="test-journal-card"
        />
      );

      expect(getByTestId('test-journal-card')).toBeTruthy();
    });
  });

  describe('Interactive Features', () => {
    it('calls onLongPress when card is long pressed', async () => {
      const onLongPressMock = jest.fn();
      
      const { getByTestId } = renderWithAccessibility(
        <EnhancedJournalCard
          entry={mockJournalEntry}
          onPress={jest.fn()}
          onLongPress={onLongPressMock}
          testID="test-journal-card"
        />
      );

      fireEvent(getByTestId('test-journal-card'), 'onLongPress');

      await waitFor(() => {
        expect(onLongPressMock).toHaveBeenCalledWith(mockJournalEntry);
      });
    });

    it('shows action buttons when specified', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedJournalCard
          entry={mockJournalEntry}
          onPress={jest.fn()}
          showActions={true}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
          testID="test-journal-card"
        />
      );

      expect(getByTestId('test-journal-card-edit-action')).toBeTruthy();
      expect(getByTestId('test-journal-card-delete-action')).toBeTruthy();
    });

    it('calls onEdit when edit action is pressed', async () => {
      const onEditMock = jest.fn();
      
      const { getByTestId } = renderWithAccessibility(
        <EnhancedJournalCard
          entry={mockJournalEntry}
          onPress={jest.fn()}
          showActions={true}
          onEdit={onEditMock}
          testID="test-journal-card"
        />
      );

      fireEvent.press(getByTestId('test-journal-card-edit-action'));

      await waitFor(() => {
        expect(onEditMock).toHaveBeenCalledWith(mockJournalEntry);
      });
    });

    it('calls onDelete when delete action is pressed', async () => {
      const onDeleteMock = jest.fn();
      
      const { getByTestId } = renderWithAccessibility(
        <EnhancedJournalCard
          entry={mockJournalEntry}
          onPress={jest.fn()}
          showActions={true}
          onDelete={onDeleteMock}
          testID="test-journal-card"
        />
      );

      fireEvent.press(getByTestId('test-journal-card-delete-action'));

      await waitFor(() => {
        expect(onDeleteMock).toHaveBeenCalledWith(mockJournalEntry);
      });
    });
  });

  describe('Selection State', () => {
    it('shows selection indicator when selected', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedJournalCard
          entry={mockJournalEntry}
          onPress={jest.fn()}
          selected={true}
          testID="test-journal-card"
        />
      );

      expect(getByTestId('test-journal-card-selection')).toBeTruthy();
    });

    it('hides selection indicator when not selected', () => {
      const { queryByTestId } = renderWithAccessibility(
        <EnhancedJournalCard
          entry={mockJournalEntry}
          onPress={jest.fn()}
          selected={false}
          testID="test-journal-card"
        />
      );

      expect(queryByTestId('test-journal-card-selection')).toBeNull();
    });

    it('calls onSelectionChange when selection state changes', async () => {
      const onSelectionChangeMock = jest.fn();
      
      const { getByTestId } = renderWithAccessibility(
        <EnhancedJournalCard
          entry={mockJournalEntry}
          onPress={jest.fn()}
          selectable={true}
          onSelectionChange={onSelectionChangeMock}
          testID="test-journal-card"
        />
      );

      fireEvent.press(getByTestId('test-journal-card-selection-toggle'));

      await waitFor(() => {
        expect(onSelectionChangeMock).toHaveBeenCalledWith(mockJournalEntry, true);
      });
    });
  });

  describe('Accessibility Features', () => {
    it('has correct accessibility role and properties', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedJournalCard
          entry={mockJournalEntry}
          onPress={jest.fn()}
          testID="test-journal-card"
        />
      );

      const card = getByTestId('test-journal-card');
      expect(card.props.accessibilityRole).toBe('button');
      expect(card.props.accessibilityLabel).toContain('Test Entry');
      expect(card.props.accessibilityLabel).toContain('journal entry');
    });

    it('includes mood in accessibility label when shown', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedJournalCard
          entry={mockJournalEntry}
          onPress={jest.fn()}
          showMood={true}
          testID="test-journal-card"
        />
      );

      const card = getByTestId('test-journal-card');
      expect(card.props.accessibilityLabel).toContain('mood 5 out of 10');
    });

    it('includes tags in accessibility label when shown', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedJournalCard
          entry={mockJournalEntry}
          onPress={jest.fn()}
          showTags={true}
          testID="test-journal-card"
        />
      );

      const card = getByTestId('test-journal-card');
      expect(card.props.accessibilityLabel).toContain('tagged with happy, productive');
    });

    it('respects reduced motion preferences', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedJournalCard
          entry={mockJournalEntry}
          onPress={jest.fn()}
          testID="test-journal-card"
        />,
        { reducedMotion: true }
      );

      expect(getByTestId('test-journal-card')).toBeTruthy();
    });

    it('supports high contrast mode', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedJournalCard
          entry={mockJournalEntry}
          onPress={jest.fn()}
          testID="test-journal-card"
        />,
        { highContrast: true }
      );

      expect(getByTestId('test-journal-card')).toBeTruthy();
    });

    it('respects font size preferences', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedJournalCard
          entry={mockJournalEntry}
          onPress={jest.fn()}
          testID="test-journal-card"
        />,
        { fontSize: 20 }
      );

      expect(getByTestId('test-journal-card')).toBeTruthy();
    });
  });

  describe('Haptic Feedback', () => {
    it('triggers haptic feedback on press when enabled', async () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedJournalCard
          entry={mockJournalEntry}
          onPress={jest.fn()}
          enableHaptics={true}
          testID="test-journal-card"
        />
      );

      fireEvent.press(getByTestId('test-journal-card'));

      await waitFor(() => {
        expect(mockHaptics.impactAsync).toHaveBeenCalledWith(
          Haptics.ImpactFeedbackStyle.Light
        );
      });
    });

    it('triggers stronger haptic feedback on long press', async () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedJournalCard
          entry={mockJournalEntry}
          onPress={jest.fn()}
          onLongPress={jest.fn()}
          enableHaptics={true}
          testID="test-journal-card"
        />
      );

      fireEvent(getByTestId('test-journal-card'), 'onLongPress');

      await waitFor(() => {
        expect(mockHaptics.impactAsync).toHaveBeenCalledWith(
          Haptics.ImpactFeedbackStyle.Medium
        );
      });
    });

    it('does not trigger haptic feedback when disabled', async () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedJournalCard
          entry={mockJournalEntry}
          onPress={jest.fn()}
          enableHaptics={false}
          testID="test-journal-card"
        />
      );

      fireEvent.press(getByTestId('test-journal-card'));

      expect(mockHaptics.impactAsync).not.toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('renders efficiently', () => {
      const startTime = performance.now();
      
      const { getByTestId } = renderWithAccessibility(
        <EnhancedJournalCard
          entry={mockJournalEntry}
          onPress={jest.fn()}
          testID="test-journal-card"
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(getByTestId('test-journal-card')).toBeTruthy();
      expect(renderTime).toBeLessThan(50); // Should render quickly
    });

    it('handles multiple interactions efficiently', async () => {
      const onPressMock = jest.fn();
      
      const { getByTestId } = renderWithAccessibility(
        <EnhancedJournalCard
          entry={mockJournalEntry}
          onPress={onPressMock}
          testID="test-journal-card"
        />
      );

      const card = getByTestId('test-journal-card');

      // Multiple rapid presses
      for (let i = 0; i < 10; i++) {
        fireEvent.press(card);
      }

      await waitFor(() => {
        expect(onPressMock).toHaveBeenCalledTimes(10);
      });
    });
  });

  describe('Error Handling', () => {
    it('handles missing entry data gracefully', () => {
      const incompleteEntry = {
        id: '1',
        title: '',
        content: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => {
        renderWithAccessibility(
          <EnhancedJournalCard
            entry={incompleteEntry as any}
            onPress={jest.fn()}
            testID="test-journal-card"
          />
        );
      }).not.toThrow();
    });

    it('handles invalid dates gracefully', () => {
      const entryWithInvalidDate = {
        ...mockJournalEntry,
        createdAt: 'invalid-date' as any,
      };

      expect(() => {
        renderWithAccessibility(
          <EnhancedJournalCard
            entry={entryWithInvalidDate}
            onPress={jest.fn()}
            testID="test-journal-card"
          />
        );
      }).not.toThrow();
    });

    it('handles missing onPress gracefully', () => {
      expect(() => {
        renderWithAccessibility(
          <EnhancedJournalCard
            entry={mockJournalEntry}
            onPress={undefined as any}
            testID="test-journal-card"
          />
        );
      }).not.toThrow();
    });

    it('handles invalid mood values gracefully', () => {
      const entryWithInvalidMood = {
        ...mockJournalEntry,
        mood: -5,
      };

      expect(() => {
        renderWithAccessibility(
          <EnhancedJournalCard
            entry={entryWithInvalidMood}
            onPress={jest.fn()}
            showMood={true}
            testID="test-journal-card"
          />
        );
      }).not.toThrow();
    });
  });
});
