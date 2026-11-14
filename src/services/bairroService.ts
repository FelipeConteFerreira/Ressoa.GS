import type { Bairro, Pagina } from '@/types';

import { javaApi } from './api';

export const bairroService = {
  /** GET /api/bairros é público: usado também na tela de cadastro. */
  async listar(): Promise<Bairro[]> {
    const { data } = await javaApi.get<Pagina<Bairro> | Bairro[]>('/api/bairros', {
      params: { page: 0, size: 100, sort: 'nome' },
    });
    return Array.isArray(data) ? data : data.content;
  },

  async buscarPorId(id: number): Promise<Bairro> {
    const { data } = await javaApi.get<Bairro>(`/api/bairros/${id}`);
    return data;
  },
};
