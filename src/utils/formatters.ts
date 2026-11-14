import type { StatusDispositivo, TipoRecipiente } from '@/types';

export const TIPO_RECIPIENTE_LABEL: Record<TipoRecipiente, string> = {
  BALDE: 'Balde',
  TAMBOR: 'Tambor',
  CAIXA_DAGUA: "Caixa d'água",
};

export const STATUS_LABEL: Record<StatusDispositivo, string> = {
  ATIVO: 'Ativo',
  SEM_SINAL: 'Sem sinal',
  BATERIA_BAIXA: 'Bateria baixa',
  INATIVO: 'Inativo',
};

export function formatarDataHora(iso?: string): string {
  if (!iso) return '—';
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return '—';
  return data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}
