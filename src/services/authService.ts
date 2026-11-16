import type { LoginPayload, LoginResponse, RegistroPayload } from '@/types';

import { javaApi } from './api';

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await javaApi.post<LoginResponse>('/api/auth/login', payload);
    return data;
  },

  /** A API já devolve o token no cadastro, então o usuário entra direto. */
  async registrar(payload: RegistroPayload): Promise<LoginResponse> {
    const { data } = await javaApi.post<LoginResponse>('/api/auth/registro', payload);
    return data;
  },
};
