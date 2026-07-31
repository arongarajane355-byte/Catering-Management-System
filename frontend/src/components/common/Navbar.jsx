import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UtensilsCrossed, LogOut, User, LayoutDashboard, Shield, ClipboardList } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'staff') return '/staff';
    return '/customer';
  };

  return (
    <nav className="navbar">
      <div className="nav-content">
        <Link to="/" className="brand-logo">
          <UtensilsCrossed size={28} style={{ color: '#ea580c' }} />
          <span>FeastCraft CMS</span>
        </Link>

        <div className="nav-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Services & Packages
          </Link>

          {user ? (
            <>
              <Link to={getDashboardLink()} className="nav-link active" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <LayoutDashboard size={16} />
                Dashboard ({user.role})
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Hi, <strong>{user.firstname}</strong>
                </span>
                <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary">
              System Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
