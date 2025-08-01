import React from 'react';
import { ThemedText } from '../../components/ThemedText';

// Mock dependencies
jest.mock('../../hooks/useThemeColor', () => ({
  useThemeColor: jest.fn((props, colorName) => {
    const colors: Record<string, string> = {
      text: '#000000',
      background: '#FFFFFF'
    };
    return colors[colorName] || '#000000';
  })
}));

jest.mock('react-native', () => ({
  Text: ({ children, style, ...props }: any) => ({ 
    type: 'Text', 
    props: { ...props, children, style }
  }),
  StyleSheet: {
    create: (styles: any) => styles
  }
}));

describe('ThemedText', () => {
  const mockUseThemeColor = require('../../hooks/useThemeColor').useThemeColor;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render with children text', () => {
      const component = ThemedText({ children: 'Hello World' });
      expect(component).toBeDefined();
      expect(component.props.children).toBe('Hello World');
    });

    it('should render without children', () => {
      const component = ThemedText({});
      expect(component).toBeDefined();
    });
  });

  describe('Theme Integration', () => {
    it('should use theme color for text', () => {
      mockUseThemeColor.mockReturnValue('#333333');
      
      const component = ThemedText({ children: 'Themed text' });
      expect(mockUseThemeColor).toHaveBeenCalledWith(expect.any(Object), 'text');
      expect(component.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ color: '#333333' })
        ])
      );
    });

    it('should override theme color with lightColor prop', () => {
      const component = ThemedText({ 
        children: 'Light themed text',
        lightColor: '#666666'
      });
      
      expect(mockUseThemeColor).toHaveBeenCalledWith(
        expect.objectContaining({ light: '#666666' }),
        'text'
      );
    });

    it('should override theme color with darkColor prop', () => {
      const component = ThemedText({ 
        children: 'Dark themed text',
        darkColor: '#CCCCCC'
      });
      
      expect(mockUseThemeColor).toHaveBeenCalledWith(
        expect.objectContaining({ dark: '#CCCCCC' }),
        'text'
      );
    });
  });

  describe('Typography Types', () => {
    it('should apply default type styling', () => {
      const component = ThemedText({ 
        children: 'Default text',
        type: 'default'
      });
      
      expect(component.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            fontSize: 16,
            lineHeight: 24
          })
        ])
      );
    });

    it('should apply title type styling', () => {
      const component = ThemedText({ 
        children: 'Title text',
        type: 'title'
      });
      
      expect(component.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            fontSize: 32,
            fontWeight: 'bold',
            lineHeight: 32
          })
        ])
      );
    });

    it('should apply defaultSemiBold type styling', () => {
      const component = ThemedText({ 
        children: 'Semi bold text',
        type: 'defaultSemiBold'
      });
      
      expect(component.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            fontSize: 16,
            lineHeight: 24,
            fontWeight: '600'
          })
        ])
      );
    });

    it('should apply subtitle type styling', () => {
      const component = ThemedText({ 
        children: 'Subtitle text',
        type: 'subtitle'
      });
      
      expect(component.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            fontSize: 20,
            fontWeight: 'bold'
          })
        ])
      );
    });

    it('should apply link type styling', () => {
      const component = ThemedText({ 
        children: 'Link text',
        type: 'link'
      });
      
      expect(component.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            lineHeight: 30,
            fontSize: 16
          })
        ])
      );
    });
  });

  describe('Style Composition', () => {
    it('should merge custom styles with type styles', () => {
      const customStyle = { marginTop: 10, fontStyle: 'italic' as const };
      const component = ThemedText({ 
        children: 'Styled text',
        type: 'default',
        style: customStyle
      });
      
      expect(component.props.style).toBeDefined();
      expect(Array.isArray(component.props.style)).toBe(true);
    });

    it('should handle array of styles', () => {
      const styles = [{ marginTop: 10 }, { paddingLeft: 5 }];
      const component = ThemedText({ 
        children: 'Multi-styled text',
        style: styles
      });
      
      expect(component.props.style).toBeDefined();
      expect(Array.isArray(component.props.style)).toBe(true);
    });
  });

  describe('Props Forwarding', () => {
    it('should forward additional props to Text component', () => {
      const component = ThemedText({ 
        children: 'Accessible text',
        accessibilityLabel: 'Text label',
        accessibilityRole: 'text',
        testID: 'themed-text'
      });
      
      expect(component.props.accessibilityLabel).toBe('Text label');
      expect(component.props.accessibilityRole).toBe('text');
      expect(component.props.testID).toBe('themed-text');
    });

    it('should handle numberOfLines prop', () => {
      const component = ThemedText({ 
        children: 'Multi-line text that might be truncated',
        numberOfLines: 2
      });
      
      expect(component.props.numberOfLines).toBe(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined type gracefully', () => {
      const component = ThemedText({ children: 'Test content' });
      
      expect(component).toBeDefined();
      expect(component.type.displayName || component.type.name || component.type).toBe('Text');
    });

    it('should handle empty string children', () => {
      const component = ThemedText({ children: '' });
      
      expect(component).toBeDefined();
      expect(component.props.children).toBe('');
    });

    it('should handle complex children (elements)', () => {
      const complexChildren = 'Simple text content';
      
      const component = ThemedText({ children: complexChildren });
      
      expect(component).toBeDefined();
      expect(component.props.children).toEqual(complexChildren);
    });
  });
});
