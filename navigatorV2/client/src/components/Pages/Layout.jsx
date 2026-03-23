import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import './Layout.css';

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-title">Navigator</div>
        <button className="menu-button" onClick={toggleMenu} aria-label="Toggle menu">
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {menuOpen && (
          <nav className="popup-menu">
            <ul>
              <li>
                <Link to="/" onClick={toggleMenu} className={location.pathname === '/' ? 'active' : ''}>
                  Map
                </Link>
              </li>
              <li>
                <Link to="/my-visits" onClick={toggleMenu} className={location.pathname === '/my-visits' ? 'active' : ''}>
                  My Visits
                </Link>
              </li>
              <li>
                <a href="/marketplace" onClick={toggleMenu}>
                  Marketplace
                </a>
              </li>
              <li>
                <Link to="/about" onClick={toggleMenu} className={location.pathname === '/about' ? 'active' : ''}>
                  About Us
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}