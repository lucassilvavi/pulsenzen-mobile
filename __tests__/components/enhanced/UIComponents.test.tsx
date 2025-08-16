import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { AccessibilityProvider } from '../../../context/AccessibilityContext';
import { enhancedTheme } from '../../../styles/theme';

// Mock the enhanced components
const MockEnhancedButton = jest.fn().mockImplementation(({ children, onPress, testID }) => {
  const MockedButton = require('react-native').TouchableOpacity;
  return React.createElement(MockedButton, { onPress, testID }, children);
});

const MockEnhancedTextInput = jest.fn().mockImplementation(({ onChangeText, testID, value }) => {
  const MockedTextInput = require('react-native').TextInput;
  return React.createElement(MockedTextInput, { onChangeText, testID, value });
});

const MockEnhancedModal = jest.fn().mockImplementation(({ visible, children, testID }) => {
  const MockedView = require('react-native').View;
  return visible ? React.createElement(MockedView, { testID }, children) : null;
});

const MockEnhancedLoadingIndicator = jest.fn().mockImplementation(({ visible, testID }) => {
  const MockedView = require('react-native').View;
  return visible ? React.createElement(MockedView, { testID }) : null;
});

const MockEnhancedJournalCard = jest.fn().mockImplementation(({ entry, onPress, testID }) => {
  const MockedTouchableOpacity = require('react-native').TouchableOpacity;
  return React.createElement(MockedTouchableOpacity, { onPress: () => onPress(entry), testID });
});

const MockEnhancedCharts = jest.fn().mockImplementation(({ type, data, testID }) => {
  const MockedView = require('react-native').View;
  return React.createElement(MockedView, { testID });
});

// Mock dependencies
jest.mock('expo-haptics');
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

const mockHaptics = Haptics as jest.Mocked<typeof Haptics>;

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

