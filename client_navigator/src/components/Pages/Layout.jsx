import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, LogIn } from 'lucide-react';
import './Layout.css';

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const [userInitials, setUserInitials] = useState(null);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user.username) {
          const initials = user.username.substring(0, 2).toUpperCase();
          setUserInitials(initials);
        }
      }
    } catch(e) { }
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleLoginRedirect = () => {
    const currentUrl = window.location.href;
    window.location.href = `/marketplace/login?redirect=${encodeURIComponent(currentUrl)}`;
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-title">Navigator</div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {userInitials ? (
            <Link to="/account" className="account-initials-circle">
              {userInitials}
            </Link>
          ) : (
            <button className="login-btn-header" onClick={handleLoginRedirect} title="Login">
              <LogIn size={20} /> Login
            </button>
          )}

          <button className="menu-button" onClick={toggleMenu} aria-label="Toggle menu">
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

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
                <Link to="/account" onClick={toggleMenu} className={location.pathname === '/account' ? 'active' : ''}>
                  Account
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