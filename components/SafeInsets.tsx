import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Este componente serve como intermediário seguro para evitar
// o erro "Text strings must be rendered within a <Text> component"
// quando usamos o useSafeAreaInsets()

interface SafeInsetsProps {
  children: (insets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  }) => React.ReactNode;
}

export function SafeInsets({ children }: SafeInsetsProps) {
  const insets = useSafeAreaInsets();
  
  // Extraimos explicitamente cada valor como número
  // para evitar qualquer problema de renderização de texto
  const safeInsets = {
    top: Number(insets.top || 0),
    bottom: Number(insets.bottom || 0),
    left: Number(insets.left || 0),
    right: Number(insets.right || 0),
  };
  
  return <>{children(safeInsets)}</>;
}
