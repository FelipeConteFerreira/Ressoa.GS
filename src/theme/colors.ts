import type { NivelRisco } from '@/types';

export const colors = {
  primary: '#0E6BA8',
  primaryDark: '#0A3D62',
  primaryLight: '#E3F0F9',
  accent: '#1FB5A8',

  background: '#F4F8FB',
  surface: '#FFFFFF',
  border: '#DCE5EE',

  text: '#0F1B2D',
  textMuted: '#5B6B7F',
  textOnPrimary: '#FFFFFF',

  success: '#2E7D32',
  warning: '#B26A00',
  danger: '#C62828',
  dangerLight: '#FDECEC',
} as const;

/** Cores dos níveis de risco do briefing. O texto do nível sempre acompanha a cor. */
export const riskColors: Record<NivelRisco, { background: string; text: string }> = {
  VERDE: { background: '#2E7D32', text: '#FFFFFF' },
  AMARELO: { background: '#F9C623', text: '#3D2E00' },
  LARANJA: { background: '#EF6C00', text: '#FFFFFF' },
  VERMELHO: { background: '#C62828', text: '#FFFFFF' },
};
