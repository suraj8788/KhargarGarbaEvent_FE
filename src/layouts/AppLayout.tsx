import { NavLink, Outlet } from 'react-router'
import goddessLogo from '../assets/images/Goddess Logo Transparent.png'
import { ROUTES } from '../constants/routes'

export default function AppLayout() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-glow" aria-hidden="true" />
        <NavLink className="brand" to={ROUTES.registration} aria-label="Kharghar Garba Raas home">
          <img className="brand-logo" src={goddessLogo} alt="Kharghar Garba Raas 2026" />
        </NavLink>
        <div className="header-event">
          <span><b>✦</b> KHARGHAR NAVRATRI MAHOTSAV <b>✦</b></span>
          <small>11th–19th · 7 PM onwards</small>
        </div>
        <nav className="site-nav" aria-label="Main navigation">
          <NavLink to={ROUTES.registration} end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <span aria-hidden="true">✦</span> Register Now <b aria-hidden="true">→</b>
          </NavLink>
        </nav>
        <div className="header-garland" aria-hidden="true" />
      </header>
      <Outlet />
    </div>
  )
}
