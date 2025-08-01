import React, { ReactNode } from 'react';
import { ErrorBoundary } from '../base/ErrorBoundary';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

export function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  const fallback = (
    <ThemedView style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: 20,
      backgroundColor: '#f8f9fa'
    }}>
      <ThemedText type="title" style={{ 
        textAlign: 'center', 
        marginBottom: 16,
        color: '#e74c3c'
      }}>
        🚨 Erro Crítico
      </ThemedText>
      <ThemedText style={{ 
        textAlign: 'center', 
        marginBottom: 24,
        lineHeight: 24
      }}>
        A aplicação encontrou um erro inesperado e precisa ser reiniciada. 
        Por favor, feche e abra o app novamente.
      </ThemedText>
      <ThemedText type="default" style={{ 
        textAlign: 'center',
        color: '#7f8c8d',
        fontSize: 14
      }}>
        Se o problema persistir, entre em contato com o suporte.
      </ThemedText>
    </ThemedView>
  );

  return (
    <ErrorBoundary name="App" fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
}

export function ScreenErrorBoundary({ children }: { children: ReactNode }) {
  const fallback = (
    <ThemedView style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: 20 
    }}>
      <ThemedText type="title" style={{ textAlign: 'center', marginBottom: 16 }}>
        ⚠️ Erro na Tela
      </ThemedText>
      <ThemedText style={{ textAlign: 'center', marginBottom: 16 }}>
        Esta tela encontrou um erro. Tente navegar para outra seção do app.
      </ThemedText>
    </ThemedView>
  );

  return (
    <ErrorBoundary name="Screen" fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
}

export function ComponentErrorBoundary({ 
  children, 
  componentName = "Component" 
}: { 
  children: ReactNode; 
  componentName?: string;
}) {
  const fallback = (
    <ThemedView style={{ 
      padding: 12, 
      backgroundColor: '#fee2e2', 
      borderRadius: 8, 
      margin: 4 
    }}>
      <ThemedText type="default" style={{ 
        color: '#dc2626', 
        textAlign: 'center',
        fontSize: 14
      }}>
        ⚠️ Erro no componente {componentName}
      </ThemedText>
    </ThemedView>
  );

  return (
    <ErrorBoundary name={componentName} fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
}

export function DataErrorBoundary({ children }: { children: ReactNode }) {
  const fallback = (
    <ThemedView style={{ 
      padding: 16, 
      justifyContent: 'center', 
      alignItems: 'center' 
    }}>
      <ThemedText type="subtitle" style={{ textAlign: 'center', marginBottom: 12 }}>
        📊 Erro ao carregar dados
      </ThemedText>
      <ThemedText style={{ textAlign: 'center' }}>
        Não foi possível carregar os dados. Verifique sua conexão e tente novamente.
      </ThemedText>
    </ThemedView>
  );

  return (
    <ErrorBoundary name="DataLoader" fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
}
