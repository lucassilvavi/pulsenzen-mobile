import { ProfileService } from '@/modules/profile/services/ProfileService';
import { useAuth } from '@/context/AuthContext';
import { useCallback, useEffect, useState } from 'react';

export function useUserAvatar() {
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

  useEffect(() => {
    loadUserAvatar();
  }, [loadUserAvatar]);

  return {
    userAvatar,
    isLoading,
    loadUserAvatar,
    updateUserAvatar,
  };
}