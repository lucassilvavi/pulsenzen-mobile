import MiniPlayer from '@/modules/music/components/MiniPlayer';
import { useMusic } from '@/modules/music/context/MusicContext';
import React from 'react';

/**
 * SafeMiniPlayer - Wrapper that only renders MiniPlayer when context is available
 */
const SafeMiniPlayer: React.FC = () => {
  try {
    // Test if context is available
    const { state } = useMusic();
    return <MiniPlayer />;
  } catch (error) {
    // Context not available, don't render
    console.warn('MusicProvider not available, MiniPlayer not rendered');
    return null;
  }
};

export default SafeMiniPlayer;
