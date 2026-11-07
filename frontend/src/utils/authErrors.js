const ERROR_MESSAGES = {
  'Invalid login credentials': 'E-mail ou senha incorretos.',
  'User already registered': 'Esse e-mail já está cadastrado.',
  'Email not confirmed': 'Confirme seu e-mail antes de entrar (confira sua caixa de entrada).',
  'Failed to fetch': 'Não consegui conectar ao Supabase. Confira a configuração do projeto (veja o console do navegador para mais detalhes).',
}

// Mensagens do Supabase que trazem um número no meio (o mínimo de caracteres
// depende do que estiver configurado no painel; o tempo de espera, do limite).
const ERROR_PATTERNS = [
  [/Password should be at least (\d+) characters/i, (n) => `A senha precisa ter pelo menos ${n} caracteres.`],
  [/you can only request this after (\d+) seconds/i, (n) => `Por segurança, aguarde ${n} segundos antes de tentar de novo.`],
  [/rate limit exceeded/i, () => 'Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente de novo.'],
]

export function translateAuthError(message) {
  if (ERROR_MESSAGES[message]) return ERROR_MESSAGES[message]
  for (const [pattern, translate] of ERROR_PATTERNS) {
    const match = pattern.exec(message ?? '')
    if (match) return translate(match[1])
  }
  return message || 'Algo deu errado. Tente novamente.'
}
