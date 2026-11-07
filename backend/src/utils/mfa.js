// Verificação em duas etapas (MFA): o Supabase grava no token o "nível de
// garantia" da sessão, no campo "aal":
// - aal1: entrou só com e-mail e senha;
// - aal2: entrou com senha E com o código do app autenticador.

// Lê o campo "aal" do token. Não confere a assinatura: isso já foi feito pelo
// supabase.auth.getUser(token) antes desta função ser chamada.
export function getTokenAal(token) {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'))
    return typeof payload.aal === 'string' ? payload.aal : null
  } catch {
    return null
  }
}

// O usuário tem algum app autenticador confirmado? (Um app só lido no QR
// Code, mas nunca confirmado com um código, não conta.)
export function hasVerifiedFactor(user) {
  return Boolean(user?.factors?.some((factor) => factor.status === 'verified'))
}

// Quem ativou a verificação em duas etapas precisa estar em aal2.
export function isMfaSatisfied(user, token) {
  return !hasVerifiedFactor(user) || getTokenAal(token) === 'aal2'
}
