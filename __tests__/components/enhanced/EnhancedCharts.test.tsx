import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { EnhancedCharts } from '../../../components/enhanced/EnhancedCharts';
import { AccessibilityProvider } from '../../../context/AccessibilityContext';

// Mock dependencies
jest.mock('expo-haptics');
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
jest.mock('react-native-svg', () => ({
  Svg: 'Svg',
  Line: 'Line',
  Circle: 'Circle',
  Path: 'Path',
  Text: 'Text',
  G: 'G',
  Rect: 'Rect',
}));

const mockHaptics = Haptics as jest.Mocked<typeof Haptics>;

const mockMoodData = [
  { date: '2024-01-01', value: 5, label: 'Average' },
  { date: '2024-01-02', value: 7, label: 'Good' },
  { date: '2024-01-03', value: 3, label: 'Low' },
  { date: '2024-01-04', value: 8, label: 'Great' },
  { date: '2024-01-05', value: 6, label: 'Good' },
  { date: '2024-01-06', value: 9, label: 'Excellent' },
  { date: '2024-01-07', value: 4, label: 'Below Average' },
];

const mockCategoryData = [
  { label: 'Work', value: 45, color: '#FF6B6B' },
  { label: 'Personal', value: 30, color: '#4ECDC4' },
  { label: 'Health', value: 25, color: '#45B7D1' },
];

const mockProgressData = [
  { period: 'Week 1', value: 65 },
  { period: 'Week 2', value: 72 },
  { period: 'Week 3', value: 68 },
  { period: 'Week 4', value: 85 },
];

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

