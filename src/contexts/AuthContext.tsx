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
import type { LoginPayload, LoginResponse, Papel, RegistroPayload, Sessao } from '@/types';
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

  // Monta a sessão a partir da resposta da API (login ou cadastro).
  const iniciarSessao = useCallback(
    async (resposta: LoginResponse, email: string) => {
      const claims = lerClaimsDoToken(resposta.token);
      const bairroDoToken = typeof claims.bairroId === 'number' ? claims.bairroId : undefined;

      await salvarSessao({
        token: resposta.token,
        papel: (resposta.papel ?? resposta.usuario?.papel ?? claims.papel) as Papel,
        email: resposta.usuario?.email ?? email,
        nome: resposta.usuario?.nome,
        bairroId: resposta.usuario?.bairroId ?? bairroDoToken,
      });
    },
    [salvarSessao],
  );

  const entrar = useCallback(
    async ({ email, senha }: LoginPayload) => {
      const emailNormalizado = email.trim().toLowerCase();
      const resposta = await authService.login({ email: emailNormalizado, senha });
      await iniciarSessao(resposta, emailNormalizado);
    },
    [iniciarSessao],
  );

  const cadastrar = useCallback(
    async (payload: RegistroPayload) => {
      const emailNormalizado = payload.email.trim().toLowerCase();
      // A API devolve o token no cadastro: o usuário já entra no app.
      const resposta = await authService.registrar({ ...payload, email: emailNormalizado });
      await iniciarSessao(resposta, emailNormalizado);
    },
    [iniciarSessao],
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
