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

export function formatarDataHora(iso?: string | null): string {
  if (!iso) return '—';
  // A API .NET pode devolver a data UTC sem o "Z" no final: sem ele, o JS leria como horário local.
  const temFuso = /(Z|[+-]\d{2}:?\d{2})$/.test(iso);
  const data = new Date(temFuso ? iso : `${iso}Z`);
  if (Number.isNaN(data.getTime())) return '—';
  return data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}
