import { useEffect, useRef, useCallback } from 'react';
import MusicService from '../modules/music/services/MusicService';
import { logger } from '../utils/logger';

/**
 * Hook para gerenciar o MusicService com prevenção de memory leaks
 * 
 * Features:
 * - Cleanup automático no unmount
 * - Referência estável do service
 * - Listener management seguro
 * - Timeout cleanup para prevenir race conditions
 * 
 * @returns {Object} Objeto com MusicService e funções de cleanup
 */
export const useMusicService = () => {
  const timeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const listenersRef = useRef<Set<() => void>>(new Set());
  const isCleanedUpRef = useRef(false);

  // Função para adicionar timeouts que serão limpos automaticamente
  const addTimeout = useCallback((callback: () => void, delay: number): ReturnType<typeof setTimeout> => {
    if (isCleanedUpRef.current) {
      logger.debug('useMusicService', 'Skipping timeout creation - component already cleaned up');
      return setTimeout(() => {}, 0); // Return dummy timeout
    }

    const timeoutId = setTimeout(() => {
      if (!isCleanedUpRef.current) {
        timeoutsRef.current.delete(timeoutId);
        callback();
      }
    }, delay);

    timeoutsRef.current.add(timeoutId);
    return timeoutId;
  }, []);

  // Função para adicionar listeners que serão limpos automaticamente
  const addListener = useCallback((listener: (state: any) => void) => {
    if (isCleanedUpRef.current) {
      logger.debug('useMusicService', 'Skipping listener creation - component already cleaned up');
      return () => {};
    }

    const removeListener = MusicService.addPlaybackListener(listener);
    listenersRef.current.add(removeListener);

    return () => {
      listenersRef.current.delete(removeListener);
      removeListener();
    };
  }, []);

  // Função para limpar todos os timeouts
  const cleanupTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    timeoutsRef.current.clear();
  }, []);

  // Função para limpar todos os listeners
  const cleanupListeners = useCallback(() => {
    listenersRef.current.forEach(removeListener => {
      try {
        removeListener();
      } catch (error) {
        logger.warn('useMusicService', 'Error removing listener during cleanup', error instanceof Error ? error : undefined);
      }
    });
    listenersRef.current.clear();
  }, []);

  // Função para cleanup completo
  const cleanup = useCallback(async () => {
    if (isCleanedUpRef.current) {
      return;
    }

    isCleanedUpRef.current = true;
    
    try {
      logger.debug('useMusicService', 'Starting cleanup process');
      
      // Limpar timeouts primeiro para evitar race conditions
      cleanupTimeouts();
      
      // Limpar listeners
      cleanupListeners();
      
      // Note: Não fazemos cleanup do MusicService aqui pois é um singleton
      // que pode estar sendo usado por outros componentes
      
      logger.debug('useMusicService', 'Cleanup completed successfully');
    } catch (error) {
      logger.error('useMusicService', 'Error during cleanup', error instanceof Error ? error : undefined);
    }
  }, [cleanupTimeouts, cleanupListeners]);

  // Cleanup automático no unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Reset da flag quando o componente monta novamente
  useEffect(() => {
    isCleanedUpRef.current = false;
  }, []);

  return {
    musicService: MusicService,
    addTimeout,
    addListener,
    cleanup,
    isCleanedUp: () => isCleanedUpRef.current,
  };
};

/**
 * Hook para uso básico do MusicService sem memory leak prevention
 * Use apenas quando você tem certeza de que não precisa de cleanup automático
 */
export const useBasicMusicService = () => {
  return MusicService;
};

export default useMusicService;
