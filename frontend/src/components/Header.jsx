import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'

function navClass({ isActive }) {
  return isActive ? 'active' : undefined
}

function Header() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="app-header">
      <div className="app-header__brand">Controle Financeiro</div>  
      <nav className="app-header__nav">
        {user ? (
          <>
            <NavLink to="/" end className={navClass}>Dashboard</NavLink>
            <NavLink to="/history" className={navClass}>Histórico</NavLink>
            <NavLink to="/settings" className={navClass}>Configurações</NavLink>
            <span className="app-header__user">{user.email}</span>
            <button type="button" className="app-header__logout" onClick={handleLogout}>
              Sair
            </button>
          </>
        ) : (
          <NavLink to="/login" className={navClass}>Login</NavLink>
        )}
      </nav>
    </header>
  )
}

export default Header
