import type { OrientacaoResponse } from '@/types';

import { javaApi } from './api';

/** POST /api/bairros/{id}/orientacao: Spring AI (ou protocolo padrão se a IA estiver fora). */
export const orientacaoService = {
  async gerar(bairroId: number): Promise<OrientacaoResponse> {
    const { data } = await javaApi.post<OrientacaoResponse>(`/api/bairros/${bairroId}/orientacao`);
    return data;
  },
};
