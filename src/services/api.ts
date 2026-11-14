import { create, type AxiosInstance } from 'axios';

import { API_CONFIG } from './config';
import { mockAdapter } from './mock/mockAdapter';

// Um único JWT (emitido pela API Java) vale para as duas APIs, como define o briefing.
let tokenAtual: string | null = null;
let aoReceber401: (() => void) | null = null;

export function definirToken(token: string | null) {
  tokenAtual = token;
}

export function definirHandlerDe401(handler: (() => void) | null) {
  aoReceber401 = handler;
}

function criarCliente(baseURL: string): AxiosInstance {
  const cliente = create({
    baseURL,
    timeout: API_CONFIG.timeoutMs,
    headers: { 'Content-Type': 'application/json' },
    adapter: API_CONFIG.useMock ? mockAdapter : undefined,
  });

  cliente.interceptors.request.use((config) => {
    if (tokenAtual) {
      config.headers.Authorization = `Bearer ${tokenAtual}`;
    }
    return config;
  });

  cliente.interceptors.response.use(
    (response) => response,
    (error) => {
      const ehLogin = String(error.config?.url ?? '').includes('/auth/');
      if (error.response?.status === 401 && !ehLogin) {
        aoReceber401?.();
      }
      return Promise.reject(error);
    },
  );

  return cliente;
}

/** API principal: contas, bairros, aparelhos, risco e IA. */
export const javaApi = criarCliente(API_CONFIG.javaBaseUrl);

/** API de telemetria dos aparelhos. */
export const dotnetApi = criarCliente(API_CONFIG.dotnetBaseUrl);
