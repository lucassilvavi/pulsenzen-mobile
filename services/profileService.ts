const profileService = {
  getProfile: () => ({
    name: 'Lucas Silva',
    bio: 'Buscando equilíbrio e bem-estar a cada dia',
    stats: { days: 28, sessions: 86, streak: 7 },
    image: require('@/assets/images/profile-placeholder.png'),
  }),
  getSettings: () => [
    { icon: 'person.fill', label: 'Editar Perfil' },
    { icon: 'bell.fill', label: 'Notificações' },
    { icon: 'lock.fill', label: 'Privacidade' },
    { icon: 'moon.stars.fill', label: 'Tema' },
  ],
  getGoals: () => [
    { title: 'Meditação', subtitle: '10 minutos por dia', progress: 0.7, value: '7/10 min', color: '#4CAF50' },
    { title: 'Respiração', subtitle: '3 sessões por dia', progress: 0.33, value: '1/3 sessões', color: '#FF9800' },
    { title: 'Diário', subtitle: '1 entrada por dia', progress: 1, value: 'Completo', color: '#4CAF50' },
  ],
  getStats: () => ({
    totalTime: '12h 30m',
    activeDays: 28,
    streak: 7,
  }),
  getSessionBreakdown: () => [
    { icon: 'wind', label: 'Respiração', value: '32 sessões', color: '#2196F3', bg: '#E3F2FD' },
    { icon: 'moon.stars.fill', label: 'Sono', value: '18 sessões', color: '#4CAF50', bg: '#E8F5E9' },
    { icon: 'book.fill', label: 'Diário', value: '28 entradas', color: '#FF9800', bg: '#FFF3E0' },
    { icon: 'heart.fill', label: 'SOS', value: '8 sessões', color: '#F44336', bg: '#FFEBEE' },
  ],
  getMood: () => ({
    summary: 'Seu humor tem sido predominantemente positivo nos últimos 30 dias, com 70% das entradas registradas como "Ótimo" ou "Bem".',
  }),
  getAchievements: () => [
    {
      icon: require('@/assets/images/icon.png'),
      label: 'Primeira Meditação',
      description: 'Conclua sua primeira sessão de meditação.',
      achieved: true,
      date: '2025-05-10',
    },
    {
      icon: require('@/assets/images/icon.png'),
      label: 'Sequência de 7 dias',
      description: 'Medite por 7 dias consecutivos.',
      achieved: true,
      date: '2025-05-17',
    },
    {
       icon: require('@/assets/images/icon.png'),
      label: 'Meta diária batida',
      description: 'Complete todas as metas diárias em um dia.',
      achieved: false,
      date: null,
    },
    {
       icon: require('@/assets/images/icon.png'),
      label: 'Primeiro Diário',
      description: 'Registre sua primeira entrada no diário.',
      achieved: true,
      date: '2025-05-12',
    },
    {
       icon: require('@/assets/images/icon.png'),
      label: 'Respiração Profunda',
      description: 'Complete 10 sessões de respiração.',
      achieved: true,
      date: '2025-05-15',
    },
    {
      icon: require('@/assets/images/icon.png'),
      label: 'SOS Utilizado',
      description: 'Utilize o recurso SOS pela primeira vez.',
      achieved: false,
      date: null,
    },
      {
       icon: require('@/assets/images/icon.png'),
      label: 'Primeiro Diário',
      description: 'Registre sua primeira entrada no diário.',
      achieved: true,
      date: '2025-05-12',
    },
    {
       icon: require('@/assets/images/icon.png'),
      label: 'Respiração Profunda',
      description: 'Complete 10 sessões de respiração.',
      achieved: true,
      date: '2025-05-15',
    },
    {
      icon: require('@/assets/images/icon.png'),
      label: 'SOS Utilizado',
      description: 'Utilize o recurso SOS pela primeira vez.',
      achieved: false,
      date: null,
    },
  ],
};

export default profileService;