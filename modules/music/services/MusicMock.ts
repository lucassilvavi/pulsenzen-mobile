import { MusicCategory, MusicTrack, Playlist } from '../types';

// URL para testes (convertida para number usando uri fake)
const AUDIO_URI = require('@/assets/music/music.mp3'); // Usa o arquivo de áudio existente

const mockTracks: MusicTrack[] = [
  // Histórias para Dormir
  {
    id: 'forest-walk',
    title: 'Caminhada na Floresta',
    artist: 'Natureza Relaxante',
    category: 'stories',
    categoryTitle: 'Histórias para Dormir',
    duration: 900, // 15 min
    durationFormatted: '15:00',
    uri: AUDIO_URI,
    icon: '🌲',
    description: 'Uma jornada tranquila pelos caminhos da floresta'
  },
  {
    id: 'ocean-moonlight',
    title: 'Praia ao Luar',
    artist: 'Sons do Mar',
    category: 'stories',
    categoryTitle: 'Histórias para Dormir',
    duration: 1200, // 20 min
    durationFormatted: '20:00',
    uri: AUDIO_URI,
    icon: '🌊',
    description: 'Relaxe com as ondas suaves sob a luz da lua'
  },
  {
    id: 'serene-mountains',
    title: 'Montanhas Serenas',
    artist: 'Zen Natural',
    category: 'stories',
    categoryTitle: 'Histórias para Dormir',
    duration: 1080, // 18 min
    durationFormatted: '18:00',
    uri: AUDIO_URI,
    icon: '🏔️',
    description: 'Uma experiência de paz nas montanhas'
  },

  // Sons Relaxantes
  {
    id: 'gentle-rain',
    title: 'Chuva Suave',
    artist: 'Ambiente Natural',
    category: 'sounds',
    categoryTitle: 'Sons Relaxantes',
    duration: 3600, // 60 min
    durationFormatted: '60:00',
    uri: AUDIO_URI,
    icon: '🌧️',
    description: 'Som relaxante de chuva para dormir'
  },
  {
    id: 'ocean-waves',
    title: 'Ondas do Mar',
    artist: 'Oceano Profundo',
    category: 'sounds',
    categoryTitle: 'Sons Relaxantes',
    duration: 2700, // 45 min
    durationFormatted: '45:00',
    uri: AUDIO_URI,
    icon: '🌊',
    description: 'Ondas suaves para relaxamento total'
  },
  {
    id: 'forest-sounds',
    title: 'Sons da Floresta',
    artist: 'Natureza Viva',
    category: 'sounds',
    categoryTitle: 'Sons Relaxantes',
    duration: 1800, // 30 min
    durationFormatted: '30:00',
    uri: AUDIO_URI,
    icon: '🌳',
    description: 'Pássaros e folhas ao vento'
  },

  // Meditações para Dormir
  {
    id: 'body-scan',
    title: 'Relaxamento Corporal',
    artist: 'Mestre Zen',
    category: 'meditations',
    categoryTitle: 'Meditações para Dormir',
    duration: 1500, // 25 min
    durationFormatted: '25:00',
    uri: AUDIO_URI,
    icon: '🧘‍♀️',
    description: 'Escaneamento corporal para relaxamento profundo'
  },
  {
    id: 'sleep-breathing',
    title: 'Respiração para Dormir',
    artist: 'Guia Meditativo',
    category: 'meditations',
    categoryTitle: 'Meditações para Dormir',
    duration: 600, // 10 min
    durationFormatted: '10:00',
    uri: AUDIO_URI,
    icon: '💨',
    description: 'Técnicas de respiração para induzir o sono'
  },
  {
    id: 'gratitude-night',
    title: 'Gratidão Noturna',
    artist: 'Coração Grato',
    category: 'meditations',
    categoryTitle: 'Meditações para Dormir',
    duration: 900, // 15 min
    durationFormatted: '15:00',
    uri: AUDIO_URI,
    icon: '🙏',
    description: 'Prática de gratidão antes de dormir'
  }
];

const mockCategories: MusicCategory[] = [
  {
    id: 'stories',
    title: 'Histórias para Dormir',
    description: 'Narrativas relaxantes que ajudam você a adormecer',
    icon: '📖',
    color: '#6B73FF',
    tracks: mockTracks.filter(track => track.category === 'stories')
  },
  {
    id: 'sounds',
    title: 'Sons Relaxantes',
    description: 'Ambientes sonoros para uma noite tranquila',
    icon: '🎵',
    color: '#4ECDC4',
    tracks: mockTracks.filter(track => track.category === 'sounds')
  },
  {
    id: 'meditations',
    title: 'Meditações para Dormir',
    description: 'Práticas guiadas para relaxamento profundo',
    icon: '🧘‍♀️',
    color: '#45B7D1',
    tracks: mockTracks.filter(track => track.category === 'meditations')
  }
];

const mockPlaylists: Playlist[] = [
  {
    id: 'favorites',
    name: 'Meus Favoritos',
    description: 'Suas faixas mais tocadas',
    tracks: [mockTracks[0], mockTracks[3], mockTracks[6]],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: 'bedtime',
    name: 'Hora de Dormir',
    description: 'Playlist perfeita para adormecer',
    tracks: [mockTracks[1], mockTracks[4], mockTracks[7]],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: 'relaxation',
    name: 'Relaxamento Total',
    description: 'Para momentos de calma e tranquilidade',
    tracks: [mockTracks[2], mockTracks[5], mockTracks[8]],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date()
  }
];

export { mockCategories, mockPlaylists, mockTracks };

