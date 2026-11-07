import { describe, it, expect, vi, beforeEach } from 'vitest'

const getSession = vi.fn()
vi.mock('../../src/services/supabase.js', () => ({
  supabase: { auth: { getSession: (...args) => getSession(...args) } },
}))

const { apiFetch } = await import('../../src/services/api.js')

function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => {
      if (body === undefined) throw new SyntaxError('sem corpo')
      return body
    },
  }
}

beforeEach(() => {
  getSession.mockResolvedValue({ data: { session: { access_token: 'abc' } } })
})

describe('apiFetch', () => {
  it('envia o token da sessão e devolve o JSON', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(200, { ok: true }))

    expect(await apiFetch('/api/finance', { method: 'POST', body: '{}' })).toEqual({ ok: true })

    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toMatch(/\/api\/finance$/)
    expect(options.method).toBe('POST')
    expect(options.headers.Authorization).toBe('Bearer abc')
    expect(options.headers['Content-Type']).toBe('application/json')
  })

  it('sem sessão, não manda Authorization', async () => {
    getSession.mockResolvedValue({ data: { session: null } })
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(200, {}))
    await apiFetch('/api/health')
    expect(fetchMock.mock.calls[0][1].headers).not.toHaveProperty('Authorization')
  })

  it('erro da API vira Error com a mensagem e o status', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(400, { error: 'Categoria inválida.' }))
    await expect(apiFetch('/api/expenses')).rejects.toMatchObject({ message: 'Categoria inválida.', status: 400 })
  })

  it('inclui o detalhe técnico quando o backend manda', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse(500, { error: 'Erro interno do servidor.', detail: 'tabela não existe' })
    )
    await expect(apiFetch('/x')).rejects.toThrow('Erro interno do servidor. (tabela não existe)')
  })

  it('resposta de erro sem JSON usa o código HTTP', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(502))
    await expect(apiFetch('/x')).rejects.toMatchObject({ message: 'Erro 502', status: 502 })
  })

  it('204 sem corpo devolve null', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(204))
    expect(await apiFetch('/api/expenses/1', { method: 'DELETE' })).toBeNull()
  })

  it('backend desligado: mensagem explicando o que fazer', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'))
    await expect(apiFetch('/x')).rejects.toThrow(/Confira se ele está rodando/)
  })
})
