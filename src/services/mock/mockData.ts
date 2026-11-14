import type { Bairro, Dispositivo, Leitura, Papel } from '@/types';

// Dados fictícios usados só quando EXPO_PUBLIC_USE_MOCK=true.

export interface UsuarioMock {
  id: number;
  nome: string;
  email: string;
  senha: string;
  papel: Papel;
  bairroId: number;
}

export const bairrosMock: Bairro[] = [
  {
    id: 1,
    nome: 'Jardim Ângela',
    municipio: 'São Paulo',
    uf: 'SP',
    codigoIbge: '3550308',
    aguaIntermitente: true,
    nivelRisco: 'AMARELO',
  },
  {
    id: 2,
    nome: 'Grajaú',
    municipio: 'São Paulo',
    uf: 'SP',
    codigoIbge: '3550308',
    aguaIntermitente: true,
    nivelRisco: 'LARANJA',
  },
  {
    id: 3,
    nome: 'Cidade Tiradentes',
    municipio: 'São Paulo',
    uf: 'SP',
    codigoIbge: '3550308',
    aguaIntermitente: true,
    nivelRisco: 'VERDE',
  },
  {
    id: 4,
    nome: 'Brasilândia',
    municipio: 'São Paulo',
    uf: 'SP',
    codigoIbge: '3550308',
    aguaIntermitente: false,
    nivelRisco: 'VERMELHO',
  },
];

export const usuariosMock: UsuarioMock[] = [
  {
    id: 1,
    nome: 'Maria Cidadã',
    email: 'cidadao@ressoa.com',
    senha: '123456',
    papel: 'CIDADAO',
    bairroId: 1,
  },
  {
    id: 2,
    nome: 'Gestor Saúde',
    email: 'gestor@ressoa.com',
    senha: '123456',
    papel: 'GESTOR',
    bairroId: 2,
  },
];

export const dispositivosMock: Dispositivo[] = [
  {
    id: 1,
    numeroSerie: 'RSA-0001',
    usuarioId: 1,
    bairroId: 1,
    tipoRecipiente: 'TAMBOR',
    volumeLitros: 200,
    pulsosPorDia: 1,
    status: 'ATIVO',
    instaladoEm: '2026-11-02T10:00:00Z',
  },
  {
    id: 2,
    numeroSerie: 'RSA-0002',
    usuarioId: 1,
    bairroId: 1,
    tipoRecipiente: 'CAIXA_DAGUA',
    volumeLitros: 500,
    pulsosPorDia: 2,
    status: 'BATERIA_BAIXA',
    instaladoEm: '2026-11-05T14:30:00Z',
  },
  {
    id: 3,
    numeroSerie: 'RSA-0003',
    usuarioId: 1,
    bairroId: 1,
    tipoRecipiente: 'BALDE',
    volumeLitros: 20,
    pulsosPorDia: 1,
    status: 'SEM_SINAL',
    instaladoEm: '2026-11-08T09:15:00Z',
  },
];

export function gerarLeiturasMock(dispositivoId: number): Leitura[] {
  const agora = Date.now();
  return Array.from({ length: 5 }, (_, i) => ({
    id: dispositivoId * 100 + i,
    dispositivoId,
    registradaEm: new Date(agora - i * 24 * 60 * 60 * 1000).toISOString(),
    bateriaPct: Math.max(8, 92 - dispositivoId * 20 - i * 3),
    temperaturaAgua: 24 + ((dispositivoId + i) % 4),
    pulsoOk: i !== 3,
  }));
}

export const orientacoesMock: Record<string, string> = {
  CIDADAO:
    "O risco no seu bairro está subindo. Mantenha a tampa do tambor e da caixa d'água bem fechada, " +
    'confira se o Ressoa está com bateria e, uma vez por semana, esfregue as paredes dos recipientes. ' +
    'Se alguém em casa tiver febre alta, dor atrás dos olhos ou manchas na pele, procure a UBS e beba bastante água.',
  GESTOR:
    'Plano de ação sugerido: 1) aumentar os pulsos para 2 por dia nos aparelhos do bairro; ' +
    '2) mutirão contra criadouros nas próximas 2 semanas; 3) alertar as famílias com bebês, gestantes e idosos; ' +
    '4) preparar uma sala de hidratação na UBS de referência.',
};
