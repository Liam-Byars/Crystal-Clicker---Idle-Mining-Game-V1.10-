export const colors = {
  // Backgrounds
  bg: '#0a0a1a',
  bgCard: 'rgba(17, 17, 30, 0.6)',
  bgCardHover: 'rgba(30, 30, 50, 0.6)',
  bgInput: 'rgba(30, 30, 50, 0.8)',

  // Text
  text: '#e5e7eb',
  textMuted: '#9ca3af',
  textDim: '#6b7280',
  textFaint: '#4b5563',

  // Accents
  purple: '#a855f7',
  purpleLight: '#c084fc',
  purpleDark: '#7c3aed',
  purpleGlow: 'rgba(168, 85, 247, 0.3)',

  amber: '#f59e0b',
  amberLight: '#fbbf24',
  amberDark: '#d97706',

  cyan: '#06b6d4',
  cyanLight: '#22d3ee',

  green: '#22c55e',
  greenLight: '#34d399',

  red: '#ef4444',
  pink: '#ec4899',
  pinkLight: '#f472b6',

  // Borders
  border: 'rgba(75, 85, 99, 0.3)',
  borderLight: 'rgba(107, 114, 128, 0.2)',

  // Crystal gradient (approximated)
  crystalStart: '#7c3aed',
  crystalEnd: '#a855f7',
  golden: '#fbbf24',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  title: 28,
  hero: 36,
} as const;
