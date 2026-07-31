import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Utensils, Calendar, Truck, Wine, Package, ChevronRight,
  Sparkles, UtensilsCrossed, ArrowRight, Star
} from 'lucide-react';
import cmsLogo from '../../assets/cms_logo.png';

const getCategoryIcon = (name) => {
  if (name.includes('Catering')) return <Utensils size={22} />;
  if (name.includes('Delivery')) return <Truck size={22} />;
  if (name.includes('Dessert')) return <Wine size={22} />;
  return <Package size={22} />;
};

const categoryAccents = [
  { bg: 'var(--brand-dim)', color: 'var(--brand)' },
  { bg: 'var(--info-dim)', color: 'var(--info)' },
  { bg: 'var(--purple-dim)', color: 'var(--purple)' },
  { bg: 'var(--amber-dim)', color: 'var(--amber)' },
];

const LandingPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services/grouped');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* ── NAV BAR ─────────────────────────────────── */}
      <nav className="pub-nav">
        <div className="pub-nav-logo">
          <img
            src="src/assets/cms_logo.png"
            alt="CMS Logo"
            style={{
              width: 32, height: 32, borderRadius: 8,
              objectFit: 'cover'
            }}
          />
          CaterMS
        </div>
        <div className="pub-nav-links">
          <a href="#catalog" className="pub-nav-link">Services</a>
          {user ? (
            <button
              onClick={() => navigate(`/${user.role}`)}
              className="btn btn-primary btn-sm"
            >
              Dashboard <ArrowRight size={14} />
            </button>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              Sign In <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────── */}
      <section className="hero-section">
        <div className="hero-tag">
          <Sparkles size={13} />
          Premier Catering & Event Services
        </div>

        <h1 className="hero-title">
          Exquisite Culinary Experiences &{' '}
          <span>Seamless Event Logistics</span>
        </h1>

        <p className="hero-desc">
          From intimate birthday gatherings to grandiose wedding celebrations and full
          equipment rentals. Browse our tailored services and request catering reservations.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.875rem', flexWrap: 'wrap' }}>
          {user ? (
            <button
              onClick={() => navigate(`/${user.role}`)}
              className="btn btn-primary btn-lg"
            >
              <Calendar size={18} />
              Go to Dashboard
            </button>
          ) : (
            <Link to="/login" className="btn btn-primary btn-lg">
              <Calendar size={18} />
              Book an Event
            </Link>
          )}
          <a href="#catalog" className="btn btn-secondary btn-lg">
            View Services <ChevronRight size={16} />
          </a>
        </div>

        {/* Trust badges */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '2rem',
          marginTop: '3.5rem', flexWrap: 'wrap'
        }}>
          {[
            { icon: <Star size={14} />, text: 'Premium Catering' },
            { icon: <Truck size={14} />, text: 'On-Site Delivery' },
            { icon: <Calendar size={14} />, text: 'Easy Booking' },
          ].map(({ icon, text }) => (
            <div key={text} style={{
              display: 'flex', alignItems: 'center', gap: '0.45rem',
              fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500
            }}>
              <span style={{ color: 'var(--brand)' }}>{icon}</span>
              {text}
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICE CATALOG ─────────────────────────── */}
      <section id="catalog" className="catalog-section">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem,3vw,2.25rem)',
            fontWeight: 800, marginBottom: '0.625rem'
          }}>
            Our Service Catalog
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Explore categories, packages, and equipment rental solutions
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <div style={{ animation: 'pulse 1.5s infinite' }}>Loading catalog…</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {categories.map((cat, ci) => {
              const accent = categoryAccents[ci % categoryAccents.length];
              return (
                <div key={cat.category_id}>
                  {/* Category header */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.875rem',
                    marginBottom: '1.25rem'
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 'var(--r-lg)',
                      background: accent.bg, color: accent.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {getCategoryIcon(cat.category_name)}
                    </div>
                    <div>
                      <h3 style={{
                        fontFamily: 'var(--font-display)', fontSize: '1.2rem',
                        fontWeight: 700, color: 'var(--text-primary)'
                      }}>
                        {cat.category_name}
                      </h3>
                      {cat.category_description && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                          {cat.category_description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Services grid */}
                  <div className="catalog-grid">
                    {cat.services.map((service) => (
                      <div key={service.service_id} className="service-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h4 style={{
                            fontSize: '0.95rem', fontWeight: 600,
                            color: 'var(--text-primary)', flex: 1, marginRight: '0.5rem'
                          }}>
                            {service.service_name}
                          </h4>
                          <span className="badge badge-active" style={{ flexShrink: 0 }}>Active</span>
                        </div>

                        {service.service_description && (
                          <p style={{
                            fontSize: '0.8rem', color: 'var(--text-muted)',
                            lineHeight: 1.5, minHeight: 36
                          }}>
                            {service.service_description}
                          </p>
                        )}

                        <div style={{
                          display: 'flex', justifyContent: 'space-between',
                          alignItems: 'center', borderTop: '1px solid var(--border)',
                          paddingTop: '0.875rem', marginTop: 'auto'
                        }}>
                          <div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.1rem' }}>
                              Base Price
                            </div>
                            <strong style={{ fontSize: '1.1rem', color: 'var(--amber)' }}>
                              ₱{service.base_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </strong>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>
                              /{service.unit}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              if (!user) navigate('/login');
                              else if (user.role === 'customer') navigate('/customer');
                              else navigate(`/${user.role}`);
                            }}
                            className="btn btn-secondary btn-sm"
                          >
                            Book <ChevronRight size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── FOOTER ──────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.8rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <UtensilsCrossed size={14} style={{ color: 'var(--brand)' }} />
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>CaterMS</span>
        </div>
        © {new Date().getFullYear()} Catering Management System. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
