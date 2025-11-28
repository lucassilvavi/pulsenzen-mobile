import { AccessibilityInfo, Platform } from 'react-native';
import { structuredLogger } from './structuredLogger';

/**
 * Comprehensive accessibility utilities for React Native applications
 * Provides screen reader support, focus management, and enhanced user experience
 */

export interface AccessibilityOptions {
  label?: string;
  hint?: string;
  role?: 'none' | 'button' | 'link' | 'search' | 'image' | 'text' | 'adjustable' | 'header' | 'summary' | 'imagebutton';
  state?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean | 'mixed';
    expanded?: boolean;
    busy?: boolean;
  };
  actions?: Array<{
    name: string;
    label?: string;
  }>;
  value?: {
    min?: number;
    max?: number;
    now?: number;
    text?: string;
  };
}

export interface ScreenReaderState {
  enabled: boolean;
  boldTextEnabled: boolean;
  grayscaleEnabled: boolean;
  invertColorsEnabled: boolean;
  reduceMotionEnabled: boolean;
  reduceTransparencyEnabled: boolean;
  screenReaderEnabled: boolean;
}

class AccessibilityManager {
  private static instance: AccessibilityManager;
  private screenReaderState: ScreenReaderState | null = null;
  private listeners: Array<() => void> = [];
  private announcementQueue: string[] = [];
  private isProcessingQueue = false;

  private constructor() {
    this.initializeAccessibilityState();
    this.setupEventListeners();
  }

  public static getInstance(): AccessibilityManager {
    if (!AccessibilityManager.instance) {
      AccessibilityManager.instance = new AccessibilityManager();
    }
    return AccessibilityManager.instance;
  }

