import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { authService, definirHandlerDe401, definirToken } from '@/services';
import type { LoginPayload, Papel, RegistroPayload, Sessao } from '@/types';
import { lerClaimsDoToken } from '@/utils/jwt';
import { STORAGE_KEYS, storage } from '@/utils/storage';

interface AuthContextValue {
  sessao: Sessao | null;
  carregando: boolean;
  entrar: (payload: LoginPayload) => Promise<void>;
  cadastrar: (payload: RegistroPayload) => Promise<void>;
  sair: () => Promise<void>;
  atualizarBairro: (bairroId: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [carregando, setCarregando] = useState(true);

  const salvarSessao = useCallback(async (nova: Sessao | null) => {
    definirToken(nova?.token ?? null);
    setSessao(nova);
    if (nova) await storage.set(STORAGE_KEYS.sessao, JSON.stringify(nova));
    else await storage.remove(STORAGE_KEYS.sessao);
  }, []);

  const sair = useCallback(() => salvarSessao(null), [salvarSessao]);

  // Restaura a sessão salva ao abrir o app.
  useEffect(() => {
    (async () => {
      try {
        const salva = await storage.get(STORAGE_KEYS.sessao);
        if (salva) {
          const restaurada = JSON.parse(salva) as Sessao;
          definirToken(restaurada.token);
          setSessao(restaurada);
        }
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  // Token expirado ou inválido em qualquer chamada: encerra a sessão.
  useEffect(() => {
    definirHandlerDe401(() => {
      void sair();
    });
    return () => definirHandlerDe401(null);
  }, [sair]);

  const entrar = useCallback(
    async ({ email, senha }: LoginPayload) => {
      const resposta = await authService.login({ email: email.trim().toLowerCase(), senha });
      const claims = lerClaimsDoToken(resposta.token);

      await salvarSessao({
        token: resposta.token,
        papel: (resposta.papel ?? claims.papel) as Papel,
        email: email.trim().toLowerCase(),
        nome: resposta.nome ?? (typeof claims.nome === 'string' ? claims.nome : undefined),
        bairroId:
          resposta.bairroId ?? (typeof claims.bairroId === 'number' ? claims.bairroId : undefined),
      });
    },
    [salvarSessao],
  );

  const cadastrar = useCallback(
    async (payload: RegistroPayload) => {
      await authService.registrar({ ...payload, email: payload.email.trim().toLowerCase() });
      // Após o cadastro, já entra no app.
      await entrar({ email: payload.email, senha: payload.senha });
    },
    [entrar],
  );

  const atualizarBairro = useCallback(
    async (bairroId: number) => {
      if (sessao) await salvarSessao({ ...sessao, bairroId });
    },
    [sessao, salvarSessao],
  );

  const value = useMemo(
    () => ({ sessao, carregando, entrar, cadastrar, sair, atualizarBairro }),
    [sessao, carregando, entrar, cadastrar, sair, atualizarBairro],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth precisa estar dentro de <AuthProvider>.');
  return context;
}
