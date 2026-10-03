const ERROR_MESSAGES = {
  'Invalid login credentials': 'E-mail ou senha incorretos.',
  'User already registered': 'Esse e-mail já está cadastrado.',
  'Email not confirmed': 'Confirme seu e-mail antes de entrar (confira sua caixa de entrada).',
  'Password should be at least 6 characters': 'A senha precisa ter pelo menos 6 caracteres.',
  'Failed to fetch': 'Não consegui conectar ao Supabase. Confira a configuração do projeto (veja o console do navegador para mais detalhes).',
}

export function translateAuthError(message) {
  return ERROR_MESSAGES[message] || message || 'Algo deu errado. Tente novamente.'
}
