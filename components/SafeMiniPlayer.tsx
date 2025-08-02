import MiniPlayer from '@/modules/music/components/MiniPlayer';
import { useMusic } from '@/modules/music/context/MusicContext';
import React from 'react';

/**
 * SafeMiniPlayer - Wrapper that only renders MiniPlayer when context is available
 */
const SafeMiniPlayer: React.FC = () => {
  // Always call hooks at the top level - React rule
  const musicContext = useMusic();
  
  // If context is not available, don't render
  if (!musicContext) {
    return null;
  }

  return <MiniPlayer />;
};

export default SafeMiniPlayer;
