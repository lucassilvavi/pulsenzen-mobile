/**
 * Advanced Error Boundary Components
 * Enhanced error handling with recovery mechanisms
 */

import React, { Component, ComponentType, ReactNode, ErrorInfo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { logger } from '../utils/logger';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRetries?: number;
  resetOnPropsChange?: boolean;
  resetKeys?: string[];
}

// Enhanced Error Boundary with recovery mechanisms
export class AdvancedErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

        // Log error details
    logger.error('ErrorBoundary', `Component error caught: ${error.message}`);

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Auto-retry after delay for transient errors
    if (this.state.retryCount < (this.props.maxRetries || 3)) {
      this.resetTimeoutId = window.setTimeout(() => {
        this.handleRetry();
      }, Math.pow(2, this.state.retryCount) * 1000); // Exponential backoff
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props;
    
    if (this.state.hasError && resetOnPropsChange) {
      if (resetKeys) {
        const hasResetKeyChanged = resetKeys.some(
          key => prevProps[key as keyof ErrorBoundaryProps] !== this.props[key as keyof ErrorBoundaryProps]
        );
        
        if (hasResetKeyChanged) {
          this.resetErrorBoundary();
        }
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    });
  };

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props;
      
      if (Fallback && this.state.error) {
        return <Fallback error={this.state.error} retry={this.handleRetry} />;
      }

      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          
          {this.state.retryCount < (this.props.maxRetries || 3) && (
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={this.handleRetry}
            >
              <Text style={styles.retryButtonText}>
                Try Again ({this.state.retryCount + 1}/{this.props.maxRetries || 3})
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.retryButton, styles.resetButton]}
            onPress={this.resetErrorBoundary}
          >
            <Text style={styles.retryButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

// Component-specific error boundaries
export const ScreenErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <AdvancedErrorBoundary
    maxRetries={2}
    onError={(error, errorInfo) => {
      logger.error('ScreenErrorBoundary', `Screen component error: ${error.message}`);
    }}
  >
    {children}
  </AdvancedErrorBoundary>
);

export const ServiceErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <AdvancedErrorBoundary
    maxRetries={3}
    resetOnPropsChange={true}
    onError={(error, errorInfo) => {
      logger.error('ServiceErrorBoundary', `Service component error: ${error.message}`);
    }}
  >
    {children}
  </AdvancedErrorBoundary>
);

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  resetButton: {
    backgroundColor: '#FF3B30',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdvancedErrorBoundary;
