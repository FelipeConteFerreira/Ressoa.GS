import {
  AxiosError,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import type { Dispositivo, DispositivoPayload, LoginPayload, RegistroPayload } from '@/types';

import {
  bairrosMock,
  dispositivosMock,
  gerarLeiturasMock,
  orientacoesMock,
  usuariosMock,
} from './mockData';

/**
 * API simulada em memória para desenvolver sem o backend.
 * Ligada por EXPO_PUBLIC_USE_MOCK=true. Responde nas mesmas rotas do briefing,
 * então as telas e os services não mudam quando a API real entra.
 * Remova (ou desligue) antes do build publicado: a avaliação exige dados vindos da API.
 */
export const mockAdapter: AxiosAdapter = async (config) => {
  await new Promise((resolve) => setTimeout(resolve, 400)); // simula a rede
  const metodo = (config.method ?? 'get').toUpperCase();
  const url = (config.url ?? '').split('?')[0];
  const corpo = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
  const usuario = usuarioDoToken(config);

  // Auth
  if (metodo === 'POST' && url === '/api/auth/login') {
    const { email, senha } = corpo as LoginPayload;
    const encontrado = usuariosMock.find((u) => u.email === email && u.senha === senha);
    if (!encontrado) return falhar(config, 401, 'E-mail ou senha incorretos.');
    return ok(config, {
      token: criarTokenFalso(encontrado.id, encontrado.email, encontrado.papel),
      papel: encontrado.papel,
      nome: encontrado.nome,
      bairroId: encontrado.bairroId,
    });
  }
  if (metodo === 'POST' && url === '/api/auth/registro') {
    const dados = corpo as RegistroPayload;
    if (usuariosMock.some((u) => u.email === dados.email)) {
      return falhar(config, 409, 'Já existe uma conta com este e-mail.');
    }
    usuariosMock.push({ ...dados, id: usuariosMock.length + 1, papel: 'CIDADAO' });
    return ok(config, null, 201);
  }

  // Bairros (GET público)
  if (metodo === 'GET' && url === '/api/bairros') return ok(config, paginar(bairrosMock, 0, 100));
  const bairroMatch = url.match(/^\/api\/bairros\/(\d+)$/);
  if (metodo === 'GET' && bairroMatch) {
    const bairro = bairrosMock.find((b) => b.id === Number(bairroMatch[1]));
    return bairro ? ok(config, bairro) : falhar(config, 404, 'Bairro não encontrado.');
  }

  // Daqui em diante, tudo exige login
  if (!usuario) return falhar(config, 401, 'Sessão expirada.');

  const orientacaoMatch = url.match(/^\/api\/bairros\/(\d+)\/orientacao$/);
  if (metodo === 'POST' && orientacaoMatch) {
    return ok(config, { orientacao: orientacoesMock[usuario.papel] });
  }

  // Dispositivos (CRUD)
  if (url === '/api/dispositivos') {
    const visiveis =
      usuario.papel === 'GESTOR'
        ? dispositivosMock
        : dispositivosMock.filter((d) => d.usuarioId === usuario.id);
    if (metodo === 'GET') {
      const page = Number(config.params?.page ?? 0);
      const size = Number(config.params?.size ?? 10);
      return ok(config, paginar(visiveis, page, size));
    }
    if (metodo === 'POST') {
      const payload = corpo as DispositivoPayload;
      if (dispositivosMock.some((d) => d.numeroSerie === payload.numeroSerie)) {
        return falhar(config, 409, 'Já existe um aparelho com este número de série.');
      }
      const novo: Dispositivo = {
        ...payload,
        id: Math.max(0, ...dispositivosMock.map((d) => d.id)) + 1,
        usuarioId: usuario.id,
        status: 'ATIVO',
        instaladoEm: new Date().toISOString(),
      };
      dispositivosMock.push(novo);
      return ok(config, novo, 201);
    }
  }

  const dispositivoMatch = url.match(/^\/api\/dispositivos\/(\d+)$/);
  if (dispositivoMatch) {
    const indice = dispositivosMock.findIndex((d) => d.id === Number(dispositivoMatch[1]));
    if (indice === -1) return falhar(config, 404, 'Aparelho não encontrado.');
    if (metodo === 'GET') return ok(config, dispositivosMock[indice]);
    if (metodo === 'PUT') {
      dispositivosMock[indice] = { ...dispositivosMock[indice], ...(corpo as DispositivoPayload) };
      return ok(config, dispositivosMock[indice]);
    }
    if (metodo === 'DELETE') {
      dispositivosMock.splice(indice, 1);
      return ok(config, null, 204);
    }
  }

  // Telemetria (.NET)
  const statusMatch = url.match(/^\/api\/v1\/dispositivos\/(\d+)\/status$/);
  if (metodo === 'GET' && statusMatch) {
    return ok(config, gerarLeiturasMock(Number(statusMatch[1]))[0]);
  }
  const leiturasMatch = url.match(/^\/api\/v1\/dispositivos\/(\d+)\/leituras$/);
  if (metodo === 'GET' && leiturasMatch) {
    return ok(config, paginar(gerarLeiturasMock(Number(leiturasMatch[1])), 0, 5));
  }

  return falhar(config, 404, `Rota simulada não encontrada: ${metodo} ${url}`);
};

function ok<T>(config: InternalAxiosRequestConfig, data: T, status = 200): AxiosResponse<T> {
  return { data, status, statusText: 'OK', headers: {}, config };
}

function falhar(config: InternalAxiosRequestConfig, status: number, message: string): never {
  const response: AxiosResponse = {
    data: { message },
    status,
    statusText: 'Erro',
    headers: {},
    config,
  };
  throw new AxiosError(message, String(status), config, undefined, response);
}

function paginar<T>(itens: T[], page: number, size: number) {
  const inicio = page * size;
  const totalPages = Math.max(1, Math.ceil(itens.length / size));
  return {
    content: itens.slice(inicio, inicio + size),
    number: page,
    size,
    totalElements: itens.length,
    totalPages,
    last: page >= totalPages - 1,
  };
}

function criarTokenFalso(id: number, email: string, papel: string): string {
  const payload = btoa(JSON.stringify({ sub: email, id, papel }));
  return `mock.${payload}.assinatura`;
}

function usuarioDoToken(config: InternalAxiosRequestConfig) {
  const auth = String(config.headers?.Authorization ?? '');
  const payload = auth.replace('Bearer ', '').split('.')[1];
  if (!payload) return undefined;
  try {
    const { id } = JSON.parse(atob(payload)) as { id: number };
    return usuariosMock.find((u) => u.id === id);
  } catch {
    return undefined;
  }
}
