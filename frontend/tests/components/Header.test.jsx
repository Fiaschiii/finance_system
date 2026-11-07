import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ROUTER_FUTURE } from '../../src/routerFuture.js'
import { useAuth } from '../../src/hooks/useAuth.jsx'
import Header from '../../src/components/Header.jsx'

vi.mock('../../src/hooks/useAuth.jsx', () => ({ useAuth: vi.fn() }))

function renderHeader(user = { id: 'u1', email: 'ana@exemplo.com' }) {
  useAuth.mockReturnValue({ user, signOut: vi.fn() })
  render(
    <MemoryRouter future={ROUTER_FUTURE}>
      <Header />
    </MemoryRouter>
  )
  return userEvent.setup()
}

describe('Header', () => {
  it('logado: mostra os links e o e-mail', () => {
    renderHeader()
    expect(screen.getByRole('link', { name: 'Resumo' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Histórico' })).toBeInTheDocument()
    expect(screen.getByText('ana@exemplo.com')).toBeInTheDocument()
  })

  it('botão de menu (celular) abre e fecha, avisando o estado', async () => {
    const user = renderHeader()
    const button = screen.getByRole('button', { name: 'Abrir menu' })
    expect(button).toHaveAttribute('aria-expanded', 'false')

    await user.click(button)
    expect(screen.getByRole('button', { name: 'Fechar menu' })).toHaveAttribute('aria-expanded', 'true')
    expect(document.getElementById('main-nav')).toHaveClass('app-header__nav--open')

    await user.keyboard('{Escape}')
    expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('o menu fecha ao escolher uma página', async () => {
    const user = renderHeader()
    await user.click(screen.getByRole('button', { name: 'Abrir menu' }))
    await user.click(screen.getByRole('link', { name: 'Histórico' }))
    expect(document.getElementById('main-nav')).not.toHaveClass('app-header__nav--open')
  })

  it('sem login: só o link Entrar, sem botão de menu', () => {
    renderHeader(null)
    expect(screen.getByRole('link', { name: 'Entrar' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Abrir menu' })).not.toBeInTheDocument()
  })
})
