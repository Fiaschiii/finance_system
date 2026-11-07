import { useEffect, useState } from 'react'
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import Icon from './Icon.jsx'

function navClass({ isActive }) {
  return isActive ? 'active' : undefined
}

// Cabeçalho. Em telas pequenas, os links ficam atrás do botão "Menu".
function Header() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  // Fecha o menu ao trocar de página.
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname, location.search])

  // Fecha o menu com Esc.
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event) => event.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="app-header">
      <Link to="/" className="app-header__brand">
        <span className="app-header__logo">
          <Icon name="logo" size={18} />
        </span>
        Controle Financeiro
      </Link>

      {user && (
        <button
          type="button"
          className="icon-button app-header__menu-button"
          aria-expanded={menuOpen}
          aria-controls="main-nav"
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
        </button>
      )}

      <nav id="main-nav" className={`app-header__nav${menuOpen ? ' app-header__nav--open' : ''}`}>
        {user ? (
          <>
            <NavLink to="/" end className={navClass}>Resumo</NavLink>
            <NavLink to="/history" className={navClass}>Histórico</NavLink>
            <NavLink to="/settings" className={navClass}>Configurações</NavLink>
            <span className="app-header__account">
              <span className="app-header__user" title={user.email}>{user.email}</span>
              <button type="button" className="app-header__logout" onClick={handleLogout}>
                Sair
              </button>
            </span>
          </>
        ) : (
          <NavLink to="/login" className={navClass}>Entrar</NavLink>
        )}
      </nav>
    </header>
  )
}

export default Header
