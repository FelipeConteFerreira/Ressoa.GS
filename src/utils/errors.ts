import { isAxiosError } from 'axios';

/** Converte qualquer erro de API numa mensagem amigável para exibir na tela. */
export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    if (!error.response) {
      return 'Sem conexão com o servidor. Verifique sua internet e tente novamente.';
    }

    const { status, data } = error.response;
    const mensagemDaApi = extrairMensagem(data);

    switch (status) {
      case 400:
      case 422:
        return mensagemDaApi ?? 'Dados inválidos. Revise os campos.';
      case 401:
        return mensagemDaApi ?? 'E-mail ou senha incorretos.';
      case 403:
        return 'Você não tem permissão para esta ação.';
      case 404:
        return 'Registro não encontrado.';
      case 409:
        return mensagemDaApi ?? 'Este registro já existe.';
      case 429:
        return 'Muitas requisições. Aguarde alguns segundos.';
      default:
        return mensagemDaApi ?? 'Erro no servidor. Tente novamente mais tarde.';
    }
  }

  if (error instanceof Error) return error.message;
  return 'Algo deu errado. Tente novamente.';
}

// Aceita os formatos mais comuns do @RestControllerAdvice e do ProblemDetails do .NET.
function extrairMensagem(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return undefined;
  const corpo = data as Record<string, unknown>;

  if (typeof corpo.message === 'string') return corpo.message;
  if (typeof corpo.mensagem === 'string') return corpo.mensagem;
  if (typeof corpo.detail === 'string') return corpo.detail;

  if (Array.isArray(corpo.erros) && corpo.erros.length > 0) {
    return corpo.erros.map(String).join('\n');
  }
  if (corpo.errors && typeof corpo.errors === 'object') {
    return Object.values(corpo.errors as Record<string, unknown>)
      .flat()
      .map(String)
      .join('\n');
  }
  return undefined;
}
