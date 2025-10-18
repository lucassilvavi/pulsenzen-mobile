import { useAuth } from '@/context/AuthContext';
import { ProfileService } from '@/modules/profile/services/ProfileService';
import { UserProfile } from '@/modules/profile/types';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

interface UserDataContextType {
  firstName: string | null;
  lastName: string | null;
  displayName: string;
  isLoading: boolean;
  updateUserData: (data: { firstName: string; lastName: string }) => Promise<boolean>;
  refreshUserData: () => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

interface UserDataProviderProps {
  children: ReactNode;
}

export function UserDataProvider({ children }: UserDataProviderProps) {
  const { user, userProfile } = useAuth();
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Prioridade: userProfile (dados da API), depois user.profile, depois local storage
      let userFirstName = userProfile?.profile?.firstName || user?.profile?.firstName;
      let userLastName = userProfile?.profile?.lastName || user?.profile?.lastName;
      
      // Se não encontrou nos contextos, tenta carregar do armazenamento local
      if (!userFirstName && !userLastName && user?.id) {
        try {
          const savedProfile = await ProfileService.getUserProfile();
          if (savedProfile?.name) {
            // Se o profile local tem um name, tenta extrair firstName e lastName
            const nameParts = savedProfile.name.split(' ');
            userFirstName = nameParts[0] || undefined;
            userLastName = nameParts.slice(1).join(' ') || undefined;
          }
        } catch (error) {
          console.error('Erro ao carregar perfil local:', error);
        }
      }
      
      setFirstName(userFirstName || null);
      setLastName(userLastName || null);
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      setFirstName(null);
      setLastName(null);
    } finally {
      setIsLoading(false);
    }
  }, [user, userProfile]);

  const updateUserData = useCallback(async (data: { firstName: string; lastName: string }) => {
    try {
      // Atualiza o estado local imediatamente para UI responsiva
      setFirstName(data.firstName);
      setLastName(data.lastName);
      
      // Salva localmente para persistência
      if (user?.id) {
        try {
          const currentProfile = await ProfileService.getUserProfile();
          const updatedProfile: UserProfile = {
            id: user.id,
            name: `${data.firstName} ${data.lastName}`.trim(),
            email: user.email || currentProfile?.email || 'usuario@pulsezen.com',
            ...currentProfile,
            updatedAt: new Date().toISOString(),
          };
          await ProfileService.saveUserProfile(updatedProfile);
        } catch (error) {
          console.error('Erro ao salvar perfil localmente:', error);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
      return false;
    }
  }, [user?.id, user?.email]);

  const refreshUserData = useCallback(async () => {
    await loadUserData();
  }, [loadUserData]);

  // Carrega dados quando user/userProfile mudam
  useEffect(() => {
    if (user?.id) {
      loadUserData();
    } else {
      setFirstName(null);
      setLastName(null);
      setIsLoading(false);
    }
  }, [user?.id, userProfile, loadUserData]);

  // Calcula displayName com base nos dados atuais
  const displayName = (() => {
    if (firstName) {
      return lastName ? `${firstName} ${lastName}` : firstName;
    } else if (user?.email) {
      // Fallback: usar parte do email como nome
      return user.email.split('@')[0];
    }
    return 'Visitante';
  })();

  const contextValue = {
    firstName,
    lastName,
    displayName,
    isLoading,
    updateUserData,
    refreshUserData,
  };

  return (
    <UserDataContext.Provider value={contextValue}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserDataNew() {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserDataNew must be used within a UserDataProvider');
  }
  return context;
}

// Hook de compatibilidade que retorna todos os dados do usuário como antes
export function useUserDataComplete() {
  const { user, userProfile, isAuthenticated, isLoading: authLoading } = useAuth();
  const { firstName, lastName, displayName, isLoading: userDataLoading } = useUserDataNew();

  return {
    displayName,
    firstName,
    lastName,
    email: user?.email || '',
    avatarUrl: null,
    onboardingComplete: user?.onboardingComplete || userProfile?.profile?.onboardingCompleted || false,
    isAuthenticated,
    isLoading: authLoading || userDataLoading,
    rawUser: user,
    rawProfile: userProfile?.profile || user?.profile || userProfile,
  };
}