import React, { ErrorInfo, ReactNode } from 'react';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { logger } from '../../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to our logging service
    logger.error('ErrorBoundary', `Error caught in ${this.props.name || 'Unknown'} component`, error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: this.props.name,
    });

    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <ThemedView style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center', 
          padding: 20 
        }}>
          <ThemedText type="title" style={{ textAlign: 'center', marginBottom: 16 }}>
            Oops! Algo deu errado
          </ThemedText>
          <ThemedText style={{ textAlign: 'center', marginBottom: 16 }}>
            Encontramos um erro inesperado. Por favor, tente novamente.
          </ThemedText>
          {__DEV__ && this.state.error && (
            <ThemedText type="default" style={{ 
              textAlign: 'center', 
              color: '#ff6b6b',
              marginTop: 16,
              fontFamily: 'monospace',
              fontSize: 12
            }}>
              {this.state.error.message}
            </ThemedText>
          )}
        </ThemedView>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryName?: string,
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary name={errorBoundaryName || Component.name} fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for error reporting from functional components
export function useErrorHandler() {
  const handleError = React.useCallback((error: Error, errorInfo?: string) => {
    logger.error('ErrorHandler', 'Manual error report', error, { errorInfo });
  }, []);
  
  return handleError;
}
