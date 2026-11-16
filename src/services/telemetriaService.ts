import type { Leitura, Pagina, StatusTelemetria } from '@/types';

import { dotnetApi } from './api';

/** Status e histórico enviados pelo aparelho (API .NET). */
export const telemetriaService = {
  async ultimoStatus(dispositivoId: number): Promise<StatusTelemetria> {
    const { data } = await dotnetApi.get<StatusTelemetria>(
      `/api/v1/dispositivos/${dispositivoId}/status`,
    );
    return data;
  },

  async historico(dispositivoId: number, page = 0, size = 5): Promise<Leitura[]> {
    const { data } = await dotnetApi.get<Pagina<Leitura>>(
      `/api/v1/dispositivos/${dispositivoId}/leituras`,
      { params: { page, size } },
    );
    return data.content;
  },
};
