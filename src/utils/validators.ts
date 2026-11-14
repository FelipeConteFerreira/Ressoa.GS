const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarEmail(email: string): string | undefined {
  if (!email.trim()) return 'Informe o e-mail.';
  if (!EMAIL_REGEX.test(email.trim())) return 'E-mail inválido.';
  return undefined;
}

export function validarSenha(senha: string): string | undefined {
  if (!senha) return 'Informe a senha.';
  if (senha.length < 6) return 'A senha precisa ter pelo menos 6 caracteres.';
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
