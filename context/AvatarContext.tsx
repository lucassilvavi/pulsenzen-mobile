import { useAuth } from '@/context/AuthContext';
import { ProfileService } from '@/modules/profile/services/ProfileService';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

interface AvatarContextType {
  userAvatar: string | null;
  isLoading: boolean;
  updateUserAvatar: (newAvatarUri: string | null) => Promise<boolean>;
  refreshAvatar: () => Promise<void>;
}

const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

interface AvatarProviderProps {
  children: ReactNode;
}

export function AvatarProvider({ children }: AvatarProviderProps) {
  const { user } = useAuth();
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserAvatar = useCallback(async () => {
    try {
      setIsLoading(true);
      const avatar = await ProfileService.getUserAvatar(user?.id);
      setUserAvatar(avatar);
    } catch (error) {
      console.error('Erro ao carregar avatar:', error);
      setUserAvatar(null);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const updateUserAvatar = useCallback(async (newAvatarUri: string | null) => {
    try {
      await ProfileService.saveUserAvatar(newAvatarUri, user?.id);
      setUserAvatar(newAvatarUri);
      return true;
    } catch (error) {
      console.error('Erro ao salvar avatar:', error);
      return false;
    }
  }, [user?.id]);

  const refreshAvatar = useCallback(async () => {
    await loadUserAvatar();
  }, [loadUserAvatar]);

  useEffect(() => {
    if (user?.id) {
      loadUserAvatar();
    } else {
      setUserAvatar(null);
      setIsLoading(false);
    }
  }, [user?.id, loadUserAvatar]);

  const contextValue = {
    userAvatar,
    isLoading,
    updateUserAvatar,
    refreshAvatar,
  };

  return (
    <AvatarContext.Provider value={contextValue}>
      {children}
    </AvatarContext.Provider>
  );
}

export function useAvatar() {
  const context = useContext(AvatarContext);
  if (context === undefined) {
    throw new Error('useAvatar must be used within an AvatarProvider');
  }
  return context;
}

// Hook de compatibilidade para migração gradual
export function useUserAvatar() {
  return useAvatar();
}