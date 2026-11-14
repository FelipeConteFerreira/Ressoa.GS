// Tipos espelham o modelo de dados comum do briefing (tabelas USUARIO, BAIRRO, DISPOSITIVO,
// LEITURA e AVALIACAO_RISCO), em camelCase como o Spring/ASP.NET serializam por padrão.
// Confirme os nomes no Swagger das APIs e ajuste só aqui se algo mudar.

export type Papel = 'CIDADAO' | 'GESTOR';
export type NivelRisco = 'VERDE' | 'AMARELO' | 'LARANJA' | 'VERMELHO';
export type TipoRecipiente = 'BALDE' | 'TAMBOR' | 'CAIXA_DAGUA';
export type StatusDispositivo = 'ATIVO' | 'SEM_SINAL' | 'BATERIA_BAIXA' | 'INATIVO';

export interface Bairro {
  id: number;
  nome: string;
  municipio: string;
  uf: string;
  codigoIbge?: string;
  aguaIntermitente?: boolean;
  nivelRisco?: NivelRisco | null;
}

export interface Dispositivo {
  id: number;
  numeroSerie: string;
  usuarioId?: number;
  bairroId: number;
  tipoRecipiente: TipoRecipiente;
  volumeLitros: number;
  pulsosPorDia: number;
  status: StatusDispositivo;
  instaladoEm?: string;
}

/** Corpo enviado no POST/PUT de /api/dispositivos. */
export type DispositivoPayload = Pick<
  Dispositivo,
  'numeroSerie' | 'bairroId' | 'tipoRecipiente' | 'volumeLitros' | 'pulsosPorDia'
>;

export interface Leitura {
  id: number;
  dispositivoId: number;
  registradaEm: string;
  bateriaPct: number;
  temperaturaAgua: number;
  pulsoOk: boolean;
}

/** Resposta paginada do Spring Data (Page<T>). */
export interface Pagina<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface RegistroPayload {
  nome: string;
  email: string;
  senha: string;
  bairroId: number;
}

export interface LoginPayload {
  email: string;
  senha: string;
}

/** POST /api/auth/login devolve { token, papel }. nome e bairroId são opcionais. */
export interface LoginResponse {
  token: string;
  papel: Papel;
  nome?: string;
  bairroId?: number;
}

export interface Sessao {
  token: string;
  papel: Papel;
  email: string;
  nome?: string;
  bairroId?: number;
}
