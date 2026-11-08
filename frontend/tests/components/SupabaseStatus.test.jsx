import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import SupabaseStatus from '../../src/components/SupabaseStatus.jsx'

function respond(status, body) {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue({ status, ok: status < 400, json: async () => body })
}

describe('SupabaseStatus', () => {
  it('conectado', async () => {
    respond(200, { configured: true, reachable: true })
    render(<SupabaseStatus />)
    expect(await screen.findByText('Conectado ao Supabase')).toBeInTheDocument()
  })

  it('limite de testes atingido (429): mostra o aviso, não "não configurado"', async () => {
    respond(429, { error: 'Muitas requisições em pouco tempo. Aguarde um pouco e tente de novo.', retryAfter: 30 })
    render(<SupabaseStatus />)
    expect(await screen.findByText(/Muitas requisições/)).toBeInTheDocument()
    expect(screen.queryByText(/não configurado/)).not.toBeInTheDocument()
  })
})
