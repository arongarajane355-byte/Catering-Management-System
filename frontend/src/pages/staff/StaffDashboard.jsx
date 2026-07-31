import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Sidebar from '../../components/common/Sidebar';
import {
  UserPlus, Clock, Calendar, CheckSquare, DollarSign, Eye, EyeOff,
  CheckCircle2, ShieldAlert, X, AlertCircle, Search, ChevronLeft, ChevronRight
} from 'lucide-react';

const StaffDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState({ pending_accounts: 0, assigned_bookings: 0, upcoming_events: [] });
  const [createdCustomers, setCreatedCustomers] = useState([]);
  const [bookingsQueue, setBookingsQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Customer Form
  const [customerForm, setCustomerForm] = useState({
    firstname: '',
    lastname: '',
    gender: 'Male',
    age: 25,
    contact_number: '',
    email: '',
    password: ''
  });
  const [custFormMsg, setCustFormMsg] = useState({ text: '', isError: false });
  const [showPassword, setShowPassword] = useState(false);

  // Search / Filter / Pagination — Bookings Queue
  const [bqSearch, setBqSearch] = useState('');
  const [bqStatusFilter, setBqStatusFilter] = useState('all');
  const [bqPage, setBqPage] = useState(1);
  const BQ_PAGE_SIZE = 8;

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

  useEffect(() => {
    fetchStaffDashboard();
    fetchCreatedCustomers();
    fetchBookingsQueue();
  }, []);

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

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setCustFormMsg({ text: '', isError: false });

    try {
      const res = await api.post('/staff/customers', customerForm);
      setCustFormMsg({ text: res.data.message, isError: false });
      setCustomerForm({
        firstname: '',
        lastname: '',
        gender: 'Male',
        age: 25,
        contact_number: '',
        email: '',
        password: ''
      });
      fetchCreatedCustomers();
      fetchStaffDashboard();
    } catch (err) {
      setCustFormMsg({ text: err.response?.data?.message || 'Failed to create customer account.', isError: true });
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
                          <th>Event & Date</th>
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
                  <button onClick={() => setActiveTab('add_customer')} className="btn btn-primary btn-sm">
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
                <h3 className="section-title">Catering & Rental Orders Queue</h3>
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
                      <th>Event Type & Date</th>
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
                    New accounts will be saved with status <strong>`pending`</strong> for Admin verification.
                  </p>
                </div>
              </div>

              {custFormMsg.text && (
                <div className={`alert ${custFormMsg.isError ? 'alert-error' : 'alert-success'}`}>
                  {custFormMsg.isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                  <span>{custFormMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleAddCustomer}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={customerForm.firstname}
                      onChange={(e) => {
                        const fn = e.target.value;
                        const ln = customerForm.lastname;
                        const autoEmail = fn && ln ? `${fn.toLowerCase()}.${ln.toLowerCase()}@cms.com` : `${fn.toLowerCase()}@cms.com`;
                        const autoPass = fn && ln ? `${fn.charAt(0).toUpperCase() + fn.slice(1)}${ln.charAt(0).toUpperCase() + ln.slice(1)}123` : `${fn}123`;
                        setCustomerForm({ ...customerForm, firstname: fn, email: autoEmail, password: autoPass });
                      }}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={customerForm.lastname}
                      onChange={(e) => {
                        const ln = e.target.value;
                        const fn = customerForm.firstname;
                        const autoEmail = fn && ln ? `${fn.toLowerCase()}.${ln.toLowerCase()}@cms.com` : `${ln.toLowerCase()}@cms.com`;
                        const autoPass = fn && ln ? `${fn.charAt(0).toUpperCase() + fn.slice(1)}${ln.charAt(0).toUpperCase() + ln.slice(1)}123` : `${ln}123`;
                        setCustomerForm({ ...customerForm, lastname: ln, email: autoEmail, password: autoPass });
                      }}
                      required
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select
                      className="form-select"
                      value={customerForm.gender}
                      onChange={(e) => setCustomerForm({ ...customerForm, gender: e.target.value })}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Age</label>
                    <input
                      type="number"
                      className="form-input"
                      value={customerForm.age}
                      onChange={(e) => setCustomerForm({ ...customerForm, age: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="0917XXXXXXX"
                    value={customerForm.contact_number}
                    onChange={(e) => setCustomerForm({ ...customerForm, contact_number: e.target.value })}
                    required
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="customer@example.com"
                      value={customerForm.email}
                      onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Initial Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-input"
                        placeholder="••••••••"
                        value={customerForm.password}
                        onChange={(e) => setCustomerForm({ ...customerForm, password: e.target.value })}
                        style={{ paddingRight: '2.75rem' }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        style={{
                          position: 'absolute', right: '0.75rem', top: '50%',
                          transform: 'translateY(-50%)', background: 'none',
                          border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                          display: 'flex', alignItems: 'center', padding: 0
                        }}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '1rem' }}>
                  Submit Customer for Admin Verification
                </button>
              </form>
            </div>
          )}

          {/* Tab: Customer Verification Tracker */}
          {activeTab === 'encoded_list' && (() => {
            const filteredEnc = createdCustomers.filter(c => {
              const matchSearch = `${c.firstname} ${c.lastname} ${c.email}`.toLowerCase().includes(encSearch.toLowerCase());
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
                    placeholder="Search by name or email…"
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
                      <th>User ID</th>
                      <th>Customer Name</th>
                      <th>Email</th>
                      <th>Contact</th>
                      <th>Status</th>
                      <th>Admin Remarks</th>
                      <th>Date Encoded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEnc.length === 0 ? (
                      <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No customers found.</td></tr>
                    ) : filteredEnc.map((c) => (
                      <tr key={c.user_id}>
                        <td>#USR-{c.user_id}</td>
                        <td>{c.firstname} {c.lastname}</td>
                        <td>{c.email}</td>
                        <td>{c.contact_number}</td>
                        <td>
                          <span className={`badge badge-${c.account_status}`}>
                            {c.account_status}
                          </span>
                        </td>
                        <td>{c.remarks || '—'}</td>
                        <td>{new Date(c.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            );
          })()}
        </div>
      </main>

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
    </div>
  );
};

export default StaffDashboard;
