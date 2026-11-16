// Tipos espelham os contratos das APIs do Ressoa:
// - Java (ressoa-api-java): auth, bairros, aparelhos e orientação por IA
// - .NET (ressoa-api-dotnet): telemetria dos aparelhos
// Se um contrato mudar no Swagger, ajuste só aqui.

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
  /** Ação da tabela de níveis, devolvida pela API Java. */
  acaoRecomendada?: string;
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
  usuarioNome?: string;
  bairroNome?: string;
}

/** Corpo do POST /api/dispositivos. */
export type DispositivoPayload = Pick<
  Dispositivo,
  'numeroSerie' | 'bairroId' | 'tipoRecipiente' | 'volumeLitros' | 'pulsosPorDia'
>;

/** Corpo do PUT /api/dispositivos/{id}: o número de série não pode ser alterado. */
export type DispositivoAtualizacao = Omit<DispositivoPayload, 'numeroSerie'>;

/** Item do histórico: GET /api/v1/dispositivos/{id}/leituras (API .NET). */
export interface Leitura {
  id: number;
  dispositivoId: number;
  numeroSerie?: string;
  registradaEm: string;
  bateriaPct: number;
  temperaturaAgua: number;
  pulsoOk: boolean;
}

/** Último status com indicadores: GET /api/v1/dispositivos/{id}/status (API .NET). */
export interface StatusTelemetria {
  dispositivoId: number;
  numeroSerie: string;
  status: StatusDispositivo;
  online: boolean;
  ultimaLeituraEm: string | null;
  bateriaPct: number | null;
  temperaturaAgua: number | null;
  ultimoPulsoOk: boolean | null;
  pulsosPorDia: number;
  /** De 0 a 1 (ou de 0 a 100, conforme a API). */
  taxaSucessoPulso7Dias: number | null;
  leiturasUltimos7Dias: number;
  alertas: string[];
}

/** Envelope de paginação comum às duas APIs. */
export interface Pagina<T> {
  content: T[];
  page: number;
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

export interface UsuarioResponse {
  id: number;
  nome: string;
  email: string;
  papel: Papel;
  bairroId: number | null;
  bairroNome: string | null;
}

/** Resposta de POST /api/auth/login e POST /api/auth/registro. */
export interface LoginResponse {
  token: string;
  tipo?: string;
  expiraEm?: string;
  papel: Papel;
  usuario?: UsuarioResponse;
}

/** Resposta de POST /api/bairros/{id}/orientacao. */
export interface OrientacaoResponse {
  bairroId: number;
  bairroNome: string;
  nivel: NivelRisco;
  publico: 'MORADOR' | 'GESTOR';
  texto: string;
  geradaPorIa: boolean;
  geradaEm: string;
}

export interface Sessao {
  token: string;
  papel: Papel;
  email: string;
  nome?: string;
  bairroId?: number;
}
