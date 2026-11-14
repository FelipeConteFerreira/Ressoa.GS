import { javaApi } from './api';

/** POST /api/bairros/{id}/orientacao: texto gerado pelo Spring AI. */
export const orientacaoService = {
  async gerar(bairroId: number): Promise<string> {
    const { data } = await javaApi.post<unknown>(`/api/bairros/${bairroId}/orientacao`);
    if (typeof data === 'string') return data;

    const corpo = (data ?? {}) as Record<string, unknown>;
    const texto = corpo.orientacao ?? corpo.texto ?? corpo.conteudo ?? corpo.planoAcao;
    return typeof texto === 'string' ? texto : 'Nenhuma orientação disponível no momento.';
  },
};
