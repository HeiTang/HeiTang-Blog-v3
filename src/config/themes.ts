/**
 * Design Tokens - Theme System
 * Following SOLID principles: Single Responsibility
 * All visual design decisions are centralized here
 */

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: {
    dark: string;
    medium: string;
    light: string;
  };
  text: {
    primary: string;
    secondary: string;
    accent: string;
  };
  glass: {
    background: string;
    border: string;
    blur: string;
  };
}

export interface ThemeEffects {
  glowIntensity: 'none' | 'subtle' | 'medium' | 'strong';
  borderRadius: 'sharp' | 'medium' | 'round';
  animations: 'minimal' | 'moderate' | 'rich';
}

export interface Theme {
  name: string;
  description: string;
  colors: ThemeColors;
  effects: ThemeEffects;
}

// Theme 1: Elegant Cyber Cat (Default - as shown in demo)
export const elegantCyberTheme: Theme = {
  name: 'elegant-cyber',
  description: '優雅賽博橘貓 - Glassmorphism主導配Cyberpunk點綴',
  colors: {
    primary: '#FF8C61',
    secondary: '#FFB4A2',
    accent: '#9D7FE8',
    background: {
      dark: '#0F1419',
      medium: '#1A1F2E',
      light: '#252B3B',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#D1D5DB',
      accent: '#FF8C61',
    },
    glass: {
      background: 'rgba(255, 255, 255, 0.08)',
      border: 'rgba(255, 140, 97, 0.15)',
      blur: '24px',
    },
  },
  effects: {
    glowIntensity: 'subtle',
    borderRadius: 'round',
    animations: 'moderate',
  },
};

// Theme 2: Pure Glass (More elegant)
export const pureGlassTheme: Theme = {
  name: 'pure-glass',
  description: '純淨玻璃 - 更優雅溫和',
  colors: {
    primary: '#FFB4A2',
    secondary: '#FFC9BD',
    accent: '#C4B5FD',
    background: {
      dark: '#1A1F2E',
      medium: '#252B3B',
      light: '#2F3548',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#E5E7EB',
      accent: '#FFB4A2',
    },
    glass: {
      background: 'rgba(255, 255, 255, 0.06)',
      border: 'rgba(255, 180, 162, 0.12)',
      blur: '32px',
    },
  },
  effects: {
    glowIntensity: 'subtle',
    borderRadius: 'round',
    animations: 'minimal',
  },
};

// Theme 3: Neon Cyber (More intense)
export const neonCyberTheme: Theme = {
  name: 'neon-cyber',
  description: '霓虹賽博 - 更強烈科技感',
  colors: {
    primary: '#FF6B35',
    secondary: '#FF8F6B',
    accent: '#00F5FF',
    background: {
      dark: '#0A0E27',
      medium: '#141829',
      light: '#1E2433',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#CBD5E1',
      accent: '#00F5FF',
    },
    glass: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: 'rgba(255, 107, 53, 0.3)',
      blur: '20px',
    },
  },
  effects: {
    glowIntensity: 'strong',
    borderRadius: 'medium',
    animations: 'rich',
  },
};

// Theme 4: Minimalist Pro (Clean and professional)
export const minimalistTheme: Theme = {
  name: 'minimalist',
  description: '極簡專業 - 乾淨現代',
  colors: {
    primary: '#FF9B6A',
    secondary: '#FFB892',
    accent: '#A78BFA',
    background: {
      dark: '#FFFFFF',
      medium: '#F9FAFB',
      light: '#F3F4F6',
    },
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      accent: '#FF9B6A',
    },
    glass: {
      background: 'rgba(0, 0, 0, 0.02)',
      border: 'rgba(0, 0, 0, 0.08)',
      blur: '0px',
    },
  },
  effects: {
    glowIntensity: 'none',
    borderRadius: 'medium',
    animations: 'minimal',
  },
};

export const themes = {
  elegantCyber: elegantCyberTheme,
  pureGlass: pureGlassTheme,
  neonCyber: neonCyberTheme,
  minimalist: minimalistTheme,
};

export type ThemeName = keyof typeof themes;

export const defaultTheme: ThemeName = 'elegantCyber';
