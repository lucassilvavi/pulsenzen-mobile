import { useAuth } from '@/context/AuthContext';
import { useMemo } from 'react';

/**
 * Hook personalizado para facilitar o acesso aos dados do usuário
 * Combina dados do AuthContext (dados da API) com lógica de fallback
 */
export function useUserData() {
  const { user, userProfile, isAuthenticated, isLoading } = useAuth();

  const userData = useMemo(() => {
    // Nome do usuário com fallbacks
    const firstName = user?.profile?.firstName;
    const lastName = user?.profile?.lastName;
    const email = user?.email;
    let displayName = 'Visitante';
    if (firstName) {
      displayName = lastName ? `${firstName} ${lastName}` : firstName;
    } else if (email) {
      // Fallback: usar parte do email como nome
      displayName = email.split('@')[0];
    }

    // Email do usuário
    const userEmail = email || '';

    // Status do onboarding
    const onboardingComplete = user?.onboardingComplete || userProfile?.profile?.onboardingCompleted || false;

    // Avatar (placeholder por enquanto)
    const avatarUrl = null; // TODO: Implementar avatar quando necessário

    return {
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
      rawProfile: userProfile,
    };
  }, [user, userProfile, isAuthenticated, isLoading]);

  return userData;
}

export default useUserData;
