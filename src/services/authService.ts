import type { LoginPayload, LoginResponse, RegistroPayload } from '@/types';

import { javaApi } from './api';

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await javaApi.post<LoginResponse>('/api/auth/login', payload);
    return data;
  },

  async registrar(payload: RegistroPayload): Promise<void> {
    await javaApi.post('/api/auth/registro', payload);
  },
};
