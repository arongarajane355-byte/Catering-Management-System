import React from 'react';
import { UtensilsCrossed, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-color)',
      padding: '2rem 1.5rem',
      background: 'rgba(15, 23, 42, 0.9)',
      marginTop: 'auto',
      textAlign: 'center',
      color: 'var(--text-muted)',
      fontSize: '0.85rem'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', color: 'var(--text-main)' }}>
          <UtensilsCrossed size={20} style={{ color: '#ea580c' }} />
          <span>FeastCraft Catering Management System</span>
        </div>
        <p>Premium Catering, Event Logistics, Equipment Rental & Operations Management</p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
          © {new Date().getFullYear()} CMS. Built with React & Node.js
        </p>
      </div>
    </footer>
  );
};

export default Footer;
