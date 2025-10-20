import { createContext, ReactNode, useCallback, useContext, useState } from 'react';

interface SessionContextType {
  isSessionExpired: boolean;
  markSessionExpired: () => void;
  clearSessionExpired: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  const markSessionExpired = useCallback(() => {
    setIsSessionExpired(true);
  }, []);

  const clearSessionExpired = useCallback(() => {
    setIsSessionExpired(false);
  }, []);

  const value = {
    isSessionExpired,
    markSessionExpired,
    clearSessionExpired,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextType {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}