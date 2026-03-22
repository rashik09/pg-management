import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, LayoutGrid, Heart, LayoutDashboard, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isOwner, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar glass ${scrolled ? 'scrolled' : ''}`} id="mainNav">
      <div className="nav-container">
        <Link to="/" className="logo">
          <div className="logo-icon-wrap">
            <Home />
          </div>
          <span>Nex<span style={{color: 'var(--accent)'}}>Stay</span></span>
        </Link>
        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
            <LayoutGrid size={16} /> Explore
          </Link>
          
          {user ? (
            <>
              {isOwner ? (
                <Link to="/admin" className="nav-link" onClick={() => setMenuOpen(false)}>
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
              ) : (
                <Link to="/dashboard" className="nav-link" onClick={() => setMenuOpen(false)}>
                  <Heart size={16} /> My Bookings
                </Link>
              )}
              <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.5rem'}}>
                <div className="user-pill">
                  <div className="user-avatar">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
                  <span>{user.name || 'User'}</span>
                </div>
                <button className="btn btn-ghost" style={{color: 'var(--text-muted)', fontSize: '0.85rem'}} onClick={() => { setMenuOpen(false); logout(); }}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary" onClick={() => setMenuOpen(false)}>
              Sign In
            </Link>
          )}
        </div>
        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>
    </nav>
  );
}
