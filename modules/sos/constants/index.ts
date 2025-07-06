// SOS module colors and themes
export const sosColors = {
  primary: '#F44336',
  secondary: '#FFCDD2',
  accent: '#D32F2F',
  background: '#FFEBEE',
};

export const sosGradients = {
  primary: ['#FFCDD2', '#FFEBEE'],
  accent: ['#F44336', '#EF5350'],
};

// Emergency contact validation
export const emergencyContactTypes = {
  FAMILY: 'family',
  FRIEND: 'friend', 
  PROFESSIONAL: 'professional',
  EMERGENCY: 'emergency',
} as const;

// Session duration options
export const sessionDurations = {
  SHORT: 3,
  MEDIUM: 5,
  LONG: 10,
} as const;
