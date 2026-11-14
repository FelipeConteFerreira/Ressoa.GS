import type { Leitura, Pagina } from '@/types';

import { dotnetApi } from './api';

/** Status e histórico enviados pelo aparelho (API .NET). */
export const telemetriaService = {
  async ultimoStatus(dispositivoId: number): Promise<Leitura | null> {
    try {
      const { data } = await dotnetApi.get<Leitura>(`/api/v1/dispositivos/${dispositivoId}/status`);
      return data;
    } catch (error: unknown) {
      // 404 = o aparelho ainda não enviou nenhuma leitura.
      if ((error as { response?: { status?: number } }).response?.status === 404) return null;
      throw error;
    }
  },

  async historico(dispositivoId: number, page = 0, size = 5): Promise<Leitura[]> {
    const { data } = await dotnetApi.get<Pagina<Leitura> | Leitura[]>(
      `/api/v1/dispositivos/${dispositivoId}/leituras`,
      { params: { page, size } },
    );
    return Array.isArray(data) ? data : data.content;
  },
};
