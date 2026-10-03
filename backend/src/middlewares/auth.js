import { createClient } from '@supabase/supabase-js'

const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = process.env

// Valida o token enviado pelo frontend (Authorization: Bearer <token>) e,
// se for válido, disponibiliza:
// - req.user: dados do usuário autenticado
// - req.supabase: cliente do Supabase já "logado" como esse usuário —
//   qualquer consulta feita com ele respeita o RLS automaticamente,
//   sem precisar da chave secret em nenhum momento.
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'Token de autenticação ausente' })
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    })

    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data.user) {
      return res.status(401).json({ error: 'Token inválido ou expirado' })
    }

    req.user = data.user
    req.supabase = supabase
    next()
  } catch (err) {
    res.status(500).json({ error: 'Falha ao validar autenticação' })
  }
}
