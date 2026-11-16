import type { Bairro, Dispositivo, Leitura, NivelRisco, Papel } from '@/types';

// Dados fictícios usados só quando EXPO_PUBLIC_USE_MOCK=true.
// Bairros, usuários e aparelhos imitam a carga inicial da API Java (senha Ressoa@2026).

export interface UsuarioMock {
  id: number;
  nome: string;
  email: string;
  senha: string;
  papel: Papel;
  bairroId: number;
}

export const ACAO_RECOMENDADA: Record<NivelRisco, string> = {
  VERDE: 'Instalar o Ressoa nos bairros com água intermitente.',
  AMARELO: 'Mais pulsos por dia, mutirão contra criadouros e alerta aos moradores.',
  LARANJA: 'Bloqueio da transmissão nos primeiros casos e salas de hidratação.',
  VERMELHO: 'Plano de emergência, com prioridade a bebês, gestantes e idosos.',
};

function bairro(
  id: number,
  nome: string,
  municipio: string,
  uf: string,
  codigoIbge: string,
  aguaIntermitente: boolean,
  nivelRisco: NivelRisco,
): Bairro {
  return {
    id,
    nome,
    municipio,
    uf,
    codigoIbge,
    aguaIntermitente,
    nivelRisco,
    acaoRecomendada: ACAO_RECOMENDADA[nivelRisco],
  };
}

export const bairrosMock: Bairro[] = [
  bairro(1, 'Jardim Ângela', 'São Paulo', 'SP', '3550308', true, 'AMARELO'),
  bairro(2, 'Grajaú', 'São Paulo', 'SP', '3550308', true, 'LARANJA'),
  bairro(3, 'Complexo da Maré', 'Rio de Janeiro', 'RJ', '3304557', true, 'VERMELHO'),
  bairro(4, 'Vila Pinho', 'Belo Horizonte', 'MG', '3106200', true, 'VERDE'),
  bairro(5, 'Ibura', 'Recife', 'PE', '2611606', true, 'AMARELO'),
  bairro(6, 'Moema', 'São Paulo', 'SP', '3550308', false, 'VERDE'),
];

export const usuariosMock: UsuarioMock[] = [
  {
    id: 1,
    nome: 'Gestora Vigilância SP',
    email: 'gestor@ressoa.app',
    senha: 'Ressoa@2026',
    papel: 'GESTOR',
    bairroId: 1,
  },
  {
    id: 2,
    nome: 'Maria Aparecida',
    email: 'morador@ressoa.app',
    senha: 'Ressoa@2026',
    papel: 'CIDADAO',
    bairroId: 1,
  },
  {
    id: 3,
    nome: 'João Batista',
    email: 'joao@ressoa.app',
    senha: 'Ressoa@2026',
    papel: 'CIDADAO',
    bairroId: 2,
  },
];

export const dispositivosMock: Dispositivo[] = [
  {
    id: 1,
    numeroSerie: 'RSA-2026-0001',
    usuarioId: 2,
    usuarioNome: 'Maria Aparecida',
    bairroId: 1,
    bairroNome: 'Jardim Ângela',
    tipoRecipiente: 'TAMBOR',
    volumeLitros: 200,
    pulsosPorDia: 1,
    status: 'ATIVO',
    instaladoEm: '2026-11-02T10:00:00Z',
  },
  {
    id: 2,
    numeroSerie: 'RSA-2026-0002',
    usuarioId: 2,
    usuarioNome: 'Maria Aparecida',
    bairroId: 1,
    bairroNome: 'Jardim Ângela',
    tipoRecipiente: 'CAIXA_DAGUA',
    volumeLitros: 500,
    pulsosPorDia: 1,
    status: 'BATERIA_BAIXA',
    instaladoEm: '2026-11-05T14:30:00Z',
  },
  {
    id: 3,
    numeroSerie: 'RSA-2026-0003',
    usuarioId: 3,
    usuarioNome: 'João Batista',
    bairroId: 2,
    bairroNome: 'Grajaú',
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
    bateriaPct: Math.max(8, 92 - dispositivoId * 30 - i * 3),
    temperaturaAgua: 24 + ((dispositivoId + i) % 4),
    pulsoOk: i !== 3,
  }));
}

export const orientacoesMock: Record<Papel, string> = {
  CIDADAO:
    "O risco no seu bairro está subindo. Mantenha a tampa do tambor e da caixa d'água bem fechada, " +
    'confira se o Ressoa está com bateria e, uma vez por semana, esfregue as paredes dos recipientes. ' +
    'Se alguém em casa tiver febre alta, dor atrás dos olhos ou manchas na pele, procure a UBS e beba bastante água.',
  GESTOR:
    'Plano de ação sugerido: 1) aumentar os pulsos para 2 por dia nos aparelhos do bairro; ' +
    '2) mutirão contra criadouros nas próximas 2 semanas; 3) alertar as famílias com bebês, gestantes e idosos; ' +
    '4) preparar uma sala de hidratação na UBS de referência.',
};
