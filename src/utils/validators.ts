const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarEmail(email: string): string | undefined {
  if (!email.trim()) return 'Informe o e-mail.';
  if (!EMAIL_REGEX.test(email.trim())) return 'E-mail inválido.';
  return undefined;
}

/** No login, só exige a senha preenchida: quem valida é a API. */
export function validarSenha(senha: string): string | undefined {
  if (!senha) return 'Informe a senha.';
  return undefined;
}

/** Mesma regra da API Java: de 8 a 72 caracteres, com letras e números. */
export function validarNovaSenha(senha: string): string | undefined {
  if (!senha) return 'Informe a senha.';
  if (senha.length < 8 || senha.length > 72) return 'A senha deve ter entre 8 e 72 caracteres.';
  if (!/[A-Za-z]/.test(senha) || !/\d/.test(senha)) return 'A senha deve conter letras e números.';
  return undefined;
}

/** Mesma regra da API Java para o nome: de 3 a 120 caracteres. */
export function validarNome(nome: string): string | undefined {
  if (!nome.trim()) return 'Informe seu nome.';
  if (nome.trim().length < 3) return 'O nome deve ter pelo menos 3 caracteres.';
  return undefined;
}

/** Mesma regra da API Java: de 4 a 40 letras, números ou hífen. */
export function validarNumeroSerie(numeroSerie: string): string | undefined {
  if (!numeroSerie.trim()) return 'Informe o número de série.';
  if (!/^[A-Za-z0-9-]{4,40}$/.test(numeroSerie.trim())) {
    return 'Use de 4 a 40 letras, números ou hífen (ex.: RSA-2026-0004).';
  }
  return undefined;
}

export function validarObrigatorio(valor: string, campo: string): string | undefined {
  if (!valor.trim()) return `Informe ${campo}.`;
  return undefined;
}

export function validarInteiro(
  valor: string,
  campo: string,
  min: number,
  max: number,
): string | undefined {
  if (!valor.trim()) return `Informe ${campo}.`;
  const numero = Number(valor);
  if (!Number.isInteger(numero)) return `${capitalizar(campo)} deve ser um número inteiro.`;
  if (numero < min || numero > max)
    return `${capitalizar(campo)} deve estar entre ${min} e ${max}.`;
  return undefined;
}

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
