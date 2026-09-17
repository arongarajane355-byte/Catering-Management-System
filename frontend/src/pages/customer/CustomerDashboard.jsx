import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/common/Sidebar';
import ProfileSettings from '../../components/common/ProfileSettings';
import {
  Calendar, Plus, UserCheck, Eye, EyeOff, Clock, MapPin, Users, DollarSign,
  X, CheckCircle, AlertCircle, Search, ChevronLeft, ChevronRight
} from 'lucide-react';

const CustomerDashboard = () => {
  const { user, fetchCurrentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState({ bookings: [], total_spent: 0 });
  const [services, setServices] = useState([]);
  const [bookedDates, setBookedDates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [eventType, setEventType] = useState('Wedding');
  const [eventDate, setEventDate] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [guestCount, setGuestCount] = useState(50);
  const [selectedItems, setSelectedItems] = useState([{ service_id: '', quantity: 1 }]);
  const [bookingSubmitLoading, setBookingSubmitLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');

  // Interactive Calendar State
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getTodayStr = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayStr = getTodayStr();

  const handlePrevCalMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(y => y - 1);
    } else {
      setCalMonth(m => m - 1);
    }
  };

  const handleNextCalMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(y => y + 1);
    } else {
      setCalMonth(m => m + 1);
    }
  };

  const isPrevCalDisabled = () => {
    const now = new Date();
    return calYear < now.getFullYear() || (calYear === now.getFullYear() && calMonth <= now.getMonth());
  };

  const isDateBooked = (dateStr) => {
    if (!dateStr || !Array.isArray(bookedDates) || bookedDates.length === 0) return false;
    return bookedDates.some(bd => {
      if (typeof bd === 'string') {
        return bd.split('T')[0] === dateStr;
      }
      if (bd && typeof bd === 'object' && bd.event_date) {
        return String(bd.event_date).split('T')[0] === dateStr;
      }
      return false;
    });
  };

  // View Booking Detail Modal
  const [activeBookingDetail, setActiveBookingDetail] = useState(null);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    customer_no: user?.customer_no || '',
    lastname: user?.lastname || '',
    middlename: user?.middlename || '',
    firstname: user?.firstname || '',
    gender: user?.gender || 'Male',
    age: user?.age || 25,
    contact_number: user?.contact_number || '',
    email: user?.email || '',
    password: ''
  });
  const [showProfilePassword, setShowProfilePassword] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ text: '', isError: false });

  // Search / Filter / Pagination — My Bookings
  const [bkSearch, setBkSearch] = useState('');
  const [bkStatusFilter, setBkStatusFilter] = useState('all');
  const [bkPage, setBkPage] = useState(1);
  const BK_PAGE_SIZE = 6;

  useEffect(() => {
    fetchDashboardData();
    fetchServicesList();
    fetchBookedDates();
  }, []);

  useEffect(() => {
    if (showBookingModal) {
      fetchBookedDates();
      const now = new Date();
      setCalMonth(now.getMonth());
      setCalYear(now.getFullYear());
    }
  }, [showBookingModal]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        customer_no: user.customer_no || `CUST-${new Date(user.created_at || Date.now()).getFullYear()}-${String(user.user_id).padStart(4, '0')}`,
        lastname: user.lastname || '',
        middlename: user.middlename || '',
        firstname: user.firstname || '',
        gender: user.gender || 'Male',
        age: user.age || 25,
        contact_number: user.contact_number || '',
        email: user.email || '',
        password: ''
      });
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/customer/dashboard');
      setDashboardData(res.data);
    } catch (err) {
      console.error('Failed to load customer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchServicesList = async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data);
    } catch (err) {
      console.error('Failed to fetch services:', err);
    }
  };

  const fetchBookedDates = async () => {
    try {
      const res = await api.get('/bookings/booked-dates');
      setBookedDates(res.data || []);
    } catch (err) {
      console.error('Failed to fetch booked dates:', err);
    }
  };

  const handleAddItemRow = () => {
    setSelectedItems([...selectedItems, { service_id: '', quantity: 1 }]);
  };

  const handleRemoveItemRow = (index) => {
    const updated = [...selectedItems];
    updated.splice(index, 1);
    setSelectedItems(updated);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...selectedItems];
    updated[index][field] = value;
    setSelectedItems(updated);
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setBookingSubmitLoading(true);
    setBookingMessage('');

    try {
      const validItems = selectedItems.filter(i => i.service_id && i.quantity > 0);
      if (validItems.length === 0) {
        setBookingMessage('Please select at least one valid service or item.');
        setBookingSubmitLoading(false);
        return;
      }

      await api.post('/bookings', {
        event_type: eventType,
        event_date: eventDate,
        venue_address: venueAddress,
        guest_count: parseInt(guestCount),
        items: validItems
      });

      setBookingMessage('Booking request created successfully!');
      setShowBookingModal(false);
      fetchDashboardData();
    } catch (err) {
      setBookingMessage(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setBookingSubmitLoading(false);
    }
  };

  const handleViewDetail = async (bookingId) => {
    try {
      const res = await api.get(`/bookings/${bookingId}`);
      setActiveBookingDetail(res.data);
    } catch (err) {
      console.error('Failed to load booking detail', err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ text: '', isError: false });

    const fn = profileForm.firstname.trim();
    const ln = profileForm.lastname.trim();
    const contact = profileForm.contact_number.trim();
    const ageVal = parseInt(profileForm.age, 10);

    if (!fn || !ln || !contact || isNaN(ageVal)) {
      setProfileMsg({ text: 'Please fill in all required fields.', isError: true });
      return;
    }

    if (contact.length !== 11 || !/^\d{11}$/.test(contact)) {
      setProfileMsg({ text: 'Contact Number must be exactly 11 digits (e.g. 09123456789).', isError: true });
      return;
    }

    try {
      await api.put('/customer/profile', {
        firstname: fn,
        middlename: profileForm.middlename ? profileForm.middlename.trim() : null,
        lastname: ln,
        gender: profileForm.gender,
        age: ageVal,
        contact_number: contact,
        password: profileForm.password
      });
      setProfileMsg({ text: 'Personal information updated successfully!', isError: false });
      setProfileForm(prev => ({ ...prev, password: '' }));
      if (fetchCurrentUser) fetchCurrentUser();
    } catch (err) {
      setProfileMsg({ text: err.response?.data?.message || 'Failed to update personal information.', isError: true });
    }
  };

  return (
    <div className="app-shell">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-title">Customer Portal</div>
        </header>

        <div className="page-content">
          {/* Tab: Overview */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Header Banner */}
              <div className="section-header">
                <div>
                  <h1 className="section-title" style={{ fontSize: '1.5rem' }}>Welcome back, {user?.firstname}!</h1>
                  <p className="section-subtitle">Manage event bookings, customize menu & rentals, and track payment receipts</p>
                </div>
              </div>

              {/* Stats Overview */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon stat-icon-orange"><Calendar size={22} /></div>
                  <div>
                    <div className="stat-value">{dashboardData.bookings.length}</div>
                    <div className="stat-label">Total Bookings</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon stat-icon-green"><DollarSign size={22} /></div>
                  <div>
                    <div className="stat-value">₱{parseFloat(dashboardData.total_spent || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    <div className="stat-label">Total Payments Settled</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon stat-icon-blue"><UserCheck size={22} /></div>
                  <div>
                    <div className="stat-value" style={{ textTransform: 'capitalize' }}>{user?.account_status}</div>
                    <div className="stat-label">Account Verification</div>
                  </div>
                </div>
              </div>
              <div className="card p-6">
                <div className="section-header">
                  <div>
                    <h3 className="section-title">Recent Event Bookings</h3>
                    <p className="section-subtitle">Snapshot of your most recent catering and rental orders</p>
                  </div>
                  <button onClick={() => setActiveTab('bookings')} className="btn btn-secondary btn-sm">
                    View All Bookings ({dashboardData.bookings.length})
                  </button>
                </div>
                {dashboardData.bookings.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon"><Calendar size={24} /></div>
                    <div className="empty-title">No event bookings requested yet</div>
                    <div className="empty-desc">Get started by booking your first catering package or equipment rental.</div>
                    <button onClick={() => setShowBookingModal(true)} className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem' }}>
                      <Plus size={16} /> Book Event Now
                    </button>
                  </div>
                ) : (
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Booking ID</th>
                          <th>Event Type</th>
                          <th>Event Date</th>
                          <th>Venue Address</th>
                          <th>Guests</th>
                          <th>Total Amount</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.bookings.slice(0, 5).map((b) => (
                          <tr key={b.booking_id}>
                            <td><strong>#BK-{b.booking_id}</strong></td>
                            <td>{b.event_type}</td>
                            <td>{new Date(b.event_date).toLocaleDateString()}</td>
                            <td>{b.venue_address}</td>
                            <td>{b.guest_count} guests</td>
                            <td style={{ color: 'var(--amber)', fontWeight: '600' }}>
                              ₱{parseFloat(b.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                            <td>
                              <span className={`badge badge-${b.status}`}>
                                {b.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td>
                              <button onClick={() => handleViewDetail(b.booking_id)} className="btn btn-secondary btn-sm">
                                <Eye size={14} /> Details
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
                  <h3 className="section-title mb-2">Need Catering Services?</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    Browse our customizable menu packages, food delivery, dessert bars, and equipment rentals.
                  </p>
                  <button onClick={() => setShowBookingModal(true)} className="btn btn-primary btn-sm">
                    <Plus size={16} /> Request Booking
                  </button>
                </div>

                <div className="card p-6">
                  <h3 className="section-title mb-2">Account Status</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    Signed in as <strong>{user?.firstname} {user?.lastname}</strong> ({user?.email})
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
                    <span className={`badge badge-${user?.account_status}`}>
                      Status: {user?.account_status}
                    </span>
                    <button onClick={() => setActiveTab('profile')} className="btn btn-secondary btn-sm">
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}



          {/* Tab: Bookings */}
          {activeTab === 'bookings' && (() => {
            const filteredBk = dashboardData.bookings.filter(b => {
              const matchSearch = b.event_type.toLowerCase().includes(bkSearch.toLowerCase()) || `BK-${b.booking_id}`.toLowerCase().includes(bkSearch.toLowerCase());
              const matchStatus = bkStatusFilter === 'all' || b.status === bkStatusFilter;
              return matchSearch && matchStatus;
            });
            const bkTotalPages = Math.max(1, Math.ceil(filteredBk.length / BK_PAGE_SIZE));
            const bkPageSafe = Math.min(bkPage, bkTotalPages);
            const pagedBk = filteredBk.slice((bkPageSafe - 1) * BK_PAGE_SIZE, bkPageSafe * BK_PAGE_SIZE);
            return (
            <div className="card p-6">
              <div className="section-header">
                <h3 className="section-title">Bookings History & Live Tracker</h3>
                <button onClick={() => setShowBookingModal(true)} className="btn btn-primary btn-sm">
                  <Plus size={16} /> Book New Event
                </button>
              </div>
              {/* Search & Filter */}
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                  <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    className="form-input"
                    style={{ paddingLeft: '2.25rem' }}
                    placeholder="Search by event type or booking ID…"
                    value={bkSearch}
                    onChange={e => { setBkSearch(e.target.value); setBkPage(1); }}
                  />
                </div>
                <select className="form-select" style={{ width: 'auto' }} value={bkStatusFilter} onChange={e => { setBkStatusFilter(e.target.value); setBkPage(1); }}>
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="on_the_way">On the Way</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              {filteredBk.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><Calendar size={24} /></div>
                  <div className="empty-title">{bkSearch || bkStatusFilter !== 'all' ? 'No results found' : 'No bookings yet'}</div>
                  <div className="empty-desc">{bkSearch || bkStatusFilter !== 'all' ? 'Try a different search or filter.' : 'Click "Book New Event" to request catering or equipment rentals!'}</div>
                </div>
              ) : (
                <>
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Booking ID</th>
                          <th>Event Type</th>
                          <th>Event Date</th>
                          <th>Venue Address</th>
                          <th>Guest Count</th>
                          <th>Total Amount</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedBk.map((b) => (
                          <tr key={b.booking_id}>
                            <td><strong>#BK-{b.booking_id}</strong></td>
                            <td>{b.event_type}</td>
                            <td>{new Date(b.event_date).toLocaleDateString()}</td>
                            <td>{b.venue_address}</td>
                            <td>{b.guest_count} guests</td>
                            <td style={{ color: 'var(--amber)', fontWeight: '600' }}>
                              ₱{parseFloat(b.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                            <td>
                              <span className={`badge badge-${b.status}`}>
                                {b.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td>
                              <button onClick={() => handleViewDetail(b.booking_id)} className="btn btn-secondary btn-sm">
                                <Eye size={14} /> Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination */}
                  {bkTotalPages > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <span>Showing {(bkPageSafe - 1) * BK_PAGE_SIZE + 1}–{Math.min(bkPageSafe * BK_PAGE_SIZE, filteredBk.length)} of {filteredBk.length} bookings</span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setBkPage(p => Math.max(1, p - 1))} disabled={bkPageSafe === 1}><ChevronLeft size={16} /></button>
                        {Array.from({ length: bkTotalPages }, (_, i) => i + 1).map(pg => (
                          <button key={pg} onClick={() => setBkPage(pg)} className={`btn btn-sm ${pg === bkPageSafe ? 'btn-primary' : 'btn-ghost'}`}>{pg}</button>
                        ))}
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setBkPage(p => Math.min(bkTotalPages, p + 1))} disabled={bkPageSafe === bkTotalPages}><ChevronRight size={16} /></button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            );
          })()}

          {/* Tab: Profile */}
          {activeTab === 'profile' && (
            <ProfileSettings />
          )}
        </div>
      </main>

      {/* Modal: Create Booking */}
      {showBookingModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Book Event Catering & Packages</h2>
              <button onClick={() => setShowBookingModal(false)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              {bookingMessage && (
                <div className="alert alert-info">
                  <AlertCircle size={16} />
                  <span>{bookingMessage}</span>
                </div>
              )}
              <form onSubmit={handleCreateBooking}>
                <div className="form-group">
                  <label className="form-label">Event Type</label>
                  <select className="form-select" value={eventType} onChange={(e) => setEventType(e.target.value)}>
                    <option value="Wedding">Wedding (Kasal)</option>
                    <option value="Birthday">Birthday Celebration</option>
                    <option value="Baptismal">Baptismal Event</option>
                    <option value="Family Reunion">Family Reunion</option>
                    <option value="Corporate Event">Corporate / Seminar Event</option>
                    <option value="Other Special Occasion">Other Special Occasion</option>
                  </select>
                </div>

                {/* Event Date Picker with Calendar */}
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Event Date <span style={{ color: 'var(--danger, #ef4444)' }}>*</span></span>
                    {eventDate && (
                      <span style={{ fontSize: '0.78rem', color: isDateBooked(eventDate) ? 'var(--danger, #ef4444)' : 'var(--success, #22c55e)', fontWeight: 600 }}>
                        {isDateBooked(eventDate) ? '⚠️ Already Booked' : '✓ Available Date Selected'}
                      </span>
                    )}
                  </label>

                  {/* Selected Date Summary Display */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    background: 'var(--bg-surface, #0d1526)',
                    border: `1.5px solid ${eventDate && isDateBooked(eventDate) ? '#ef4444' : eventDate ? 'var(--brand, #f97316)' : 'rgba(255, 255, 255, 0.12)'}`,
                    borderRadius: '10px',
                    padding: '0.65rem 0.85rem',
                    marginBottom: '0.75rem'
                  }}>
                    <Calendar size={18} style={{ color: eventDate ? 'var(--brand, #f97316)' : '#94a3b8' }} />
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: eventDate ? 600 : 400,
                      color: eventDate ? '#f1f5f9' : '#94a3b8',
                      flex: 1
                    }}>
                      {eventDate ? (
                        `${eventDate} — ${new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`
                      ) : (
                        'Please click an available date on the calendar below'
                      )}
                    </span>
                    {eventDate && (
                      <button
                        type="button"
                        onClick={() => setEventDate('')}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', height: 'auto' }}
                        title="Clear selection"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* ⚠️ Warning Banner if a booked date is selected */}
                  {eventDate && isDateBooked(eventDate) && (
                    <div style={{
                      display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                      marginBottom: '0.75rem', padding: '0.6rem 0.85rem',
                      background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.4)',
                      borderRadius: '10px', fontSize: '0.825rem', color: '#f87171'
                    }}>
                      <AlertCircle size={16} style={{ marginTop: '1px', flexShrink: 0, color: '#ef4444' }} />
                      <span><strong>⚠️ This date is already booked.</strong> Please choose an available date from the calendar.</span>
                    </div>
                  )}

                  {/* Interactive Calendar where booked date numbers CANNOT be clicked or chosen */}
                  <div style={{
                    background: 'var(--bg-surface, #0d1526)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '14px',
                    padding: '0.95rem 1.1rem',
                    maxWidth: '440px',
                    margin: '0 auto',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                  }}>
                    {/* Month Header & Controls */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm btn-icon"
                        onClick={handlePrevCalMonth}
                        disabled={isPrevCalDisabled()}
                        title="Previous Month"
                        style={{ color: '#f1f5f9', opacity: isPrevCalDisabled() ? 0.35 : 1, cursor: isPrevCalDisabled() ? 'not-allowed' : 'pointer' }}
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f1f5f9' }}>
                        {monthNames[calMonth]} {calYear}
                      </div>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm btn-icon"
                        onClick={handleNextCalMonth}
                        title="Next Month"
                        style={{ color: '#f1f5f9' }}
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>

                    {/* Weekday Names Header */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center', marginBottom: '8px' }}>
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((w, idx) => (
                        <span key={w} style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: idx === 0 || idx === 6 ? 'var(--brand, #f97316)' : '#94a3b8'
                        }}>
                          {w}
                        </span>
                      ))}
                    </div>

                    {/* Days Grid */}
                    {(() => {
                      const daysInCurrentMonth = new Date(calYear, calMonth + 1, 0).getDate();
                      const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();
                      const formatYMD = (year, month, day) => {
                        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      };

                      return (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                          {/* Blank padding days */}
                          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                            <div key={`blank-${i}`} style={{ height: '36px' }} />
                          ))}

                          {/* Days of Month */}
                          {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
                            const dayNum = i + 1;
                            const dateStr = formatYMD(calYear, calMonth, dayNum);
                            const isPast = dateStr < todayStr;
                            const booked = isDateBooked(dateStr);
                            const isSelected = eventDate === dateStr;

                            // 1. Past date: disabled & unclickable
                            if (isPast) {
                              return (
                                <button
                                  key={dayNum}
                                  type="button"
                                  disabled
                                  style={{
                                    height: '36px',
                                    border: '1px solid rgba(255, 255, 255, 0.03)',
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    color: '#475569',
                                    opacity: 0.4,
                                    fontSize: '0.85rem',
                                    cursor: 'not-allowed',
                                    borderRadius: '8px'
                                  }}
                                  title="Past date cannot be booked"
                                >
                                  {dayNum}
                                </button>
                              );
                            }

                            // 2. Booked date: PROMINENT RED BADGE, DISABLED & CANNOT BE CLICKED OR CHOSEN
                            if (booked) {
                              return (
                                <button
                                  key={dayNum}
                                  type="button"
                                  disabled
                                  style={{
                                    height: '36px',
                                    border: '1.5px solid rgba(239, 68, 68, 0.55)',
                                    background: 'rgba(239, 68, 68, 0.18)',
                                    color: '#f87171',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    textDecoration: 'line-through',
                                    cursor: 'not-allowed',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    lineHeight: 1
                                  }}
                                  title="⚠️ Date Already Booked (Unavailable)"
                                  aria-disabled="true"
                                >
                                  <span>{dayNum}</span>
                                  <span style={{ fontSize: '0.52rem', fontWeight: 800, textDecoration: 'none', color: '#ef4444', letterSpacing: '0.02em', marginTop: '1px' }}>
                                    BOOKED
                                  </span>
                                </button>
                              );
                            }

                            // 3. Available date: Clickable, High contrast, Sleek dark button
                            return (
                              <button
                                key={dayNum}
                                type="button"
                                onClick={() => setEventDate(dateStr)}
                                style={{
                                  height: '36px',
                                  border: isSelected ? '2px solid #fb923c' : '1px solid rgba(255, 255, 255, 0.12)',
                                  background: isSelected ? 'var(--brand, #f97316)' : 'var(--bg-elevated, #131e35)',
                                  color: isSelected ? '#ffffff' : '#f1f5f9',
                                  fontWeight: isSelected ? 800 : 600,
                                  fontSize: '0.88rem',
                                  cursor: 'pointer',
                                  borderRadius: '8px',
                                  boxShadow: isSelected ? '0 0 14px rgba(249, 115, 22, 0.45)' : 'none',
                                  transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSelected) {
                                    e.currentTarget.style.background = 'var(--bg-hover, #1a2740)';
                                    e.currentTarget.style.borderColor = 'var(--brand, #f97316)';
                                    e.currentTarget.style.color = '#ffffff';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSelected) {
                                    e.currentTarget.style.background = 'var(--bg-elevated, #131e35)';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                                    e.currentTarget.style.color = '#f1f5f9';
                                  }
                                }}
                                title={`Select ${monthNames[calMonth]} ${dayNum}, ${calYear}`}
                              >
                                {dayNum}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })()}

                    {/* Legend */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-around',
                      marginTop: '0.85rem',
                      paddingTop: '0.65rem',
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                      fontSize: '0.76rem'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8' }}>
                        <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#131e35', border: '1.5px solid var(--brand, #f97316)' }} />
                        Available
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171', fontWeight: 600 }}>
                        <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ef4444' }} />
                        <span style={{ textDecoration: 'line-through' }}>Booked</span> (Disabled)
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
                        <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#334155' }} />
                        Past
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Venue Address</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Complete street, Barangay, City"
                      value={venueAddress}
                      onChange={(e) => setVenueAddress(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Guest Count</label>
                    <input
                      type="number"
                      className="form-input"
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div style={{ margin: '1.5rem 0' }}>
                  <label className="form-label" style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                    Select Services, Packages & Rental Items
                  </label>
                  {selectedItems.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                      <select
                        className="form-select"
                        style={{ flex: 3 }}
                        value={item.service_id}
                        onChange={(e) => handleItemChange(idx, 'service_id', e.target.value)}
                        required
                      >
                        <option value="">-- Choose Service or Item --</option>
                        {services.map(s => (
                          <option key={s.service_id} value={s.service_id}>
                            {s.service_name} (₱{parseFloat(s.base_price).toLocaleString()} /{s.unit})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        className="form-input"
                        style={{ flex: 1 }}
                        placeholder="Qty"
                        value={item.quantity}
                        min="1"
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        required
                      />
                      {selectedItems.length > 1 && (
                        <button type="button" onClick={() => handleRemoveItemRow(idx)} className="btn btn-danger btn-sm btn-icon">
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={handleAddItemRow} className="btn btn-secondary btn-sm" style={{ marginTop: '0.5rem' }}>
                    + Add Another Package / Item
                  </button>
                </div>

                <div className="modal-footer" style={{ padding: '1rem 0 0 0', borderTop: '1px solid var(--border)' }}>
                  <button type="button" onClick={() => setShowBookingModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={bookingSubmitLoading || !eventDate || isDateBooked(eventDate)}
                    title={!eventDate ? 'Please select an event date from the calendar' : isDateBooked(eventDate) ? 'Selected date is already booked' : ''}
                  >
                    {bookingSubmitLoading ? 'Submitting...' : 'Submit Booking Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: View Booking Detail */}
      {activeBookingDetail && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h2 className="modal-title">Booking #BK-{activeBookingDetail.booking_id}</h2>
                <span className={`badge badge-${activeBookingDetail.status}`}>
                  {activeBookingDetail.status.replace(/_/g, ' ')}
                </span>
              </div>
              <button onClick={() => setActiveBookingDetail(null)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="card p-4 mb-4" style={{ background: 'var(--bg-elevated)', fontSize: '0.875rem' }}>
                <p><strong>Event Type:</strong> {activeBookingDetail.event_type}</p>
                <p><strong>Event Date:</strong> {new Date(activeBookingDetail.event_date).toLocaleDateString()}</p>
                <p><strong>Venue:</strong> {activeBookingDetail.venue_address}</p>
                <p><strong>Guests:</strong> {activeBookingDetail.guest_count} persons</p>
                {activeBookingDetail.staff_firstname && (
                  <p style={{ marginTop: '0.5rem', color: 'var(--amber)' }}>
                    <strong>Assigned Staff:</strong> {activeBookingDetail.staff_firstname} {activeBookingDetail.staff_lastname}
                  </p>
                )}
              </div>

              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>Line Items Requested</h4>
              <div className="table-wrap mb-4">
                <table className="data-table" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th>Item / Service</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeBookingDetail.items.map((item) => (
                      <tr key={item.item_id}>
                        <td>{item.service_name}</td>
                        <td>{item.quantity}</td>
                        <td>₱{parseFloat(item.unit_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td>₱{parseFloat(item.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="card p-4" style={{ background: 'var(--bg-elevated)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span>Total Amount:</span>
                  <strong>₱{parseFloat(activeBookingDetail.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', color: 'var(--success)' }}>
                  <span>Amount Paid:</span>
                  <strong>₱{parseFloat(activeBookingDetail.total_paid || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.4rem', color: 'var(--amber)' }}>
                  <span>Remaining Balance:</span>
                  <strong>₱{parseFloat(activeBookingDetail.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setActiveBookingDetail(null)} className="btn btn-secondary">
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
