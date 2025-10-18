import { useAuth } from '@/context/AuthContext';
import { useUserDataNew } from '@/context/UserDataContext';
import { useMemo } from 'react';

/**
 * Hook personalizado para facilitar o acesso aos dados do usuário
 * Combina dados do AuthContext (dados da API) com o UserDataContext para sincronização
 */
export function useUserData() {
  const { user, userProfile, isAuthenticated, isLoading } = useAuth();
  
  // Tenta usar o novo contexto primeiro, senão faz fallback para o método antigo
  let displayName = 'Visitante';
  let firstName: string | undefined;
  let lastName: string | undefined;
  
  try {
    const userDataContext = useUserDataNew();
    displayName = userDataContext.displayName;
    firstName = userDataContext.firstName || undefined;
    lastName = userDataContext.lastName || undefined;
  } catch {
    // Fallback para o método antigo se o contexto não estiver disponível
    firstName = user?.profile?.firstName;
    lastName = user?.profile?.lastName;
    const email = user?.email;
    
    if (firstName) {
      displayName = lastName ? `${firstName} ${lastName}` : firstName;
    } else if (email) {
      // Fallback: usar parte do email como nome
      displayName = email.split('@')[0];
    }
  }

  const userData = useMemo(() => {
    // Email do usuário
    const userEmail = user?.email || '';

    // Status do onboarding
    const onboardingComplete = user?.onboardingComplete || userProfile?.profile?.onboardingCompleted || false;

    // Avatar (placeholder por enquanto)
    const avatarUrl = null; // TODO: Implementar avatar quando necessário

    const result = {
      displayName,
      firstName,
      lastName,
      email: userEmail,
      avatarUrl,
      onboardingComplete,
      isAuthenticated,
      isLoading,
      // Dados brutos para casos específicos
      rawUser: user,
      rawProfile: userProfile?.profile || user?.profile || userProfile, // Use userProfile.profile first (API data), then fallback
    };
    
    return result;
  }, [user, userProfile, isAuthenticated, isLoading, displayName, firstName, lastName]);

  return userData;
}

export default useUserData;
