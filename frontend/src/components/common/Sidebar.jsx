import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  UtensilsCrossed, LayoutDashboard, Calendar, UserCheck, Settings,
  Users, ShieldCheck, ShoppingBag, BarChart3, LogOut, Layers
} from 'lucide-react';
import cmsLogo from '../../assets/cms_logo.png';

const navsByRole = {
  customer: [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'bookings', label: 'My Bookings', icon: Calendar },
    { key: 'profile', label: 'Profile Settings', icon: Settings },
  ],
  staff: [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'bookings', label: 'Bookings Queue', icon: Calendar },
    { key: 'add_customer', label: 'Add Customer', icon: Users },
    { key: 'encoded_list', label: 'Verification Tracker', icon: UserCheck },
    { key: 'financial', label: 'Financial Report', icon: BarChart3 },
    { key: 'profile', label: 'Profile Settings', icon: Settings },
  ],
  admin: [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'reports', label: 'Reports & Monitoring', icon: BarChart3 },
    { key: 'verifications', label: 'Verifications', icon: ShieldCheck },
    { key: 'users', label: 'Users Management', icon: Users },
    { key: 'services', label: 'Service Catalog', icon: ShoppingBag },
    { key: 'profile', label: 'Profile Settings', icon: Settings },
  ],
};

const roleColors = {
  admin: { bg: 'var(--brand-dim)', color: 'var(--brand)' },
  staff: { bg: 'var(--info-dim)', color: 'var(--info)' },
  customer: { bg: 'var(--success-dim)', color: 'var(--success)' },
};

const Sidebar = ({ activeTab, setActiveTab, pageTitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = navsByRole[user?.role] || [];
  const roleStyle = roleColors[user?.role] || roleColors.customer;

  const initials = user
    ? `${user.firstname?.[0] || ''}${user.lastname?.[0] || ''}`.toUpperCase()
    : '?';

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <img
            src={cmsLogo}
            alt="CMS Logo"
            style={{
              width: 32, height: 32,
              objectFit: 'cover'
            }}
          />
        </div>
        <div>
          <div className="sidebar-logo-text">CaterMS</div>
          <div className="sidebar-logo-sub">Management System</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">
          {user?.role === 'admin' ? 'Administration' : user?.role === 'staff' ? 'Operations' : 'My Account'}
        </div>

        {links.map((link) => {
          const Icon = link.icon;
          const isActive = activeTab === link.key;
          return (
            <button
              key={link.key}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(link.key)}
            >
              <Icon size={18} className="sidebar-link-icon" />
              {link.label}
            </button>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="sidebar-footer">
        {/* Role chip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 0.625rem',
          background: roleStyle.bg,
          borderRadius: 'var(--r-md)',
          marginBottom: '0.5rem',
          fontSize: '0.72rem',
          fontWeight: '600',
          color: roleStyle.color,
          textTransform: 'capitalize',
        }}>
          <Layers size={13} />
          {user?.role} Portal
        </div>

        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.firstname} {user?.lastname}</div>
            <div className="sidebar-user-role">{user?.email}</div>
          </div>
        </div>

        <button
          className="sidebar-link"
          onClick={handleLogout}
          style={{ marginTop: '0.25rem', color: 'var(--danger)', width: '100%' }}
        >
          <LogOut size={16} className="sidebar-link-icon" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
