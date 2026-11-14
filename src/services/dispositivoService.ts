import type { Dispositivo, DispositivoPayload, Pagina } from '@/types';

import { javaApi } from './api';

const RECURSO = '/api/dispositivos';

/** CRUD de aparelhos Ressoa (API Java). O CIDADAO só recebe os próprios aparelhos. */
export const dispositivoService = {
  async listar(page = 0, size = 10): Promise<Pagina<Dispositivo>> {
    const { data } = await javaApi.get<Pagina<Dispositivo>>(RECURSO, { params: { page, size } });
    return data;
  },

  async buscarPorId(id: number): Promise<Dispositivo> {
    const { data } = await javaApi.get<Dispositivo>(`${RECURSO}/${id}`);
    return data;
  },

  async criar(payload: DispositivoPayload): Promise<Dispositivo> {
    const { data } = await javaApi.post<Dispositivo>(RECURSO, payload);
    return data;
  },

  async atualizar(id: number, payload: DispositivoPayload): Promise<Dispositivo> {
    const { data } = await javaApi.put<Dispositivo>(`${RECURSO}/${id}`, payload);
    return data;
  },

  async excluir(id: number): Promise<void> {
    await javaApi.delete(`${RECURSO}/${id}`);
  },
};