  /**
   * Initialize accessibility state by checking all available options
   */
  private async initializeAccessibilityState(): Promise<void> {
    try {
      // Skip on web platform - accessibility APIs are not available
      if (Platform.OS === 'web') {
        this.state = {
          boldTextEnabled: false,
          grayscaleEnabled: false,
          invertColorsEnabled: false,
          reduceMotionEnabled: false,
          reduceTransparencyEnabled: false,
          screenReaderEnabled: false,
        };
        return;
      }

      const [
        boldTextEnabled,
        grayscaleEnabled,
        invertColorsEnabled,
        reduceMotionEnabled,
        reduceTransparencyEnabled,
        screenReaderEnabled,
      ] = await Promise.all([
        AccessibilityInfo.isBoldTextEnabled(),
        AccessibilityInfo.isGrayscaleEnabled(),
        AccessibilityInfo.isInvertColorsEnabled(),
        AccessibilityInfo.isReduceMotionEnabled(),
        AccessibilityInfo.isReduceTransparencyEnabled(),
        AccessibilityInfo.isScreenReaderEnabled(),
      ]);

      this.screenReaderState = {
        enabled: screenReaderEnabled,
        boldTextEnabled,
        grayscaleEnabled,
        invertColorsEnabled,
        reduceMotionEnabled,
        reduceTransparencyEnabled,
        screenReaderEnabled,
      };

      structuredLogger.info('Accessibility state initialized', {
        component: 'AccessibilityManager',
      });
    } catch (error) {
      structuredLogger.error('Failed to initialize accessibility state', error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  /**
   * Set up event listeners for accessibility changes
   */
  private setupEventListeners(): void {
    try {
      // Screen reader state changes
      const screenReaderListener = AccessibilityInfo.addEventListener(
        'screenReaderChanged',
        (enabled: boolean) => {
          if (this.screenReaderState) {
            this.screenReaderState.screenReaderEnabled = enabled;
            this.screenReaderState.enabled = enabled;
          }
          structuredLogger.info('Screen reader state changed', {
            component: 'AccessibilityManager',
          });
        }
      );

      // Bold text changes
      const boldTextListener = AccessibilityInfo.addEventListener(
        'boldTextChanged',
        (enabled: boolean) => {
          if (this.screenReaderState) {
            this.screenReaderState.boldTextEnabled = enabled;
          }
          structuredLogger.info('Bold text state changed', {
            component: 'AccessibilityManager',
          });
        }
      );

      // Reduce motion changes
      const reduceMotionListener = AccessibilityInfo.addEventListener(
        'reduceMotionChanged',
        (enabled: boolean) => {
          if (this.screenReaderState) {
            this.screenReaderState.reduceMotionEnabled = enabled;
          }
          structuredLogger.info('Reduce motion state changed', {
            component: 'AccessibilityManager',
          });
        }
      );

      // Store listeners for cleanup
      this.listeners.push(
        () => screenReaderListener.remove(),
        () => boldTextListener.remove(),
        () => reduceMotionListener.remove()
      );
    } catch (error) {
      structuredLogger.error('Failed to setup accessibility listeners', error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  /**
   * Get current accessibility state
   */
  public getAccessibilityState(): ScreenReaderState | null {
    return this.screenReaderState;
  }

  /**
   * Check if screen reader is enabled
   */
  public isScreenReaderEnabled(): boolean {
    return this.screenReaderState?.screenReaderEnabled ?? false;
  }

  /**
   * Check if animations should be reduced
   */
  public shouldReduceMotion(): boolean {
    return this.screenReaderState?.reduceMotionEnabled ?? false;
  }

  /**
   * Check if bold text is enabled
   */
  public isBoldTextEnabled(): boolean {
    return this.screenReaderState?.boldTextEnabled ?? false;
  }

  /**
   * Announce message to screen reader with queue management
   */
  public async announceForScreenReader(
    message: string,
    priority: 'low' | 'normal' | 'high' = 'normal'
  ): Promise<void> {
    if (!message.trim()) return;

    try {
      if (priority === 'high') {
        // High priority messages bypass the queue
        AccessibilityInfo.announceForAccessibility(message);
        structuredLogger.debug('High priority accessibility announcement', {
          component: 'AccessibilityManager',
        });
        return;
      }

      // Add to queue for normal/low priority
      this.announcementQueue.push(message);
      
      if (!this.isProcessingQueue) {
        await this.processAnnouncementQueue();
      }
    } catch (error) {
      structuredLogger.error('Failed to announce message', error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  /**
   * Process announcement queue with delays to prevent overwhelming screen readers
   */
  private async processAnnouncementQueue(): Promise<void> {
    this.isProcessingQueue = true;

    while (this.announcementQueue.length > 0) {
      const message = this.announcementQueue.shift();
      if (message) {
        AccessibilityInfo.announceForAccessibility(message);
        structuredLogger.debug('Accessibility announcement processed', {
          component: 'AccessibilityManager',
        });
        
        // Wait before processing next announcement
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * Set focus to a specific element (iOS only)
   */
  public setAccessibilityFocus(reactTag: number): void {
    if (Platform.OS === 'ios') {
      try {
        AccessibilityInfo.setAccessibilityFocus(reactTag);
        structuredLogger.debug('Accessibility focus set', {
          component: 'AccessibilityManager',
        });
      } catch (error) {
        structuredLogger.error('Failed to set accessibility focus', error instanceof Error ? error : new Error('Unknown error'));
      }
    }
  }

  /**
   * Generate accessibility props for components
   */
  public generateAccessibilityProps(options: AccessibilityOptions): Record<string, any> {
    const props: Record<string, any> = {
      accessible: true,
    };

    if (options.label) {
      props.accessibilityLabel = options.label;
    }

    if (options.hint) {
      props.accessibilityHint = options.hint;
    }

    if (options.role) {
      props.accessibilityRole = options.role;
    }

    if (options.state) {
      props.accessibilityState = options.state;
    }

    if (options.actions) {
      props.accessibilityActions = options.actions;
    }

    if (options.value) {
      props.accessibilityValue = options.value;
    }

    return props;
  }

  /**
   * Create semantic description for complex UI elements
   */
  public createSemanticDescription(
    elementType: string,
    content: string,
    state?: string,
    position?: { current: number; total: number }
  ): string {
    let description = `${elementType}: ${content}`;

    if (state) {
      description += `, ${state}`;
    }

    if (position) {
      description += `, ${position.current} of ${position.total}`;
    }

    return description;
  }

  /**
   * Generate accessibility announcement for navigation
   */
  public announceNavigation(screenName: string, description?: string): void {
    const message = description 
      ? `Navigated to ${screenName}. ${description}`
      : `Navigated to ${screenName}`;
    
    this.announceForScreenReader(message, 'normal');
  }

  /**
   * Generate accessibility announcement for action completion
   */
  public announceActionComplete(action: string, result: 'success' | 'error', details?: string): void {
    const status = result === 'success' ? 'completed successfully' : 'failed';
    const message = details 
      ? `${action} ${status}. ${details}`
      : `${action} ${status}`;
    
    this.announceForScreenReader(message, result === 'error' ? 'high' : 'normal');
  }

  /**
   * Cleanup listeners and resources
   */
  public cleanup(): void {
    this.listeners.forEach(removeListener => removeListener());
    this.listeners = [];
    this.announcementQueue = [];
    this.isProcessingQueue = false;
    
    structuredLogger.info('Accessibility manager cleaned up', {
      component: 'AccessibilityManager',
    });
  }
}

// Export singleton instance
export const accessibilityManager = AccessibilityManager.getInstance();

// Helper functions for common accessibility patterns
export const createButtonAccessibility = (
  label: string,
  hint?: string,
  disabled?: boolean
): Record<string, any> => {
  return accessibilityManager.generateAccessibilityProps({
    label,
    hint,
    role: 'button',
    state: { disabled },
  });
};

export const createTextAccessibility = (
  content: string,
  role: 'text' | 'header' = 'text'
): Record<string, any> => {
  return accessibilityManager.generateAccessibilityProps({
    label: content,
    role,
  });
};

export const createLinkAccessibility = (
  label: string,
  hint?: string
): Record<string, any> => {
  return accessibilityManager.generateAccessibilityProps({
    label,
    hint,
    role: 'link',
  });
};

export const createImageAccessibility = (
  description: string,
  decorative = false
): Record<string, any> => {
  if (decorative) {
    return {
      accessible: false,
      accessibilityElementsHidden: true,
    };
  }

  return accessibilityManager.generateAccessibilityProps({
    label: description,
    role: 'image',
  });
};

export const createListItemAccessibility = (
  content: string,
  position: { current: number; total: number },
  actions?: Array<{ name: string; label?: string }>
): Record<string, any> => {
  const description = accessibilityManager.createSemanticDescription(
    'List item',
    content,
    undefined,
    position
  );

  return accessibilityManager.generateAccessibilityProps({
    label: description,
    role: 'button',
    actions,
  });
};

export default accessibilityManager;
