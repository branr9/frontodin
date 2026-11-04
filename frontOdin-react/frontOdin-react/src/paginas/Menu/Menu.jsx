// Equivale a menu/menu.ts + menu.html de Angular.
import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { logout } from '../../services/authService.js'
import './Menu.css'

// En Angular: routerLinkActive="is-active". En React, NavLink nos dice si la ruta está activa.
function claseNav({ isActive }) {
  return isActive ? 'nav-item is-active' : 'nav-item'
}

export default function Menu() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const navigate = useNavigate()

  // [AUTH REACT] Invalida JSESSIONID y vuelve al login de React.
  async function onLogout() {
    if (isLoggingOut) {
      return
    }

    setIsLoggingOut(true)
    try {
      await logout()
    } catch (error) {
      console.error('[AUTH REACT] No se pudo confirmar el cierre de sesión.', error)
    }
    navigate('/login')
  }

  return (
    // [AUTH REACT] Esta es la interfaz React destino después del login.
    <div className="app-shell">
      <aside className="sidebar" aria-label="Navegación principal">
        <div className="sidebar-brand">
          <div className="brand-mark" aria-hidden="true">O</div>
          <div>
            <strong>ODIN</strong>
            <span>Gestor documental</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Navegación principal">
          <p className="nav-label">MENÚ PRINCIPAL</p>
          <NavLink className={claseNav} to="/menu/radicacion" aria-label="Radicación">
            <span className="nav-icon" aria-hidden="true">⌂</span>
            <span>Radicación</span>
          </NavLink>
          <NavLink className={claseNav} to="/menu/consultaseguimiento" aria-label="Consulta y seguimiento">
            <span className="nav-icon" aria-hidden="true">⌕</span>
            <span>Consulta y seguimiento</span>
          </NavLink>
          <NavLink className={claseNav} to="/menu/gestiontramites" aria-label="Gestión de trámites">
            <span className="nav-icon" aria-hidden="true">▣</span>
            <span>Gestión de trámites</span>
          </NavLink>
          <NavLink className={claseNav} to="/menu/gestionusuarios" aria-label="Gestión de usuarios">
            <span className="nav-icon" aria-hidden="true">♙</span>
            <span>Gestión de usuarios</span>
          </NavLink>
          <p className="nav-label section-label">SISTEMA</p>
          <button className="nav-item nav-button" type="button">
            <span className="nav-icon" aria-hidden="true">⚙</span>
            <span>Configuración</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-avatar" aria-hidden="true">U</div>
          <div className="user-info">
            <strong>Usuario ODIN</strong>
            <span>Sesión activa</span>
          </div>
          {/* [AUTH REACT] Botón de cierre de sesión del menú. */}
          <button
            className="logout-button"
            type="button"
            aria-label="Cerrar sesión"
            onClick={onLogout}
            disabled={isLoggingOut}
          >
            <span aria-hidden="true">↪</span>
            <span>{isLoggingOut ? 'Saliendo...' : 'Salir'}</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">ESPACIO DE TRABAJO</p>
            <h1>Panel principal</h1>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" type="button" aria-label="Notificaciones">♧</button>
            <div className="topbar-user">Usuario</div>
          </div>
        </header>

        <section className="content-area">
          {/* En Angular: <router-outlet>. Aquí se dibuja el módulo de la ruta hija. */}
          <div className="module-card">
            <Outlet />
          </div>
        </section>
      </main>
    </div>
  )
}
