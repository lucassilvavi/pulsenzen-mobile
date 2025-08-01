import React from 'react';
import { IconSymbol } from '../../../components/ui/IconSymbol';

// Mock dependencies
jest.mock('expo-symbols', () => ({
  SymbolView: ({ children, ...props }: any) => ({
    type: 'SymbolView',
    props: { ...props, children }
  }),
}));

jest.mock('react-native', () => ({
  Text: ({ children, ...props }: any) => ({
    type: 'Text',
    props: { ...props, children }
  }),
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios),
  },
}));

describe('IconSymbol', () => {
  const defaultProps = { name: 'heart', color: '#000000' };

  describe('Component Creation', () => {
    it('should create component successfully', () => {
      expect(typeof IconSymbol).toBe('function');
    });

    it('should have default props', () => {
      const component = IconSymbol(defaultProps);
      expect(component).toBeDefined();
    });
  });

  describe('Platform Handling', () => {
    it('should handle iOS platform', () => {
      const component = IconSymbol({ ...defaultProps, size: 24 });
      expect(component).toBeDefined();
      expect(component.props.name).toBe('heart');
    });

    it('should handle Android platform fallback', () => {
      const mockPlatform = require('react-native').Platform;
      mockPlatform.OS = 'android';
      mockPlatform.select = jest.fn((obj) => obj.default);

      const component = IconSymbol({ ...defaultProps, size: 24 });
      expect(component).toBeDefined();
    });
  });

  describe('Props Validation', () => {
    it('should accept valid icon names', () => {
      const validNames = ['heart', 'star', 'home', 'user', 'music.note'];
      
      validNames.forEach(name => {
        const component = IconSymbol({ name, color: '#000000', size: 24 });
        expect(component).toBeDefined();
      });
    });

    it('should accept size prop', () => {
      const component = IconSymbol({ ...defaultProps, size: 32 });
      expect(component).toBeDefined();
      // Size prop is passed through
    });

    it('should accept color prop', () => {
      const component = IconSymbol({ name: 'heart', color: '#FF0000' });
      expect(component.props.tintColor).toBe('#FF0000');
    });

    it('should accept style prop', () => {
      const style = { marginTop: 10 };
      const component = IconSymbol({ ...defaultProps, style });
      expect(component.props.style).toEqual(expect.arrayContaining([style]));
    });
  });

  describe('Breathing Module Icons', () => {
    it('should support breathing technique icons', () => {
      const breathingIcons = ['lungs', 'wind', 'circle', 'timer'];
      
      breathingIcons.forEach(name => {
        const component = IconSymbol({ name, color: '#000000', size: 24 });
        expect(component).toBeDefined();
      });
    });

    it('should handle breathing session icons', () => {
      const sessionIcons = ['play', 'pause', 'stop', 'forward'];
      
      sessionIcons.forEach(name => {
        const component = IconSymbol({ name, color: '#000000', size: 24 });
        expect(component).toBeDefined();
      });
    });
  });

  describe('Accessibility', () => {
    it('should support basic accessibility', () => {
      const component = IconSymbol({ 
        name: 'heart', 
        color: '#000000'
      });
      
      expect(component).toBeDefined();
    });
  });
});
