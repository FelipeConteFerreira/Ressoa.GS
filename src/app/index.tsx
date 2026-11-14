import { Redirect } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';

/** Rota de entrada ("/"): manda para o Início se houver sessão, senão para o Login. */
export default function Index() {
  const { sessao } = useAuth();
  return <Redirect href={sessao ? '/inicio' : '/login'} />;
}
