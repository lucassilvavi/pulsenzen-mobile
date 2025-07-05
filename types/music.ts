export interface MusicTrack {
  id: string;
  title: string;
  artist?: string;
  category: string;
  categoryTitle: string;
  duration: number; // em segundos
  durationFormatted: string; // formato MM:SS
  uri: number; // require() returns number for local assets
  icon?: string;
  description?: string;
}

export interface MusicCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  tracks: MusicTrack[];
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTrack: MusicTrack | null;
  position: number; // posição atual em segundos
  duration: number; // duração total em segundos
  isLoading: boolean;
  repeatMode: 'off' | 'one' | 'all';
  shuffleMode: boolean;
  currentPlaylist?: MusicTrack[]; // Playlist atual
  playlistName?: string; // Nome da playlist atual
  playlistId?: string; // ID da playlist atual (se for uma playlist real)
  pausedFrom?: 'player' | 'miniPlayer' | null; // De onde veio a última pausa
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  tracks: MusicTrack[];
  createdAt: Date;
  updatedAt: Date;
}
