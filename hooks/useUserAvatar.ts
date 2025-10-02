import { ProfileService } from '@/modules/profile/services/ProfileService';
import { useCallback, useEffect, useState } from 'react';

export function useUserAvatar() {
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserAvatar = useCallback(async () => {
    try {
      setIsLoading(true);
      const avatar = await ProfileService.getUserAvatar();
      setUserAvatar(avatar);
    } catch (error) {
      console.error('Erro ao carregar avatar:', error);
      setUserAvatar(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUserAvatar = useCallback(async (newAvatarUri: string | null) => {
    try {
      await ProfileService.saveUserAvatar(newAvatarUri);
      setUserAvatar(newAvatarUri);
      return true;
    } catch (error) {
      console.error('Erro ao salvar avatar:', error);
      return false;
    }
  }, []);

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