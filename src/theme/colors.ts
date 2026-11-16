import type { NivelRisco } from '@/types';

export const colors = {
  // Paleta da marca Ressoa (azul-petróleo + turquesa).
  // O turquesa da logo (#1597A6) com texto branco não passa no contraste mínimo (4,5:1),
  // então botões e links usam um tom mais escuro da mesma cor.
  primary: '#0F7C89',
  primaryDark: '#0A2B3D',
  primaryLight: '#E2F4F5',
  accent: '#1597A6',
  /** Turquesa claro da logo: só para detalhes sobre o fundo escuro. */
  brandGlow: '#5FD3DC',

  background: '#F3F8F8',
  surface: '#FFFFFF',
  border: '#D5E3E3',

  text: '#0A2B3D',
  textMuted: '#52707A',
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
