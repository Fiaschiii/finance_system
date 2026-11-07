import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ROUTER_FUTURE } from '../../src/routerFuture.js'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { useAuth } from '../../src/hooks/useAuth.jsx'
import RequireAuth from '../../src/components/RequireAuth.jsx'
import PublicOnlyRoute from '../../src/components/PublicOnlyRoute.jsx'

vi.mock('../../src/hooks/useAuth.jsx', () => ({ useAuth: vi.fn() }))

function renderAt(path) {
  render(
    <MemoryRouter initialEntries={[path]} future={ROUTER_FUTURE}>
      <Routes>
        <Route path="/" element={<RequireAuth>Dashboard privado</RequireAuth>} />
        <Route path="/login" element={<PublicOnlyRoute>Tela de login</PublicOnlyRoute>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('rotas protegidas', () => {
  it('enquanto carrega a sessão, mostra "Carregando…"', () => {
    useAuth.mockReturnValue({ user: null, loading: true })
    renderAt('/')
    expect(screen.getByText('Carregando…')).toBeInTheDocument()
    expect(screen.queryByText('Dashboard privado')).not.toBeInTheDocument()
  })

  it('sem login, a página privada manda para o login', () => {
    useAuth.mockReturnValue({ user: null, loading: false })
    renderAt('/')
    expect(screen.getByText('Tela de login')).toBeInTheDocument()
    expect(screen.queryByText('Dashboard privado')).not.toBeInTheDocument()
  })

  it('logado, a página privada aparece', () => {
    useAuth.mockReturnValue({ user: { id: 'u1' }, loading: false })
    renderAt('/')
    expect(screen.getByText('Dashboard privado')).toBeInTheDocument()
  })

  it('logado, a tela de login manda para o início', () => {
    useAuth.mockReturnValue({ user: { id: 'u1' }, loading: false })
    renderAt('/login')
    expect(screen.getByText('Dashboard privado')).toBeInTheDocument()
  })
})