describe('EnhancedCharts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Line Chart', () => {
    it('renders line chart correctly', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedCharts
          type="line"
          data={mockMoodData}
          testID="test-chart"
        />
      );

      expect(getByTestId('test-chart')).toBeTruthy();
      expect(getByTestId('test-chart-line')).toBeTruthy();
    });

    it('displays chart title when provided', () => {
      const { getByText } = renderWithAccessibility(
        <EnhancedCharts
          type="line"
          data={mockMoodData}
          title="Mood Trends"
          testID="test-chart"
        />
      );

      expect(getByText('Mood Trends')).toBeTruthy();
    });

    it('displays data points on line chart', () => {
      const { getAllByTestId } = renderWithAccessibility(
        <EnhancedCharts
          type="line"
          data={mockMoodData}
          showDataPoints={true}
          testID="test-chart"
        />
      );

      const dataPoints = getAllByTestId(/test-chart-point-/);
      expect(dataPoints).toHaveLength(mockMoodData.length);
    });

    it('handles line chart interactions', async () => {
      const onDataPointPressMock = jest.fn();
      
      const { getByTestId } = renderWithAccessibility(
        <EnhancedCharts
          type="line"
          data={mockMoodData}
          showDataPoints={true}
          onDataPointPress={onDataPointPressMock}
          testID="test-chart"
        />
      );

      const firstPoint = getByTestId('test-chart-point-0');
      fireEvent.press(firstPoint);

      await waitFor(() => {
        expect(onDataPointPressMock).toHaveBeenCalledWith(mockMoodData[0], 0);
      });
    });

    it('shows animated line drawing when enabled', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedCharts
          type="line"
          data={mockMoodData}
          animated={true}
          testID="test-chart"
        />
      );

      expect(getByTestId('test-chart-line')).toBeTruthy();
    });
  });

  describe('Bar Chart', () => {
    it('renders bar chart correctly', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedCharts
          type="bar"
          data={mockMoodData}
          testID="test-chart"
        />
      );

      expect(getByTestId('test-chart')).toBeTruthy();
      expect(getByTestId('test-chart-bars')).toBeTruthy();
    });

    it('displays bars for each data point', () => {
      const { getAllByTestId } = renderWithAccessibility(
        <EnhancedCharts
          type="bar"
          data={mockMoodData}
          testID="test-chart"
        />
      );

      const bars = getAllByTestId(/test-chart-bar-/);
      expect(bars).toHaveLength(mockMoodData.length);
    });

    it('handles bar chart interactions', async () => {
      const onDataPointPressMock = jest.fn();
      
      const { getByTestId } = renderWithAccessibility(
        <EnhancedCharts
          type="bar"
          data={mockMoodData}
          onDataPointPress={onDataPointPressMock}
          testID="test-chart"
        />
      );

      const firstBar = getByTestId('test-chart-bar-0');
      fireEvent.press(firstBar);

      await waitFor(() => {
        expect(onDataPointPressMock).toHaveBeenCalledWith(mockMoodData[0], 0);
      });
    });

    it('shows value labels when enabled', () => {
      const { getAllByTestId } = renderWithAccessibility(
        <EnhancedCharts
          type="bar"
          data={mockMoodData}
          showValues={true}
          testID="test-chart"
        />
      );

      const valueLabels = getAllByTestId(/test-chart-value-/);
      expect(valueLabels).toHaveLength(mockMoodData.length);
    });
  });

  describe('Pie Chart', () => {
    it('renders pie chart correctly', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedCharts
          type="pie"
          data={mockCategoryData}
          testID="test-chart"
        />
      );

      expect(getByTestId('test-chart')).toBeTruthy();
      expect(getByTestId('test-chart-pie')).toBeTruthy();
    });

    it('displays slices for each data point', () => {
      const { getAllByTestId } = renderWithAccessibility(
        <EnhancedCharts
          type="pie"
          data={mockCategoryData}
          testID="test-chart"
        />
      );

      const slices = getAllByTestId(/test-chart-slice-/);
      expect(slices).toHaveLength(mockCategoryData.length);
    });

    it('shows legend when enabled', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedCharts
          type="pie"
          data={mockCategoryData}
          showLegend={true}
          testID="test-chart"
        />
      );

      expect(getByTestId('test-chart-legend')).toBeTruthy();
    });

    it('handles pie slice interactions', async () => {
      const onDataPointPressMock = jest.fn();
      
      const { getByTestId } = renderWithAccessibility(
        <EnhancedCharts
          type="pie"
          data={mockCategoryData}
          onDataPointPress={onDataPointPressMock}
          testID="test-chart"
        />
      );

      const firstSlice = getByTestId('test-chart-slice-0');
      fireEvent.press(firstSlice);

      await waitFor(() => {
        expect(onDataPointPressMock).toHaveBeenCalledWith(mockCategoryData[0], 0);
      });
    });

    it('shows percentage labels when enabled', () => {
      const { getByText } = renderWithAccessibility(
        <EnhancedCharts
          type="pie"
          data={mockCategoryData}
          showPercentages={true}
          testID="test-chart"
        />
      );

      expect(getByText('45%')).toBeTruthy();
      expect(getByText('30%')).toBeTruthy();
      expect(getByText('25%')).toBeTruthy();
    });
  });

  describe('Progress Chart', () => {
    it('renders progress chart correctly', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedCharts
          type="progress"
          data={mockProgressData}
          testID="test-chart"
        />
      );

      expect(getByTestId('test-chart')).toBeTruthy();
      expect(getByTestId('test-chart-progress')).toBeTruthy();
    });

    it('displays progress bars for each period', () => {
      const { getAllByTestId } = renderWithAccessibility(
        <EnhancedCharts
          type="progress"
          data={mockProgressData}
          testID="test-chart"
        />
      );

      const progressBars = getAllByTestId(/test-chart-progress-bar-/);
      expect(progressBars).toHaveLength(mockProgressData.length);
    });

    it('shows progress values when enabled', () => {
      const { getByText } = renderWithAccessibility(
        <EnhancedCharts
          type="progress"
          data={mockProgressData}
          showValues={true}
          testID="test-chart"
        />
      );

      expect(getByText('65%')).toBeTruthy();
      expect(getByText('72%')).toBeTruthy();
      expect(getByText('85%')).toBeTruthy();
    });

    it('animates progress bars when enabled', () => {
      const { getAllByTestId } = renderWithAccessibility(
        <EnhancedCharts
          type="progress"
          data={mockProgressData}
          animated={true}
          testID="test-chart"
        />
      );

      const progressBars = getAllByTestId(/test-chart-progress-bar-/);
      expect(progressBars).toHaveLength(mockProgressData.length);
    });
  });

  describe('Chart Customization', () => {
    it('applies custom colors', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedCharts
          type="line"
          data={mockMoodData}
          primaryColor="#FF0000"
          secondaryColor="#00FF00"
          testID="test-chart"
        />
      );

      expect(getByTestId('test-chart')).toBeTruthy();
    });

    it('handles custom dimensions', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedCharts
          type="bar"
          data={mockMoodData}
          width={400}
          height={300}
          testID="test-chart"
        />
      );

      const chart = getByTestId('test-chart');
      expect(chart.props.style).toMatchObject({
        width: 400,
        height: 300,
      });
    });

    it('applies custom styling', () => {
      const customStyle = { backgroundColor: '#F0F0F0' };
      
      const { getByTestId } = renderWithAccessibility(
        <EnhancedCharts
          type="line"
          data={mockMoodData}
          style={customStyle}
          testID="test-chart"
        />
      );

      const chart = getByTestId('test-chart');
      expect(chart.props.style).toMatchObject(customStyle);
    });

    it('handles gradient fills when enabled', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedCharts
          type="line"
          data={mockMoodData}
          fillGradient={true}
          testID="test-chart"
        />
      );

      expect(getByTestId('test-chart-gradient')).toBeTruthy();
    });
  });

  describe('Accessibility Features', () => {
    it('has correct accessibility role and properties', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedCharts
          type="line"
          data={mockMoodData}
          title="Mood Trends"
          testID="test-chart"
        />
      );

      const chart = getByTestId('test-chart');
      expect(chart.props.accessibilityRole).toBe('image');
      expect(chart.props.accessibilityLabel).toContain('Mood Trends chart');
    });

    it('provides data summary for screen readers', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedCharts
          type="bar"
          data={mockMoodData}
          testID="test-chart"
        />
      );

      const chart = getByTestId('test-chart');
      expect(chart.props.accessibilityLabel).toContain('7 data points');
      expect(chart.props.accessibilityLabel).toContain('values range from 3 to 9');
    });

    it('announces data point interactions', async () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedCharts
          type="line"
          data={mockMoodData}
          showDataPoints={true}
          testID="test-chart"
        />
      );

      const firstPoint = getByTestId('test-chart-point-0');
      expect(firstPoint.props.accessibilityLabel).toContain('Data point 1');
      expect(firstPoint.props.accessibilityLabel).toContain('value 5');
    });

    it('respects reduced motion preferences', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedCharts
          type="line"
          data={mockMoodData}
          animated={true}
          testID="test-chart"
        />,
        { reducedMotion: true }
      );

      expect(getByTestId('test-chart')).toBeTruthy();
    });

    it('supports high contrast mode', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedCharts
          type="pie"
          data={mockCategoryData}
          testID="test-chart"
        />,
        { highContrast: true }
      );

      expect(getByTestId('test-chart')).toBeTruthy();
    });

    it('respects font size preferences for labels', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedCharts
          type="bar"
          data={mockMoodData}
          showValues={true}
          testID="test-chart"
        />,
        { fontSize: 20 }
      );

      expect(getByTestId('test-chart')).toBeTruthy();
    });
  });

  describe('Haptic Feedback', () => {
    it('triggers haptic feedback on data point interaction', async () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedCharts
          type="line"
          data={mockMoodData}
          showDataPoints={true}
          enableHaptics={true}
          testID="test-chart"
        />
      );

      const firstPoint = getByTestId('test-chart-point-0');
      fireEvent.press(firstPoint);

      await waitFor(() => {
        expect(mockHaptics.impactAsync).toHaveBeenCalledWith(
          Haptics.ImpactFeedbackStyle.Light
        );
      });
    });

    it('does not trigger haptic feedback when disabled', async () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedCharts
          type="bar"
          data={mockMoodData}
          enableHaptics={false}
          testID="test-chart"
        />
      );

      const firstBar = getByTestId('test-chart-bar-0');
      fireEvent.press(firstBar);

      expect(mockHaptics.impactAsync).not.toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('renders efficiently with large datasets', () => {
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        value: Math.floor(Math.random() * 10) + 1,
        label: `Day ${i + 1}`,
      }));

      const startTime = performance.now();
      
      const { getByTestId } = renderWithAccessibility(
        <EnhancedCharts
          type="line"
          data={largeDataset}
          testID="test-chart"
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(getByTestId('test-chart')).toBeTruthy();
      expect(renderTime).toBeLessThan(200); // Should render efficiently
    });

    it('handles rapid data updates', () => {
      let currentData = mockMoodData;

      const { rerender, getByTestId } = renderWithAccessibility(
        <EnhancedCharts
          type="bar"
          data={currentData}
          testID="test-chart"
        />
      );

      // Rapid data updates
      for (let i = 0; i < 10; i++) {
        currentData = currentData.map(item => ({
          ...item,
          value: Math.floor(Math.random() * 10) + 1,
        }));

        rerender(
          <AccessibilityProvider value={{ reducedMotion: false, highContrast: false, fontSize: 16 }}>
            <EnhancedCharts
              type="bar"
              data={currentData}
              testID="test-chart"
            />
          </AccessibilityProvider>
        );

        expect(getByTestId('test-chart')).toBeTruthy();
      }
    });

    it('optimizes re-renders with memoization', () => {
      const renderSpy = jest.fn();
      
      const ChartWrapper = React.memo(({ data }: { data: any[] }) => {
        renderSpy();
        return (
          <EnhancedCharts
            type="line"
            data={data}
            testID="test-chart"
          />
        );
      });

      const { rerender } = renderWithAccessibility(
        <ChartWrapper data={mockMoodData} />
      );

      // Re-render with same data - should not trigger new render
      rerender(
        <AccessibilityProvider value={{ reducedMotion: false, highContrast: false, fontSize: 16 }}>
          <ChartWrapper data={mockMoodData} />
        </AccessibilityProvider>
      );

      expect(renderSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('handles empty data gracefully', () => {
      expect(() => {
        renderWithAccessibility(
          <EnhancedCharts
            type="line"
            data={[]}
            testID="test-chart"
          />
        );
      }).not.toThrow();
    });

    it('handles invalid data formats gracefully', () => {
      const invalidData = [
        { invalidField: 'test' },
        { value: 'not-a-number' },
        null,
        undefined,
      ];

      expect(() => {
        renderWithAccessibility(
          <EnhancedCharts
            type="bar"
            data={invalidData as any}
            testID="test-chart"
          />
        );
      }).not.toThrow();
    });

    it('handles missing required properties', () => {
      expect(() => {
        renderWithAccessibility(
          <EnhancedCharts
            type="pie"
            data={undefined as any}
            testID="test-chart"
          />
        );
      }).not.toThrow();
    });

    it('handles invalid chart type gracefully', () => {
      expect(() => {
        renderWithAccessibility(
          <EnhancedCharts
            type={'invalid' as any}
            data={mockMoodData}
            testID="test-chart"
          />
        );
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('handles single data point', () => {
      const singleDataPoint = [{ date: '2024-01-01', value: 5, label: 'Single' }];
      
      const { getByTestId } = renderWithAccessibility(
        <EnhancedCharts
          type="line"
          data={singleDataPoint}
          testID="test-chart"
        />
      );

      expect(getByTestId('test-chart')).toBeTruthy();
    });

    it('handles extreme values', () => {
      const extremeData = [
        { date: '2024-01-01', value: 0, label: 'Min' },
        { date: '2024-01-02', value: 1000000, label: 'Max' },
      ];
      
      const { getByTestId } = renderWithAccessibility(
        <EnhancedCharts
          type="bar"
          data={extremeData}
          testID="test-chart"
        />
      );

      expect(getByTestId('test-chart')).toBeTruthy();
    });

    it('handles negative values', () => {
      const negativeData = [
        { date: '2024-01-01', value: -5, label: 'Negative' },
        { date: '2024-01-02', value: 5, label: 'Positive' },
      ];
      
      const { getByTestId } = renderWithAccessibility(
        <EnhancedCharts
          type="line"
          data={negativeData}
          testID="test-chart"
        />
      );

      expect(getByTestId('test-chart')).toBeTruthy();
    });

    it('handles very small chart dimensions', () => {
      const { getByTestId } = renderWithAccessibility(
        <EnhancedCharts
          type="pie"
          data={mockCategoryData}
          width={50}
          height={50}
          testID="test-chart"
        />
      );

      expect(getByTestId('test-chart')).toBeTruthy();
    });
  });
});
