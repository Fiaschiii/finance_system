import { NavLink } from 'react-router-dom'

function navClass({ isActive }) {
  return isActive ? 'active' : undefined
}

function Header() {
  return (
    <header className="app-header">
      <div className="app-header__brand">Controle Financeiro</div>
      <nav className="app-header__nav">
        <NavLink to="/" end className={navClass}>Dashboard</NavLink>
        <NavLink to="/history" className={navClass}>Histórico</NavLink>
        <NavLink to="/settings" className={navClass}>Configurações</NavLink>
        <NavLink to="/login" className={navClass}>Login</NavLink>
      </nav>
    </header>
  )
}

export default Header
