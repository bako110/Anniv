// constants/theme.js
export const theme = {
  colors: {
    // Couleurs principales
    primary: '#667eea',
    primaryLight: '#a3bffa',
    primaryDark: '#5a67d8',
    
    secondary: '#764ba2',
    secondaryLight: '#9f7aea',
    secondaryDark: '#553c9a',
    
    // Couleurs d'accent
    accent: '#f687b3',
    success: '#48bb78',
    warning: '#ed8936',
    danger: '#f56565',
    info: '#4299e1',
    
    // Nuances de gris
    gray50: '#f9fafb',
    gray100: '#f3f4f6',
    gray200: '#e5e7eb',
    gray300: '#d1d5db',
    gray400: '#9ca3af',
    gray500: '#6b7280',
    gray600: '#4b5563',
    gray700: '#374151',
    gray800: '#1f2937',
    gray900: '#111827',
    
    // Blanc et noir
    white: '#ffffff',
    black: '#000000',
    
    // Couleurs pour les types de souvenirs
    memoryTypes: {
      vacation: '#3b82f6',
      birthday: '#ec4899',
      party: '#a855f7',
      family: '#f59e0b',
      travel: '#10b981',
    }
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
    full: 999,
  },
  
  text: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
    },
    caption: {
      fontSize: 14,
      lineHeight: 20,
      color: '#6b7280',
    },
    small: {
      fontSize: 12,
      lineHeight: 16,
    },
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },
  },
  
  // Styles prédéfinis
  gradients: {
    primary: ['#667eea', '#764ba2'],
    secondary: ['#a3bffa', '#9f7aea'],
    success: ['#48bb78', '#38a169'],
    danger: ['#f56565', '#e53e3e'],
  },
  
  // Durées d'animation
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
};

export default theme;