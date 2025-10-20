import { useToast } from '@/modules/ui/toast/ToastContext';
import { useEffect } from 'react';

interface SessionExpiredHandlerProps {
  isSessionExpired: boolean;
  onSessionCleared: () => void;
}

export function SessionExpiredHandler({ isSessionExpired, onSessionCleared }: SessionExpiredHandlerProps) {
  const { show } = useToast();

  useEffect(() => {
    if (isSessionExpired) {
      show('Sua sessão expirou. Faça login novamente.', {
        type: 'warning',
        duration: 4000,
      });
      
      // Clear the session expired flag after showing the toast
      setTimeout(() => {
        onSessionCleared();
      }, 500);
    }
  }, [isSessionExpired, show, onSessionCleared]);

  return null; // This component doesn't render anything
}