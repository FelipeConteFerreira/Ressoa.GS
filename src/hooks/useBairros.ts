import { useCallback, useEffect, useState } from 'react';

import { bairroService } from '@/services';
import type { Bairro } from '@/types';
import { getErrorMessage } from '@/utils/errors';

/** Carrega a lista de bairros (usada no cadastro, no formulário e na tela inicial). */
export function useBairros() {
  const [bairros, setBairros] = useState<Bairro[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const buscar = useCallback(
    () =>
      bairroService
        .listar()
        .then(setBairros, (e: unknown) => setErro(getErrorMessage(e)))
        .finally(() => setCarregando(false)),
    [],
  );

  useEffect(() => {
    void buscar();
  }, [buscar]);

  const recarregar = useCallback(() => {
    setCarregando(true);
    setErro(null);
    void buscar();
  }, [buscar]);

  return { bairros, carregando, erro, recarregar };
}