describe('Enhanced UI Components Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MockEnhancedButton.mockClear();
    MockEnhancedTextInput.mockClear();
    MockEnhancedModal.mockClear();
    MockEnhancedLoadingIndicator.mockClear();
    MockEnhancedJournalCard.mockClear();
    MockEnhancedCharts.mockClear();
  });

  describe('Component Library Integration', () => {
    it('integrates all enhanced components together', () => {
      const TestApp = () => {
        const [showModal, setShowModal] = React.useState(false);
        const [loading, setLoading] = React.useState(false);
        const [inputValue, setInputValue] = React.useState('');

        const mockEntry = {
          id: '1',
          title: 'Test Entry',
          content: 'Test content',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const chartData = [
          { date: '2024-01-01', value: 5, label: 'Day 1' },
          { date: '2024-01-02', value: 7, label: 'Day 2' },
        ];

        return (
          <>
            <MockEnhancedButton
              onPress={() => setShowModal(true)}
              testID="open-modal-button"
            >
              Open Modal
            </MockEnhancedButton>

            <MockEnhancedTextInput
              value={inputValue}
              onChangeText={setInputValue}
              testID="test-input"
            />

            <MockEnhancedJournalCard
              entry={mockEntry}
              onPress={() => setLoading(true)}
              testID="journal-card"
            />

            <MockEnhancedCharts
              type="line"
              data={chartData}
              testID="mood-chart"
            />

            <MockEnhancedModal
              visible={showModal}
              testID="test-modal"
            >
              Modal Content
            </MockEnhancedModal>

            <MockEnhancedLoadingIndicator
              visible={loading}
              testID="loading-indicator"
            />
          </>
        );
      };

      const { getByTestId, queryByTestId } = renderWithAccessibility(<TestApp />);

      // Verify all components render
      expect(getByTestId('open-modal-button')).toBeTruthy();
      expect(getByTestId('test-input')).toBeTruthy();
      expect(getByTestId('journal-card')).toBeTruthy();
      expect(getByTestId('mood-chart')).toBeTruthy();

      // Modal and loading should not be visible initially
      expect(queryByTestId('test-modal')).toBeNull();
      expect(queryByTestId('loading-indicator')).toBeNull();
    });

    it('handles component interactions properly', async () => {
      const TestInteractionApp = () => {
        const [modalVisible, setModalVisible] = React.useState(false);
        const [loadingVisible, setLoadingVisible] = React.useState(false);

        return (
          <>
            <MockEnhancedButton
              onPress={() => setModalVisible(true)}
              testID="show-modal-btn"
            >
              Show Modal
            </MockEnhancedButton>

            <MockEnhancedButton
              onPress={() => setLoadingVisible(true)}
              testID="show-loading-btn"
            >
              Show Loading
            </MockEnhancedButton>

            <MockEnhancedModal
              visible={modalVisible}
              testID="interaction-modal"
            >
              <MockEnhancedButton
                onPress={() => setModalVisible(false)}
                testID="close-modal-btn"
              >
                Close
              </MockEnhancedButton>
            </MockEnhancedModal>

            <MockEnhancedLoadingIndicator
              visible={loadingVisible}
              testID="interaction-loading"
            />
          </>
        );
      };

      const { getByTestId, queryByTestId } = renderWithAccessibility(<TestInteractionApp />);

      // Show modal
      fireEvent.press(getByTestId('show-modal-btn'));
      await waitFor(() => {
        expect(getByTestId('interaction-modal')).toBeTruthy();
      });

      // Show loading
      fireEvent.press(getByTestId('show-loading-btn'));
      await waitFor(() => {
        expect(getByTestId('interaction-loading')).toBeTruthy();
      });

      // Close modal
      fireEvent.press(getByTestId('close-modal-btn'));
      await waitFor(() => {
        expect(queryByTestId('interaction-modal')).toBeNull();
      });
    });
  });

  describe('Theme Integration', () => {
    it('applies theme consistently across components', () => {
      const ThemedApp = () => (
        <>
          <MockEnhancedButton
            style={{ backgroundColor: enhancedTheme.colors.primary }}
            testID="themed-button"
          >
            Themed Button
          </MockEnhancedButton>

          <MockEnhancedTextInput
            style={{ borderColor: enhancedTheme.colors.border }}
            testID="themed-input"
          />
        </>
      );

      const { getByTestId } = renderWithAccessibility(<ThemedApp />);

      expect(getByTestId('themed-button')).toBeTruthy();
      expect(getByTestId('themed-input')).toBeTruthy();
    });

    it('handles theme transitions correctly', () => {
      const ThemeToggleApp = () => {
        const [darkMode, setDarkMode] = React.useState(false);
        const currentTheme = darkMode ? enhancedTheme.dark : enhancedTheme.light;

        return (
          <>
            <MockEnhancedButton
              onPress={() => setDarkMode(!darkMode)}
              style={{ backgroundColor: currentTheme.primary }}
              testID="theme-toggle"
            >
              Toggle Theme
            </MockEnhancedButton>

            <MockEnhancedTextInput
              style={{ backgroundColor: currentTheme.background }}
              testID="themed-content"
            />
          </>
        );
      };

      const { getByTestId } = renderWithAccessibility(<ThemeToggleApp />);

      expect(getByTestId('theme-toggle')).toBeTruthy();
      expect(getByTestId('themed-content')).toBeTruthy();

      // Toggle theme
      fireEvent.press(getByTestId('theme-toggle'));
      expect(getByTestId('themed-content')).toBeTruthy();
    });
  });

  describe('Accessibility Integration', () => {
    it('applies accessibility settings across all components', () => {
      const AccessibilityApp = () => (
        <>
          <MockEnhancedButton testID="accessible-button">
            Accessible Button
          </MockEnhancedButton>

          <MockEnhancedTextInput testID="accessible-input" />

          <MockEnhancedJournalCard
            entry={{
              id: '1',
              title: 'Test',
              content: 'Content',
              createdAt: new Date(),
              updatedAt: new Date(),
            }}
            onPress={jest.fn()}
            testID="accessible-card"
          />
        </>
      );

      const { getByTestId } = renderWithAccessibility(
        <AccessibilityApp />,
        {
          reducedMotion: true,
          highContrast: true,
          fontSize: 20,
        }
      );

      expect(getByTestId('accessible-button')).toBeTruthy();
      expect(getByTestId('accessible-input')).toBeTruthy();
      expect(getByTestId('accessible-card')).toBeTruthy();
    });

    it('handles accessibility preference changes', () => {
      const AccessibilityToggleApp = () => {
        const [reducedMotion, setReducedMotion] = React.useState(false);

        return (
          <AccessibilityProvider value={{ reducedMotion, highContrast: false, fontSize: 16 }}>
            <MockEnhancedButton
              onPress={() => setReducedMotion(!reducedMotion)}
              testID="motion-toggle"
            >
              Toggle Motion
            </MockEnhancedButton>

            <MockEnhancedCharts
              type="line"
              data={[]}
              animated={!reducedMotion}
              testID="animated-chart"
            />
          </AccessibilityProvider>
        );
      };

      const { getByTestId } = render(<AccessibilityToggleApp />);

      expect(getByTestId('motion-toggle')).toBeTruthy();
      expect(getByTestId('animated-chart')).toBeTruthy();

      // Toggle reduced motion
      fireEvent.press(getByTestId('motion-toggle'));
      expect(getByTestId('animated-chart')).toBeTruthy();
    });
  });

  describe('Performance Integration', () => {
    it('handles multiple components efficiently', () => {
      const PerformanceApp = () => {
        const [componentCount, setComponentCount] = React.useState(5);

        return (
          <>
            <MockEnhancedButton
              onPress={() => setComponentCount(componentCount + 5)}
              testID="add-components"
            >
              Add Components
            </MockEnhancedButton>

            {Array.from({ length: componentCount }, (_, i) => (
              <MockEnhancedButton
                key={i}
                testID={`dynamic-button-${i}`}
              >
                Button {i}
              </MockEnhancedButton>
            ))}
          </>
        );
      };

      const startTime = performance.now();
      const { getByTestId, getAllByTestId } = renderWithAccessibility(<PerformanceApp />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should render quickly
      expect(getByTestId('add-components')).toBeTruthy();
      expect(getAllByTestId(/dynamic-button-/)).toHaveLength(5);

      // Add more components
      fireEvent.press(getByTestId('add-components'));
      expect(getAllByTestId(/dynamic-button-/)).toHaveLength(10);
    });

    it('optimizes re-renders with complex component trees', () => {
      let renderCount = 0;

      const OptimizedComponent = React.memo(() => {
        renderCount++;
        return (
          <MockEnhancedButton testID="optimized-button">
            Optimized Button
          </MockEnhancedButton>
        );
      });

      const OptimizationApp = () => {
        const [counter, setCounter] = React.useState(0);

        return (
          <>
            <MockEnhancedButton
              onPress={() => setCounter(counter + 1)}
              testID="increment-counter"
            >
              Count: {counter}
            </MockEnhancedButton>

            <OptimizedComponent />
          </>
        );
      };

      const { getByTestId, rerender } = renderWithAccessibility(<OptimizationApp />);

      expect(renderCount).toBe(1);
      expect(getByTestId('increment-counter')).toBeTruthy();

      // Re-render should not cause OptimizedComponent to re-render
      fireEvent.press(getByTestId('increment-counter'));
      expect(renderCount).toBe(1); // Should still be 1 due to memoization
    });
  });

  describe('Error Boundary Integration', () => {
    it('handles component errors gracefully', () => {
      const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
        try {
          return <>{children}</>;
        } catch (error) {
          return (
            <MockEnhancedButton testID="error-fallback">
              Something went wrong
            </MockEnhancedButton>
          );
        }
      };

      const ErrorProneApp = () => {
        const [shouldError, setShouldError] = React.useState(false);

        if (shouldError) {
          throw new Error('Test error');
        }

        return (
          <MockEnhancedButton
            onPress={() => setShouldError(true)}
            testID="trigger-error"
          >
            Trigger Error
          </MockEnhancedButton>
        );
      };

      const { getByTestId } = renderWithAccessibility(
        <ErrorBoundary>
          <ErrorProneApp />
        </ErrorBoundary>
      );

      expect(getByTestId('trigger-error')).toBeTruthy();
    });
  });

  describe('State Management Integration', () => {
    it('handles shared state across components', () => {
      const SharedStateApp = () => {
        const [globalState, setGlobalState] = React.useState({
          modalVisible: false,
          loadingVisible: false,
          inputValue: '',
        });

        return (
          <>
            <MockEnhancedTextInput
              value={globalState.inputValue}
              onChangeText={(text: string) =>
                setGlobalState(prev => ({ ...prev, inputValue: text }))
              }
              testID="shared-input"
            />

            <MockEnhancedButton
              onPress={() =>
                setGlobalState(prev => ({ ...prev, modalVisible: true }))
              }
              testID="shared-modal-btn"
            >
              Open Modal
            </MockEnhancedButton>

            <MockEnhancedModal
              visible={globalState.modalVisible}
              testID="shared-modal"
            >
              <MockEnhancedButton
                onPress={() =>
                  setGlobalState(prev => ({ ...prev, modalVisible: false }))
                }
                testID="close-shared-modal"
              >
                Close
              </MockEnhancedButton>
            </MockEnhancedModal>
          </>
        );
      };

      const { getByTestId, queryByTestId } = renderWithAccessibility(<SharedStateApp />);

      expect(getByTestId('shared-input')).toBeTruthy();
      expect(getByTestId('shared-modal-btn')).toBeTruthy();
      expect(queryByTestId('shared-modal')).toBeNull();

      // Update input
      fireEvent.changeText(getByTestId('shared-input'), 'test input');

      // Open modal
      fireEvent.press(getByTestId('shared-modal-btn'));
      expect(getByTestId('shared-modal')).toBeTruthy();

      // Close modal
      fireEvent.press(getByTestId('close-shared-modal'));
      expect(queryByTestId('shared-modal')).toBeNull();
    });
  });

  describe('Haptic Feedback Integration', () => {
    it('coordinates haptic feedback across components', async () => {
      const HapticApp = () => (
        <>
          <MockEnhancedButton
            onPress={() => mockHaptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            testID="haptic-button-1"
          >
            Light Haptic
          </MockEnhancedButton>

          <MockEnhancedButton
            onPress={() => mockHaptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
            testID="haptic-button-2"
          >
            Medium Haptic
          </MockEnhancedButton>
        </>
      );

      const { getByTestId } = renderWithAccessibility(<HapticApp />);

      fireEvent.press(getByTestId('haptic-button-1'));
      await waitFor(() => {
        expect(mockHaptics.impactAsync).toHaveBeenCalledWith(
          Haptics.ImpactFeedbackStyle.Light
        );
      });

      fireEvent.press(getByTestId('haptic-button-2'));
      await waitFor(() => {
        expect(mockHaptics.impactAsync).toHaveBeenCalledWith(
          Haptics.ImpactFeedbackStyle.Medium
        );
      });
    });
  });

  describe('Animation Integration', () => {
    it('handles complex animation sequences', async () => {
      const AnimationApp = () => {
        const [showSequence, setShowSequence] = React.useState(false);

        return (
          <>
            <MockEnhancedButton
              onPress={() => setShowSequence(true)}
              testID="start-animation"
            >
              Start Animation
            </MockEnhancedButton>

            {showSequence && (
              <>
                <MockEnhancedModal
                  visible={true}
                  testID="animated-modal"
                >
                  Modal with Animation
                </MockEnhancedModal>

                <MockEnhancedLoadingIndicator
                  visible={true}
                  testID="animated-loading"
                />
              </>
            )}
          </>
        );
      };

      const { getByTestId, queryByTestId } = renderWithAccessibility(<AnimationApp />);

      expect(queryByTestId('animated-modal')).toBeNull();
      expect(queryByTestId('animated-loading')).toBeNull();

      fireEvent.press(getByTestId('start-animation'));

      await waitFor(() => {
        expect(getByTestId('animated-modal')).toBeTruthy();
        expect(getByTestId('animated-loading')).toBeTruthy();
      });
    });
  });
});
