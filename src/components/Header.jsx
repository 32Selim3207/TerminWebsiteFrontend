import { NavLink, Link } from 'react-router-dom';

export default function Header() {
  const navClass = ({ isActive }) =>
    isActive ? 'nav-link is-active' : 'nav-link';

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand" style={{ textDecoration: 'none' }}>
          <span className="brand-badge">
            <svg><use href="#icon-wrench" /></svg>
          </span>
          <span className="brand-name">AutoTermin</span>
        </Link>

        <nav className="main-nav">
          <NavLink to="/" end className={navClass}>Werkstätten</NavLink>
          <NavLink to="/manage" className={navClass}>Termin verwalten</NavLink>
        </nav>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/admin/login" className="staff-link" style={{ textDecoration: 'none' }}>
            Werkstatt-Login
          </Link>
          <Link to="/werkstatt/register" className="btn btn-accent btn-sm" style={{ textDecoration: 'none' }}>
            Werkstatt registrieren
          </Link>
        </div>
      </div>
    </header>
  );
}