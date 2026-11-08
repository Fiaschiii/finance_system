import { supabase } from './supabase.js'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function authHeaders() {
  if (!supabase) return {}
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// "42 s", "3 min": quanto esperar depois de um 429 (o backend manda em segundos).
export function formatWait(seconds) {
  if (seconds < 60) return `${seconds} s`
  return `${Math.ceil(seconds / 60)} min`
}

async function request(path, options) {
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
    let base = body?.error || `Erro ${response.status}`
    const retryAfter = Number(body?.retryAfter) || null
    // Limite de requisições (Etapa 17): diz quanto tempo esperar.
    if (response.status === 429 && retryAfter) {
      base = `${base} (liberado em ${formatWait(retryAfter)})`
    }
    const error = new Error(body?.detail ? `${base} (${body.detail})` : base)
    error.status = response.status
    error.code = body?.code
    if (retryAfter) error.retryAfter = retryAfter
    throw error
  }

  return body
}

// Leituras (GET) iguais que já estão a caminho não saem de novo: quem pede
// a mesma coisa recebe a mesma resposta. Evita rajadas quando várias partes
// da tela carregam o mesmo dado ao mesmo tempo.
const inFlight = new Map()

export function apiFetch(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase()

  if (method !== 'GET') {
    // Depois de uma gravação, uma leitura que começou antes traria dado
    // antigo: as próximas leituras saem do zero.
    inFlight.clear()
    return request(path, options)
  }

  if (inFlight.has(path)) return inFlight.get(path)

  const promise = request(path, options).finally(() => {
    if (inFlight.get(path) === promise) inFlight.delete(path)
  })
  inFlight.set(path, promise)
  return promise
}
