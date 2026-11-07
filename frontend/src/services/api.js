import { supabase } from './supabase.js'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function authHeaders() {
  if (!supabase) return {}
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}


export async function apiFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(await authHeaders()),
    ...options.headers,
  }

  let response
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers })
  } catch {
    throw new Error(
      `Não consegui falar com o backend em ${API_URL}. Confira se ele está rodando (npm run dev na pasta backend).`
    )
  }

  const body = await response.json().catch(() => null)

  if (!response.ok) {
   
    const base = body?.error || `Erro ${response.status}`
    const error = new Error(body?.detail ? `${base} (${body.detail})` : base)
    error.status = response.status
    error.code = body?.code
    throw error
  }

  return body
}
