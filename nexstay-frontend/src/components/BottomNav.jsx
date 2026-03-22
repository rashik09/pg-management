import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Heart, User } from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' && location.hash !== '#search';
    if (path === '/#search') return location.pathname === '/' && location.hash === '#search';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bottom-nav">
      <Link to="/" className={`bottom-nav-item ${isActive('/') ? 'active' : ''}`}>
        <Home />
        <span>Home</span>
      </Link>
      <Link to="/#search" className={`bottom-nav-item ${isActive('/#search') ? 'active' : ''}`} onClick={() => {
          if (location.pathname === '/') {
              document.getElementById('search')?.scrollIntoView({behavior: 'smooth'});
          }
      }}>
        <Search />
        <span>Search</span>
      </Link>
      <Link to="/dashboard" className={`bottom-nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
        <Heart />
        <span>Saved</span>
      </Link>
      <Link to="/profile" className={`bottom-nav-item ${isActive('/profile') ? 'active' : ''}`}>
        <User />
        <span>Profile</span>
      </Link>
    </nav>
  );
}
