import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Sidebar from '../../components/common/Sidebar';
import ProfileSettings from '../../components/common/ProfileSettings';
import {
  UserPlus, Clock, Calendar, CheckSquare, DollarSign, Eye, EyeOff,
  CheckCircle2, ShieldAlert, X, AlertCircle, Search, ChevronLeft, ChevronRight,
  ShieldCheck, Copy, KeyRound, BarChart3, Receipt, CreditCard
} from 'lucide-react';

// ---------- ADD CUSTOMER MODAL & FORM (SAME DESIGN & LOGIC AS LANDINGPAGE REGISTRATION MODAL) ----------
const AddCustomerFormContent = ({ onCancel, onSuccess, isModal = false }) => {
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
      setError('Please fill in all required customer fields (First Name, Last Name, Gender, Age, Contact No., and Email).');
      return;
    }

    if (!email.endsWith('@gmail.com')) {
      setError('Customer email address must use @gmail.com (e.g. name@gmail.com).');
      return;
    }

    if (contact.length !== 11 || !/^\d{11}$/.test(contact)) {
      setError('Contact No. must be exactly 11 digits (e.g. 09123456789).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/staff/customers', {
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
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to encode customer account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
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
            Customer Account Encoded!
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: 400, margin: '0 auto 1.5rem' }}>
            Customer profile successfully created and routed to Admin for verification and password generation.
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
              ⏳ Status: <strong>Pending Admin Verification</strong>
            </div>
          </div>
          <button
            onClick={() => {
              if (onCancel) onCancel();
              else { setSuccessData(null); setForm({ lastname: '', middlename: '', firstname: '', gender: 'Male', age: '', contact_number: '', email: '' }); }
            }}
            className="btn btn-primary"
          >
            {isModal ? 'Done — Close' : 'Encode Another Customer'}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} id="staff-add-customer-form">
          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Customer No. — auto-generated & visible read-only */}
          <div className="form-group">
            <label className="form-label" htmlFor="staff-cust-no">
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
              id="staff-cust-no"
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
              <label className="form-label" htmlFor="staff-lastname">
                Last Name <span style={{ color: 'var(--danger, #ef4444)' }}>*</span>
              </label>
              <input
                id="staff-lastname"
                type="text"
                className="form-input"
                placeholder="e.g. Dela Cruz"
                value={form.lastname}
                onChange={e => handleChange('lastname', e.target.value)}
                required
              />
            </div>

            {/* Firstname */}
            <div className="form-group">
              <label className="form-label" htmlFor="staff-firstname">
                First Name <span style={{ color: 'var(--danger, #ef4444)' }}>*</span>
              </label>
              <input
                id="staff-firstname"
                type="text"
                className="form-input"
                placeholder="e.g. Maria"
                value={form.firstname}
                onChange={e => handleChange('firstname', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Middlename */}
          <div className="form-group">
            <label className="form-label" htmlFor="staff-middlename">
              Middle Name <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(Optional)</span>
            </label>
            <input
              id="staff-middlename"
              type="text"
              className="form-input"
              placeholder="e.g. Santos"
              value={form.middlename}
              onChange={e => handleChange('middlename', e.target.value)}
            />
          </div>

          <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
            {/* Gender */}
            <div className="form-group">
              <label className="form-label" htmlFor="staff-gender">
                Gender <span style={{ color: 'var(--danger, #ef4444)' }}>*</span>
              </label>
              <select
                id="staff-gender"
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
              <label className="form-label" htmlFor="staff-age">
                Age <span style={{ color: 'var(--danger, #ef4444)' }}>*</span>
              </label>
              <input
                id="staff-age"
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
            <label className="form-label" htmlFor="staff-contact">
              Contact No. <span style={{ color: 'var(--danger, #ef4444)' }}>*</span>
            </label>
            <input
              id="staff-contact"
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
            <label className="form-label" htmlFor="staff-email">
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
                id="staff-email"
                type="email"
                className="form-input"
                placeholder="Will auto-fill from customer name"
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
              Auto-filled as <strong>firstname.lastname@gmail.com</strong>.
            </p>
          </div>

          {/* Actions */}
          <div className="modal-footer" style={{ padding: '1.25rem 0 0', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            {onCancel && (
              <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={submitting}>
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>Submitting…</>
              ) : (
                <><UserPlus size={15} /> Encode Customer Account</>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

// ---------- MAIN STAFF DASHBOARD ----------
const StaffDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState({ pending_accounts: 0, assigned_bookings: 0, upcoming_events: [] });
  const [createdCustomers, setCreatedCustomers] = useState([]);
  const [bookingsQueue, setBookingsQueue] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);

  // Search / Filter / Pagination — Bookings Queue
  const [bqSearch, setBqSearch] = useState('');
  const [bqStatusFilter, setBqStatusFilter] = useState('all');
  const [bqPage, setBqPage] = useState(1);
  const BQ_PAGE_SIZE = 8;

  // Financial Report sub-tab
  const [finSubTab, setFinSubTab] = useState('billing');

  // Search / Filter / Pagination — Financial Billing
  const [bilSearch, setBilSearch] = useState('');
  const [bilStatusFilter, setBilStatusFilter] = useState('all');
  const [bilPage, setBilPage] = useState(1);
  const BIL_PAGE_SIZE = 8;

  // Search / Filter / Pagination — Financial Payments
  const [paySearch, setPaySearch] = useState('');
  const [payMethodFilter, setPayMethodFilter] = useState('all');
  const [payPage, setPayPage] = useState(1);
  const PAY_PAGE_SIZE = 8;

  // Search / Filter — Encoded Customers
  const [encSearch, setEncSearch] = useState('');
  const [encStatusFilter, setEncStatusFilter] = useState('all');

  // Record Payment Modal
  const [paymentModalBooking, setPaymentModalBooking] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount_paid: '',
    payment_method: 'cash',
    reference_no: ''
  });
  const [paymentMsg, setPaymentMsg] = useState('');

  // Verification Modal State
  const [verifyModalTarget, setVerifyModalTarget] = useState(null);
  const [verifyAction, setVerifyAction] = useState('approved');
  const [verifyRemarks, setVerifyRemarks] = useState('');
  const [verifyMsg, setVerifyMsg] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [pwdCopied, setPwdCopied] = useState(false);

  useEffect(() => {
    fetchStaffDashboard();
    fetchCreatedCustomers();
    fetchBookingsQueue();
    fetchPayments();
  }, []);

  const handleVerifyAccountSubmit = async (e) => {
    e.preventDefault();
    setVerifyMsg('');
    setGeneratedPassword('');
    setPwdCopied(false);

    try {
      const res = await api.post('/staff/verify-customer', {
        user_id: verifyModalTarget.user_id,
        action: verifyAction,
        remarks: verifyRemarks
      });

      setVerifyMsg(`Account successfully ${verifyAction}!`);
      if (res.data.generated_password) {
        setGeneratedPassword(res.data.generated_password);
      }
      if (verifyAction !== 'approved') {
        setTimeout(() => {
          setVerifyModalTarget(null);
          fetchCreatedCustomers();
          fetchStaffDashboard();
        }, 800);
      } else {
        fetchCreatedCustomers();
        fetchStaffDashboard();
      }
    } catch (err) {
      setVerifyMsg(err.response?.data?.message || 'Verification action failed.');
    }
  };

  const handleCopyPassword = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword).then(() => {
        setPwdCopied(true);
        setTimeout(() => setPwdCopied(false), 2500);
      });
    }
  };

  const fetchStaffDashboard = async () => {
    try {
      const res = await api.get('/staff/dashboard');
      setDashboardData(res.data);
    } catch (err) {
      console.error('Failed to load staff dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCreatedCustomers = async () => {
    try {
      const res = await api.get('/staff/customers');
      setCreatedCustomers(res.data);
    } catch (err) {
      console.error('Failed to fetch created customers', err);
    }
  };

  const fetchBookingsQueue = async () => {
    try {
      const res = await api.get('/bookings');
      setBookingsQueue(res.data);
    } catch (err) {
      console.error('Failed to load bookings queue', err);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await api.get('/payments');
      setPayments(res.data);
    } catch (err) {
      console.error('Failed to load payments', err);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
      fetchBookingsQueue();
      fetchStaffDashboard();
    } catch (err) {
      console.error('Failed to update booking status', err);
    }
  };

  const handleRecordPaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentMsg('');

    try {
      await api.post('/payments', {
        booking_id: paymentModalBooking.booking_id,
        amount_paid: paymentForm.amount_paid,
        payment_method: paymentForm.payment_method,
        reference_no: paymentForm.reference_no
      });
      setPaymentMsg('Payment successfully recorded!');
      setTimeout(() => {
        setPaymentModalBooking(null);
        fetchBookingsQueue();
      }, 1000);
    } catch (err) {
      setPaymentMsg(err.response?.data?.message || 'Failed to record payment.');
    }
  };

  return (
    <div className="app-shell">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-title">Staff Operations Portal</div>
        </header>

        <div className="page-content">
          {/* Tab: Overview */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Section Header */}
              <div className="section-header">
                <div>
                  <h1 className="section-title" style={{ fontSize: '1.5rem' }}>Staff Operations Overview</h1>
                  <p className="section-subtitle">Customer profiling, event logistics coordination, and payment processing</p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon stat-icon-amber"><Clock size={22} /></div>
                  <div>
                    <div className="stat-value">{dashboardData.pending_accounts}</div>
                    <div className="stat-label">Pending Verifications</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon stat-icon-orange"><Calendar size={22} /></div>
                  <div>
                    <div className="stat-value">{dashboardData.assigned_bookings}</div>
                    <div className="stat-label">Active / Queue Bookings</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon stat-icon-green"><CheckSquare size={22} /></div>
                  <div>
                    <div className="stat-value">{createdCustomers.length}</div>
                    <div className="stat-label">Customers Encoded</div>
                  </div>
                </div>
              </div>
              <div className="card p-6">
                <div className="section-header">
                  <div>
                    <h3 className="section-title">Active Event Orders Queue</h3>
                    <p className="section-subtitle">Overview of current catering reservations awaiting action</p>
                  </div>
                  <button onClick={() => setActiveTab('bookings')} className="btn btn-secondary btn-sm">
                    Full Bookings Queue ({bookingsQueue.length})
                  </button>
                </div>
                {bookingsQueue.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon"><Calendar size={24} /></div>
                    <div className="empty-title">No bookings in queue</div>
                    <div className="empty-desc">New customer bookings will appear here.</div>
                  </div>
                ) : (
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Booking ID</th>
                          <th>Customer</th>
                          <th>Contact</th>
                          <th>Event &amp; Date</th>
                          <th>Venue</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookingsQueue.slice(0, 5).map((b) => (
                          <tr key={b.booking_id}>
                            <td><strong>#BK-{b.booking_id}</strong></td>
                            <td>{b.customer_firstname} {b.customer_lastname}</td>
                            <td>{b.contact_number}</td>
                            <td>
                              <div><strong>{b.event_type}</strong></div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{new Date(b.event_date).toLocaleDateString()}</div>
                            </td>
                            <td style={{ fontSize: '0.85rem' }}>{b.venue_address}</td>
                            <td style={{ color: 'var(--amber)', fontWeight: '600' }}>
                              ₱{parseFloat(b.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                            <td>
                              <span className={`badge badge-${b.status}`}>
                                {b.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td>
                              <button
                                onClick={() => {
                                  setPaymentModalBooking(b);
                                  setPaymentForm({ amount_paid: '', payment_method: 'cash', reference_no: '' });
                                  setPaymentMsg('');
                                }}
                                className="btn btn-success btn-sm"
                              >
                                <DollarSign size={14} /> Pay
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="grid-2">
                <div className="card p-6">
                  <h3 className="section-title mb-2">Customer Profiling</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    Encode new customer accounts directly. Accounts are automatically queued for admin verification.
                  </p>
                  <button onClick={() => setShowAddCustomerModal(true)} className="btn btn-primary btn-sm">
                    <UserPlus size={16} /> Add Customer
                  </button>
                </div>

                <div className="card p-6">
                  <h3 className="section-title mb-2">Customer Verification Tracker</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    Track status of customer accounts encoded by staff awaiting admin approval.
                  </p>
                  <button onClick={() => setActiveTab('encoded_list')} className="btn btn-secondary btn-sm">
                    View Verification Tracker ({createdCustomers.length})
                  </button>
                </div>
              </div>
            </div>
          )}



          {/* Tab: Bookings Queue */}
          {activeTab === 'bookings' && (() => {
            const filteredBq = bookingsQueue.filter(b => {
              const matchSearch = `${b.customer_firstname} ${b.customer_lastname} BK-${b.booking_id}`.toLowerCase().includes(bqSearch.toLowerCase());
              const matchStatus = bqStatusFilter === 'all' || b.status === bqStatusFilter;
              return matchSearch && matchStatus;
            });
            const bqTotalPages = Math.max(1, Math.ceil(filteredBq.length / BQ_PAGE_SIZE));
            const bqPageSafe = Math.min(bqPage, bqTotalPages);
            const pagedBq = filteredBq.slice((bqPageSafe - 1) * BQ_PAGE_SIZE, bqPageSafe * BQ_PAGE_SIZE);
            return (
            <div className="card p-6">
              <div className="section-header">
                <h3 className="section-title">Catering &amp; Rental Orders Queue</h3>
              </div>
              {/* Search & Filter */}
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                  <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    className="form-input"
                    style={{ paddingLeft: '2.25rem' }}
                    placeholder="Search by customer name or booking ID…"
                    value={bqSearch}
                    onChange={e => { setBqSearch(e.target.value); setBqPage(1); }}
                  />
                </div>
                <select className="form-select" style={{ width: 'auto' }} value={bqStatusFilter} onChange={e => { setBqStatusFilter(e.target.value); setBqPage(1); }}>
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="on_the_way">On the Way</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Customer Name</th>
                      <th>Contact</th>
                      <th>Event Type &amp; Date</th>
                      <th>Venue</th>
                      <th>Total Amount</th>
                      <th>Status</th>
                      <th>Update Status</th>
                      <th>Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedBq.length === 0 ? (
                      <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No bookings found.</td></tr>
                    ) : pagedBq.map((b) => (
                      <tr key={b.booking_id}>
                        <td><strong>#BK-{b.booking_id}</strong></td>
                        <td>{b.customer_firstname} {b.customer_lastname}</td>
                        <td>{b.contact_number}</td>
                        <td>
                          <div><strong>{b.event_type}</strong></div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {new Date(b.event_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>{b.venue_address}</td>
                        <td style={{ color: 'var(--amber)', fontWeight: '600' }}>
                          ₱{parseFloat(b.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td>
                          <span className={`badge badge-${b.status}`}>
                            {b.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td>
                          <select
                            className="form-select"
                            style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                            value={b.status}
                            onChange={(e) => handleUpdateBookingStatus(b.booking_id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="preparing">Preparing</option>
                            <option value="on_the_way">On the Way</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td>
                          <button
                            onClick={() => {
                              setPaymentModalBooking(b);
                              setPaymentForm({ amount_paid: '', payment_method: 'cash', reference_no: '' });
                              setPaymentMsg('');
                            }}
                            className="btn btn-success btn-sm"
                          >
                            <DollarSign size={14} /> Record Payment
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {bqTotalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span>Showing {(bqPageSafe - 1) * BQ_PAGE_SIZE + 1}–{Math.min(bqPageSafe * BQ_PAGE_SIZE, filteredBq.length)} of {filteredBq.length} bookings</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setBqPage(p => Math.max(1, p - 1))} disabled={bqPageSafe === 1}><ChevronLeft size={16} /></button>
                    {Array.from({ length: bqTotalPages }, (_, i) => i + 1).map(pg => (
                      <button key={pg} onClick={() => setBqPage(pg)} className={`btn btn-sm ${pg === bqPageSafe ? 'btn-primary' : 'btn-ghost'}`}>{pg}</button>
                    ))}
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setBqPage(p => Math.min(bqTotalPages, p + 1))} disabled={bqPageSafe === bqTotalPages}><ChevronRight size={16} /></button>
                  </div>
                </div>
              )}
            </div>
            );
          })()}

          {/* Tab: Add Customer */}
          {activeTab === 'add_customer' && (
            <div className="card p-6" style={{ maxWidth: '650px' }}>
              <div className="section-header">
                <div>
                  <h3 className="section-title">Encode New Customer Account</h3>
                  <p className="section-subtitle">
                    New customer accounts are saved with status <strong>`pending`</strong> for Admin verification and password generation.
                  </p>
                </div>
              </div>

              <AddCustomerFormContent
                onSuccess={() => {
                  fetchCreatedCustomers();
                  fetchStaffDashboard();
                }}
              />
            </div>
          )}

          {/* Tab: Customer Verification Tracker */}
          {activeTab === 'encoded_list' && (() => {
            const filteredEnc = createdCustomers.filter(c => {
              const matchSearch = `${c.customer_no || ''} ${c.firstname} ${c.lastname} ${c.email}`.toLowerCase().includes(encSearch.toLowerCase());
              const matchStatus = encStatusFilter === 'all' || c.account_status === encStatusFilter;
              return matchSearch && matchStatus;
            });
            return (
            <div className="card p-6">
              <div className="section-header">
                <h3 className="section-title">Encoded Customer Account Statuses</h3>
              </div>
              {/* Search & Filter */}
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                  <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    className="form-input"
                    style={{ paddingLeft: '2.25rem' }}
                    placeholder="Search by name, customer no., or email…"
                    value={encSearch}
                    onChange={e => setEncSearch(e.target.value)}
                  />
                </div>
                <select className="form-select" style={{ width: 'auto' }} value={encStatusFilter} onChange={e => setEncStatusFilter(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Customer No.</th>
                      <th>Customer Name</th>
                      <th>Middlename</th>
                      <th>Email</th>
                      <th>Contact</th>
                      <th>Status</th>
                      <th>Admin Remarks</th>
                      <th>Date Encoded</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEnc.length === 0 ? (
                      <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No customer accounts found.</td></tr>
                    ) : filteredEnc.map((c) => (
                      <tr key={c.user_id}>
                        <td><span className="badge badge-pending">{c.customer_no || `CUST-${new Date(c.created_at).getFullYear()}-${String(c.user_id).padStart(4, '0')}`}</span></td>
                        <td><strong>{c.lastname}, {c.firstname}</strong></td>
                        <td>{c.middlename || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                        <td>{c.email}</td>
                        <td>{c.contact_number}</td>
                        <td>
                          <span className={`badge badge-${c.account_status}`}>
                            {c.account_status}
                          </span>
                        </td>
                        <td>{c.remarks || '—'}</td>
                        <td>{new Date(c.created_at).toLocaleDateString()}</td>
                        <td>
                          {c.account_status === 'pending' ? (
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button
                                onClick={() => {
                                  setVerifyModalTarget(c);
                                  setVerifyAction('approved');
                                  setVerifyRemarks('Customer documents & details verified by staff.');
                                  setVerifyMsg('');
                                  setGeneratedPassword('');
                                }}
                                className="btn btn-success btn-sm"
                                style={{ padding: '0.25rem 0.55rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                title="Approve Customer Account"
                              >
                                <CheckCircle2 size={13} /> Approve
                              </button>
                              <button
                                onClick={() => {
                                  setVerifyModalTarget(c);
                                  setVerifyAction('rejected');
                                  setVerifyRemarks('Incomplete credentials or details.');
                                  setVerifyMsg('');
                                  setGeneratedPassword('');
                                }}
                                className="btn btn-danger btn-sm"
                                style={{ padding: '0.25rem 0.55rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                title="Reject Customer Account"
                              >
                                <X size={13} /> Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            );
          })()}

          {/* Tab: Financial Report — Billing & Payments */}
          {activeTab === 'financial' && (() => {
            // ── Billing (bookings view with balance computation) ────────────
            const billingData = bookingsQueue.map(b => {
              const bkPayments = payments.filter(p => p.booking_id === b.booking_id);
              const totalPaid = bkPayments.reduce((sum, p) => sum + parseFloat(p.amount_paid || 0), 0);
              const balance = parseFloat(b.total_amount || 0) - totalPaid;
              return { ...b, total_paid: totalPaid, balance: balance < 0 ? 0 : balance };
            });
            const filteredBil = billingData.filter(b => {
              const matchSearch = `${b.customer_firstname} ${b.customer_lastname} BK-${b.booking_id}`.toLowerCase().includes(bilSearch.toLowerCase());
              const matchStatus = bilStatusFilter === 'all' || b.status === bilStatusFilter;
              return matchSearch && matchStatus;
            });
            const bilTotalPages = Math.max(1, Math.ceil(filteredBil.length / BIL_PAGE_SIZE));
            const bilPageSafe = Math.min(bilPage, bilTotalPages);
            const pagedBil = filteredBil.slice((bilPageSafe - 1) * BIL_PAGE_SIZE, bilPageSafe * BIL_PAGE_SIZE);

            // ── Payments view ─────────────────────────────────────────────
            const filteredPay = payments.filter(p => {
              const matchSearch = `${p.customer_firstname} ${p.customer_lastname} ${p.reference_no || ''}`.toLowerCase().includes(paySearch.toLowerCase());
              const matchMethod = payMethodFilter === 'all' || p.payment_method === payMethodFilter;
              return matchSearch && matchMethod;
            });
            const payTotalPages = Math.max(1, Math.ceil(filteredPay.length / PAY_PAGE_SIZE));
            const payPageSafe = Math.min(payPage, payTotalPages);
            const pagedPay = filteredPay.slice((payPageSafe - 1) * PAY_PAGE_SIZE, payPageSafe * PAY_PAGE_SIZE);

            // ── Summary stats ─────────────────────────────────────────────
            const totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.amount_paid || 0), 0);
            const totalBilled = bookingsQueue.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0);
            const totalBalance = totalBilled - totalRevenue;

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Section Header */}
                <div className="section-header">
                  <div>
                    <h1 className="section-title" style={{ fontSize: '1.5rem' }}>Financial Report</h1>
                    <p className="section-subtitle">Billing overview and payment collection records</p>
                  </div>
                  <button onClick={() => { fetchBookingsQueue(); fetchPayments(); }} className="btn btn-secondary btn-sm">
                    ↻ Refresh
                  </button>
                </div>

                {/* Summary Cards */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon stat-icon-amber"><Receipt size={22} /></div>
                    <div>
                      <div className="stat-value">₱{totalBilled.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                      <div className="stat-label">Total Billed</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon stat-icon-green"><DollarSign size={22} /></div>
                    <div>
                      <div className="stat-value">₱{totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                      <div className="stat-label">Total Collected</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon stat-icon-orange"><CreditCard size={22} /></div>
                    <div>
                      <div className="stat-value">₱{totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                      <div className="stat-label">Outstanding Balance</div>
                    </div>
                  </div>
                </div>

                {/* Sub-tab Switcher */}
                <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--border)', paddingBottom: '0' }}>
                  <button
                    onClick={() => setFinSubTab('billing')}
                    style={{
                      padding: '0.5rem 1.25rem', border: 'none', background: 'none', cursor: 'pointer',
                      fontWeight: finSubTab === 'billing' ? 700 : 400,
                      color: finSubTab === 'billing' ? 'var(--brand)' : 'var(--text-muted)',
                      borderBottom: finSubTab === 'billing' ? '2px solid var(--brand)' : '2px solid transparent',
                      marginBottom: '-2px', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem'
                    }}
                  >
                    <Receipt size={15} /> Billing
                  </button>
                  <button
                    onClick={() => setFinSubTab('payments')}
                    style={{
                      padding: '0.5rem 1.25rem', border: 'none', background: 'none', cursor: 'pointer',
                      fontWeight: finSubTab === 'payments' ? 700 : 400,
                      color: finSubTab === 'payments' ? 'var(--brand)' : 'var(--text-muted)',
                      borderBottom: finSubTab === 'payments' ? '2px solid var(--brand)' : '2px solid transparent',
                      marginBottom: '-2px', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem'
                    }}
                  >
                    <CreditCard size={15} /> Payments
                  </button>
                </div>

                {/* ── BILLING SUB-TAB ────────────────────────────────────── */}
                {finSubTab === 'billing' && (
                  <div className="card p-6">
                    <div className="section-header">
                      <h3 className="section-title">Booking Billing Summary</h3>
                    </div>
                    {/* Search & Filter */}
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                        <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                          className="form-input"
                          style={{ paddingLeft: '2.25rem' }}
                          placeholder="Search by customer or booking ID…"
                          value={bilSearch}
                          onChange={e => { setBilSearch(e.target.value); setBilPage(1); }}
                        />
                      </div>
                      <select className="form-select" style={{ width: 'auto' }} value={bilStatusFilter} onChange={e => { setBilStatusFilter(e.target.value); setBilPage(1); }}>
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="on_the_way">On the Way</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="table-wrap">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Booking ID</th>
                            <th>Customer</th>
                            <th>Event Type</th>
                            <th>Event Date</th>
                            <th>Status</th>
                            <th>Total Billed</th>
                            <th>Amount Paid</th>
                            <th>Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pagedBil.length === 0 ? (
                            <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No billing records found.</td></tr>
                          ) : pagedBil.map((b) => (
                            <tr key={b.booking_id}>
                              <td><strong>#BK-{b.booking_id}</strong></td>
                              <td>{b.customer_firstname} {b.customer_lastname}</td>
                              <td>{b.event_type}</td>
                              <td style={{ fontSize: '0.85rem' }}>{new Date(b.event_date).toLocaleDateString()}</td>
                              <td>
                                <span className={`badge badge-${b.status}`}>
                                  {b.status.replace(/_/g, ' ')}
                                </span>
                              </td>
                              <td style={{ color: 'var(--amber)', fontWeight: 600 }}>
                                ₱{parseFloat(b.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </td>
                              <td style={{ color: 'var(--success)', fontWeight: 600 }}>
                                ₱{b.total_paid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </td>
                              <td style={{ color: b.balance > 0 ? 'var(--danger, #ef4444)' : 'var(--text-muted)', fontWeight: b.balance > 0 ? 700 : 400 }}>
                                ₱{b.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Pagination */}
                    {bilTotalPages > 1 && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <span>Showing {(bilPageSafe - 1) * BIL_PAGE_SIZE + 1}–{Math.min(bilPageSafe * BIL_PAGE_SIZE, filteredBil.length)} of {filteredBil.length} records</span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setBilPage(p => Math.max(1, p - 1))} disabled={bilPageSafe === 1}><ChevronLeft size={16} /></button>
                          {Array.from({ length: bilTotalPages }, (_, i) => i + 1).map(pg => (
                            <button key={pg} onClick={() => setBilPage(pg)} className={`btn btn-sm ${pg === bilPageSafe ? 'btn-primary' : 'btn-ghost'}`}>{pg}</button>
                          ))}
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setBilPage(p => Math.min(bilTotalPages, p + 1))} disabled={bilPageSafe === bilTotalPages}><ChevronRight size={16} /></button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── PAYMENTS SUB-TAB ───────────────────────────────────── */}
                {finSubTab === 'payments' && (
                  <div className="card p-6">
                    <div className="section-header">
                      <h3 className="section-title">Payment Collection Records</h3>
                    </div>
                    {/* Search & Filters */}
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                        <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                          className="form-input"
                          style={{ paddingLeft: '2.25rem' }}
                          placeholder="Search by customer or reference no…"
                          value={paySearch}
                          onChange={e => { setPaySearch(e.target.value); setPayPage(1); }}
                        />
                      </div>
                      <select className="form-select" style={{ width: 'auto' }} value={payMethodFilter} onChange={e => { setPayMethodFilter(e.target.value); setPayPage(1); }}>
                        <option value="all">All Methods</option>
                        <option value="cash">Cash</option>
                        <option value="gcash">GCash</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="card">Card</option>
                      </select>
                    </div>
                    <div className="table-wrap">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Payment ID</th>
                            <th>Booking ID</th>
                            <th>Customer Name</th>
                            <th>Event Type</th>
                            <th>Amount Paid</th>
                            <th>Method</th>
                            <th>Ref No.</th>
                            <th>Recorded By</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pagedPay.length === 0 ? (
                            <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No payment records found.</td></tr>
                          ) : pagedPay.map((p) => (
                            <tr key={p.payment_id}>
                              <td><strong>#PAY-{p.payment_id}</strong></td>
                              <td>#BK-{p.booking_id}</td>
                              <td>{p.customer_firstname} {p.customer_lastname}</td>
                              <td style={{ fontSize: '0.85rem' }}>{p.event_type}</td>
                              <td style={{ color: 'var(--success)', fontWeight: 700 }}>
                                +₱{parseFloat(p.amount_paid).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </td>
                              <td><span className="badge badge-pending">{p.payment_method.toUpperCase()}</span></td>
                              <td>{p.reference_no || '—'}</td>
                              <td>{p.recorded_by_firstname} {p.recorded_by_lastname}</td>
                              <td style={{ fontSize: '0.8rem' }}>{new Date(p.payment_date).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Pagination */}
                    {payTotalPages > 1 && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <span>Showing {(payPageSafe - 1) * PAY_PAGE_SIZE + 1}–{Math.min(payPageSafe * PAY_PAGE_SIZE, filteredPay.length)} of {filteredPay.length} payments</span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setPayPage(p => Math.max(1, p - 1))} disabled={payPageSafe === 1}><ChevronLeft size={16} /></button>
                          {Array.from({ length: payTotalPages }, (_, i) => i + 1).map(pg => (
                            <button key={pg} onClick={() => setPayPage(pg)} className={`btn btn-sm ${pg === payPageSafe ? 'btn-primary' : 'btn-ghost'}`}>{pg}</button>
                          ))}
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setPayPage(p => Math.min(payTotalPages, p + 1))} disabled={payPageSafe === payTotalPages}><ChevronRight size={16} /></button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Tab: Profile Settings */}
          {activeTab === 'profile' && (
            <ProfileSettings />
          )}
        </div>
      </main>

      {/* Modal Popup: Add Customer */}
      {showAddCustomerModal && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-box" style={{ maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{ width: 38, height: 38, borderRadius: 'var(--r-lg)', background: 'var(--brand-dim)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 className="modal-title" style={{ margin: 0 }}>Add New Customer Account</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                    Encode new customer details — account will be routed to Admin for verification.
                  </p>
                </div>
              </div>
              <button onClick={() => setShowAddCustomerModal(false)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ paddingTop: '1.5rem' }}>
              <AddCustomerFormContent
                isModal={true}
                onCancel={() => setShowAddCustomerModal(false)}
                onSuccess={() => {
                  fetchCreatedCustomers();
                  fetchStaffDashboard();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Payment Record Modal */}
      {paymentModalBooking && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Record Payment — Booking #BK-{paymentModalBooking.booking_id}</h3>
              <button onClick={() => setPaymentModalBooking(null)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Total Booking Amount: <strong style={{ color: 'var(--amber)' }}>₱{parseFloat(paymentModalBooking.total_amount).toLocaleString()}</strong>
              </p>

              {paymentMsg && (
                <div className="alert alert-success">
                  <CheckCircle2 size={16} />
                  <span>{paymentMsg}</span>
                </div>
              )}

              <form onSubmit={handleRecordPaymentSubmit}>
                <div className="form-group">
                  <label className="form-label">Amount Paid (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="0.00"
                    value={paymentForm.amount_paid}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount_paid: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select
                    className="form-select"
                    value={paymentForm.payment_method}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                  >
                    <option value="cash">Cash</option>
                    <option value="gcash">GCash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="card">Credit/Debit Card</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Reference No. (Optional for digital payment)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. GC-1002349"
                    value={paymentForm.reference_no}
                    onChange={(e) => setPaymentForm({ ...paymentForm, reference_no: e.target.value })}
                  />
                </div>

                <div className="modal-footer" style={{ padding: '1rem 0 0 0', borderTop: '1px solid var(--border)' }}>
                  <button type="button" onClick={() => setPaymentModalBooking(null)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success">
                    Save Payment Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Customer Verification (Staff) */}
      {verifyModalTarget && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-box" style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                Verify Customer Account: {verifyModalTarget.firstname} {verifyModalTarget.lastname}
              </h3>
              <button onClick={() => setVerifyModalTarget(null)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              {verifyMsg && (
                <div className={`alert ${verifyAction === 'approved' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1rem' }}>
                  {verifyAction === 'approved' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{verifyMsg}</span>
                </div>
              )}

              {generatedPassword ? (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <div style={{
                    background: 'var(--bg-elevated)', border: '1px dashed var(--brand)',
                    borderRadius: 'var(--r-lg)', padding: '1.25rem', marginBottom: '1.25rem'
                  }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      Auto-Generated Customer Password:
                    </div>
                    <div style={{
                      fontFamily: 'monospace', fontSize: '1.4rem', fontWeight: 700,
                      color: 'var(--brand)', letterSpacing: '0.08em', marginBottom: '0.75rem'
                    }}>
                      {generatedPassword}
                    </div>
                    <button
                      onClick={handleCopyPassword}
                      className="btn btn-secondary btn-sm"
                      style={{ margin: '0 auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <Copy size={14} /> {pwdCopied ? 'Copied to Clipboard!' : 'Copy Password'}
                    </button>
                  </div>
                  <button onClick={() => setVerifyModalTarget(null)} className="btn btn-primary">
                    Done — Close Modal
                  </button>
                </div>
              ) : (
                <form onSubmit={handleVerifyAccountSubmit}>
                  <div className="form-group mb-4">
                    <label className="form-label">Verification Action</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="verifyActionStaff"
                          value="approved"
                          checked={verifyAction === 'approved'}
                          onChange={() => setVerifyAction('approved')}
                        />
                        <span style={{ color: 'var(--success, #22c55e)', fontWeight: 600 }}>Approve Account</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="verifyActionStaff"
                          value="rejected"
                          checked={verifyAction === 'rejected'}
                          onChange={() => setVerifyAction('rejected')}
                        />
                        <span style={{ color: 'var(--danger, #ef4444)', fontWeight: 600 }}>Reject Account</span>
                      </label>
                    </div>
                  </div>

                  <div className="form-group mb-4">
                    <label className="form-label">Remarks / Verification Notes</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      placeholder="Enter verification notes or rejection details…"
                      value={verifyRemarks}
                      onChange={(e) => setVerifyRemarks(e.target.value)}
                      required
                    />
                  </div>

                  <div className="modal-footer" style={{ padding: '1rem 0 0 0', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => setVerifyModalTarget(null)} className="btn btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" className={`btn ${verifyAction === 'approved' ? 'btn-success' : 'btn-danger'}`}>
                      Confirm {verifyAction === 'approved' ? 'Approval' : 'Rejection'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
