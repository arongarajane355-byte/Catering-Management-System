import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Utensils, Calendar, Truck, Wine, Package, ChevronRight,
  Sparkles, UtensilsCrossed, ArrowRight, Star, UserPlus,
  X, CheckCircle2, AlertCircle, Eye, EyeOff, Copy, Check
} from 'lucide-react';

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

// ---------- REGISTRATION MODAL ----------
const RegistrationModal = ({ onClose }) => {
  const [customerNo] = useState(() => `CUST-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [form, setForm] = useState({
    lastname: '',
    middlename: '',
    firstname: '',
    gender: 'Male',
    age: '',
    contact_number: '',
    email: '',
  });
  const [emailManual, setEmailManual] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null); // { customer_no, email }
  const [error, setError] = useState('');

  // Auto-generate email from firstname + lastname
  useEffect(() => {
    if (!emailManual) {
      const fn = form.firstname.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const ln = form.lastname.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      if (fn || ln) {
        const generated = fn && ln ? `${fn}.${ln}@gmail.com` : fn ? `${fn}@gmail.com` : `${ln}@gmail.com`;
        setForm(prev => ({ ...prev, email: generated }));
      } else {
        setForm(prev => ({ ...prev, email: '' }));
      }
    }
  }, [form.firstname, form.lastname, emailManual]);

  const handleChange = (field, value) => {
    if (field === 'contact_number') {
      const numeric = value.replace(/\D/g, '').slice(0, 11);
      setForm(prev => ({ ...prev, [field]: numeric }));
    } else {
      setForm(prev => ({ ...prev, [field]: value }));
    }
    setError('');
  };

  const handleEmailChange = (value) => {
    setEmailManual(true);
    setForm(prev => ({ ...prev, email: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const fn = form.firstname.trim();
    const ln = form.lastname.trim();
    const contact = form.contact_number.trim();
    const email = form.email.trim().toLowerCase();
    const ageVal = parseInt(form.age, 10);

    if (!fn || !ln || !contact || !email || isNaN(ageVal)) {
      setError('Please fill in all required fields (First Name, Last Name, Gender, Age, Contact No., and Email).');
      return;
    }

    if (!email.endsWith('@gmail.com')) {
      setError('Email address must use @gmail.com (e.g. user@gmail.com).');
      return;
    }

    if (contact.length !== 11 || !/^\d{11}$/.test(contact)) {
      setError('Contact No. must be exactly 11 digits (e.g. 09123456789).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/auth/register', {
        customer_no: customerNo,
        firstname: fn,
        middlename: form.middlename.trim() || null,
        lastname: ln,
        gender: form.gender,
        age: ageVal,
        contact_number: contact,
        email: email,
      });
      setSuccessData({
        customer_no: res.data.customer_no || customerNo,
        email: email
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }}>
      <div
        className="modal-box"
        style={{
          maxWidth: 600,
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 'var(--r-xl)',
          border: '1px solid var(--border)',
        }}
      >
        {/* Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: 38, height: 38, borderRadius: 'var(--r-lg)',
              background: 'var(--brand-dim)', color: 'var(--brand)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <UserPlus size={18} />
            </div>
            <div>
              <h3 className="modal-title" style={{ margin: 0 }}>Customer Registration</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Fill in your details — your account will be activated by admin.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon" id="reg-modal-close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ paddingTop: '1.5rem' }}>
          {/* Success State */}
          {successData ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{
                width: 68, height: 68, borderRadius: '50%',
                background: 'var(--success-dim, rgba(34,197,94,0.12))',
                color: 'var(--success, #22c55e)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.25rem',
                border: '2px solid var(--success, #22c55e)'
              }}>
                <CheckCircle2 size={32} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.75rem' }}>
                Registration Submitted!
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: 400, margin: '0 auto 1.5rem' }}>
                Your registration is pending admin approval. Once verified, our staff will provide you with your login credentials.
              </p>
              <div style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-lg)', padding: '1rem', marginBottom: '1.5rem',
                textAlign: 'left', fontSize: '0.85rem'
              }}>
                <div style={{ marginBottom: '0.4rem' }}>
                  <strong style={{ color: 'var(--text-secondary)' }}>Customer No.:</strong>{' '}
                  <span style={{ color: 'var(--brand)', fontWeight: 700 }}>{successData.customer_no}</span>
                </div>
                <div style={{ marginBottom: '0.4rem' }}>
                  <strong style={{ color: 'var(--text-secondary)' }}>Registered Email:</strong>{' '}
                  <span style={{ color: 'var(--brand)' }}>{successData.email}</span>
                </div>
                <div style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  📞 Please wait for admin confirmation.
                </div>
              </div>
              <button onClick={onClose} className="btn btn-primary">
                Close <X size={14} />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} id="customer-register-form">
              {error && (
                <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
                  <AlertCircle size={15} />
                  <span>{error}</span>
                </div>
              )}

              {/* Customer No. — auto-generated & visible read-only */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-customer-no">
                  Customer No.{' '}
                  <span style={{
                    fontSize: '0.72rem', color: 'var(--brand)',
                    background: 'var(--brand-dim)', padding: '1px 6px',
                    borderRadius: 4, fontWeight: 600
                  }}>
                    Auto-generated
                  </span>
                </label>
                <input
                  id="reg-customer-no"
                  type="text"
                  className="form-input"
                  value={customerNo}
                  readOnly
                  style={{
                    fontWeight: 700,
                    color: 'var(--brand)',
                    letterSpacing: '0.05em',
                    background: 'var(--bg-elevated)',
                    cursor: 'not-allowed'
                  }}
                />
              </div>

              <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
                {/* Lastname */}
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-lastname">
                    Last Name <span style={{ color: 'var(--danger, #ef4444)' }}>*</span>
                  </label>
                  <input
                    id="reg-lastname"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Dela Cruz"
                    value={form.lastname}
                    onChange={e => handleChange('lastname', e.target.value)}
                    required
                    autoComplete="family-name"
                  />
                </div>

                {/* Firstname */}
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-firstname">
                    First Name <span style={{ color: 'var(--danger, #ef4444)' }}>*</span>
                  </label>
                  <input
                    id="reg-firstname"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Maria"
                    value={form.firstname}
                    onChange={e => handleChange('firstname', e.target.value)}
                    required
                    autoComplete="given-name"
                  />
                </div>
              </div>

              {/* Middlename */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-middlename">
                  Middle Name <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(Optional)</span>
                </label>
                <input
                  id="reg-middlename"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Santos"
                  value={form.middlename}
                  onChange={e => handleChange('middlename', e.target.value)}
                  autoComplete="additional-name"
                />
              </div>

              <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
                {/* Gender */}
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-gender">
                    Gender <span style={{ color: 'var(--danger, #ef4444)' }}>*</span>
                  </label>
                  <select
                    id="reg-gender"
                    className="form-select"
                    value={form.gender}
                    onChange={e => handleChange('gender', e.target.value)}
                    required
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Age */}
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-age">
                    Age <span style={{ color: 'var(--danger, #ef4444)' }}>*</span>
                  </label>
                  <input
                    id="reg-age"
                    type="number"
                    className="form-input"
                    placeholder="e.g. 25"
                    min={1}
                    max={120}
                    value={form.age}
                    onChange={e => handleChange('age', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Contact Number */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-contact">
                  Contact No. <span style={{ color: 'var(--danger, #ef4444)' }}>*</span>
                </label>
                <input
                  id="reg-contact"
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  pattern="[0-9]{11}"
                  className="form-input"
                  placeholder="e.g. 09123456789 (11 digits)"
                  value={form.contact_number}
                  onChange={e => handleChange('contact_number', e.target.value)}
                  required
                />
              </div>

              {/* Email — auto-generated, editable */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">
                  Email Address{' '}
                  <span style={{
                    fontSize: '0.72rem', color: 'var(--brand)',
                    background: 'var(--brand-dim)', padding: '1px 6px',
                    borderRadius: 4, fontWeight: 500
                  }}>
                    Auto-generated
                  </span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reg-email"
                    type="email"
                    className="form-input"
                    placeholder="Will auto-fill from your name"
                    value={form.email}
                    onChange={e => handleEmailChange(e.target.value)}
                    required
                    style={{ paddingRight: emailManual ? '3rem' : undefined }}
                  />
                  {emailManual && (
                    <button
                      type="button"
                      title="Reset to auto-generated email"
                      onClick={() => { setEmailManual(false); }}
                      style={{
                        position: 'absolute', right: '0.75rem', top: '50%',
                        transform: 'translateY(-50%)', background: 'none',
                        border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                        fontSize: '0.72rem', fontWeight: 600
                      }}
                    >
                      Reset
                    </button>
                  )}
                </div>
                <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                  Auto-filled as <strong>firstname.lastname@gmail.com</strong>. You may edit it if needed.
                </p>
              </div>

              {/* Footer */}
              <div className="modal-footer" style={{ padding: '1.25rem 0 0', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={onClose} className="btn btn-secondary" disabled={submitting}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  id="reg-submit-btn"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>Submitting…</>
                  ) : (
                    <><UserPlus size={15} /> Submit Registration</>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------- LANDING PAGE ----------
const LandingPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegModal, setShowRegModal] = useState(false);
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
      {/* Registration Modal */}
      {showRegModal && <RegistrationModal onClose={() => setShowRegModal(false)} />}

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
            <>
              <button
                id="nav-register-btn"
                onClick={() => setShowRegModal(true)}
                className="btn btn-secondary btn-sm"
              >
                <UserPlus size={14} /> Register
              </button>
              <Link to="/login" className="btn btn-primary btn-sm">
                Sign In <ArrowRight size={14} />
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────── */}
      <section className="hero-section">
        <div className="hero-tag">
          <Sparkles size={13} />
          Premier Catering &amp; Event Services
        </div>

        <h1 className="hero-title">
          Exquisite Culinary Experiences &amp;{' '}
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
            <button
              id="hero-register-btn"
              onClick={() => setShowRegModal(true)}
              className="btn btn-primary btn-lg"
            >
              <UserPlus size={18} />
              Register Now
            </button>
          )}
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
                    {cat.services.map((service) => {
                      const fallbackImg = 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&q=80';
                      const serviceImg = service.image_url && service.image_url.trim() !== '' ? service.image_url : fallbackImg;
                      return (
                        <div key={service.service_id} className="service-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                          {/* Photo Banner */}
                          <div style={{
                            position: 'relative',
                            height: 170,
                            width: '100%',
                            overflow: 'hidden',
                            background: 'var(--bg-elevated)'
                          }}>
                            <img
                              src={serviceImg}
                              alt={service.service_name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = fallbackImg;
                              }}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'transform 0.4s ease'
                              }}
                            />
                            <div style={{
                              position: 'absolute',
                              inset: 0,
                              background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, transparent 60%)'
                            }} />
                            <span className="badge badge-active" style={{
                              position: 'absolute',
                              top: '0.625rem',
                              right: '0.625rem',
                              backdropFilter: 'blur(6px)',
                              background: 'rgba(0,0,0,0.55)',
                              borderColor: 'rgba(34,197,94,0.4)',
                              fontSize: '0.7rem'
                            }}>
                              Active
                            </span>
                            <div style={{
                              position: 'absolute',
                              bottom: '0.625rem',
                              left: '0.875rem',
                              right: '0.875rem'
                            }}>
                              <h4 style={{
                                fontSize: '0.98rem', fontWeight: 700,
                                color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.6)',
                                margin: 0, lineHeight: 1.3
                              }}>
                                {service.service_name}
                              </h4>
                            </div>
                          </div>

                          {/* Card Content Body */}
                          <div style={{ padding: '1rem 1.125rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.75rem' }}>
                            {service.service_description && (
                              <p style={{
                                fontSize: '0.8rem', color: 'var(--text-muted)',
                                lineHeight: 1.5, minHeight: 36, margin: 0
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
                                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.1rem' }}>
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
                                  if (!user) setShowRegModal(true);
                                  else if (user.role === 'customer') navigate('/customer');
                                  else navigate(`/${user.role}`);
                                }}
                                className="btn btn-secondary btn-sm"
                              >
                                Book <ChevronRight size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
        background: 'var(--bg-elevated)',
        padding: '3rem 2rem 2rem',
        color: 'var(--text-muted)',
        fontSize: '0.85rem'
      }}>
        <div style={{
          maxWidth: 960,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          marginBottom: '2.5rem'
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <UtensilsCrossed size={18} style={{ color: 'var(--brand)' }} />
              <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>CaterMS</span>
            </div>
            <p style={{ lineHeight: 1.7, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Your premier catering partner for every occasion — from intimate gatherings to grand celebrations.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.875rem', fontSize: '0.9rem' }}>
              Contact Us
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ color: 'var(--brand)', flexShrink: 0 }}>📞</span>
                <span>+63 912 345 6789</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ color: 'var(--brand)', flexShrink: 0 }}>✉️</span>
                <a href="mailto:support@caterms.com" style={{ color: 'var(--brand)', textDecoration: 'none' }}>
                  support@caterms.com
                </a>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ color: 'var(--brand)', flexShrink: 0 }}>📍</span>
                <span>123 Fiesta Avenue, Quezon City, Metro Manila, Philippines</span>
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div>
            <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.875rem', fontSize: '0.9rem' }}>
              Business Hours
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <li style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <span>Monday – Friday</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>8:00 AM – 6:00 PM</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <span>Saturday</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>9:00 AM – 5:00 PM</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <span>Sunday</span>
                <span style={{ color: 'var(--amber)', fontWeight: 600 }}>By Appointment</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '1.25rem',
          textAlign: 'center',
          fontSize: '0.78rem',
          color: 'var(--text-muted)'
        }}>
          © {new Date().getFullYear()} Catering Management System. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
