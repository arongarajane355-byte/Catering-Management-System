import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Sidebar from '../../components/common/Sidebar';
import ProfileSettings from '../../components/common/ProfileSettings';
import {
  ShieldCheck, UserCheck, Users, DollarSign, Calendar, AlertCircle,
  Plus, Check, X, Layers, ShoppingBag, CheckCircle2, Search, ChevronLeft, ChevronRight,
  Copy, KeyRound, Eye, BarChart3, Receipt, CreditCard, Printer, FileText, Clock,
  ArrowUpRight, Filter, RefreshCw, User, Building, Phone, Mail, Tag, Activity, Info, MapPin, PackageCheck
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [adminSummary, setAdminSummary] = useState({ summary: {}, recentBookings: [] });
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reports & Analytics State
  const [reportsSummary, setReportsSummary] = useState({ total_billed: 0, total_collected: 0, outstanding_balance: 0, total_bookings: 0, status_breakdown: [], payment_methods_breakdown: [], user_counts: [] });
  const [reportsBookings, setReportsBookings] = useState([]);
  const [reportsTransactions, setReportsTransactions] = useState([]);
  const [staffPerformance, setStaffPerformance] = useState([]);
  const [staffDetails, setStaffDetails] = useState({ encodedCustomers: [], staffPayments: [], staffBookings: [], staffLogs: [] });
  const [auditLogs, setAuditLogs] = useState([]);

  const [repSubTab, setRepSubTab] = useState('bookings');
  const [repSearch, setRepSearch] = useState('');
  const [repStatusFilter, setRepStatusFilter] = useState('all');
  const [repStaffFilter, setRepStaffFilter] = useState('all');
  const [repPage, setRepPage] = useState(1);
  const REP_PAGE_SIZE = 8;

  const [txSearch, setTxSearch] = useState('');
  const [txStaffFilter, setTxStaffFilter] = useState('all');
  const [txMethodFilter, setTxMethodFilter] = useState('all');
  const [txPage, setTxPage] = useState(1);
  const TX_PAGE_SIZE = 8;

  // Transaction & Booking Inspection Modals
  const [selectedTxModal, setSelectedTxModal] = useState(null);
  const [selectedBookingModal, setSelectedBookingModal] = useState(null);

  // View User Details Modal Target
  const [viewUserModalTarget, setViewUserModalTarget] = useState(null);

  // Verification Modal
  const [verifyModalTarget, setVerifyModalTarget] = useState(null);
  const [verifyAction, setVerifyAction] = useState('approved');
  const [verifyRemarks, setVerifyRemarks] = useState('');
  const [verifyMsg, setVerifyMsg] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [pwdCopied, setPwdCopied] = useState(false);

  // Create User Modal Form
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffForm, setStaffForm] = useState({
    firstname: '', lastname: '', gender: 'Male', age: 30, contact_number: '', email: '', password: '', role: 'staff'
  });
  const [staffMsg, setStaffMsg] = useState('');

  // Create Service Modal Form
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    category_id: '', service_name: '', description: '', base_price: '', unit: 'package', image_url: ''
  });
  const [serviceMsg, setServiceMsg] = useState('');

  // Search / Filter / Pagination — Pending Verifications
  const [verifSearch, setVerifSearch] = useState('');

  // Search / Filter / Pagination — Users Management
  const [usersSearch, setUsersSearch] = useState('');
  const [usersRoleFilter, setUsersRoleFilter] = useState('all');
  const [usersStatusFilter, setUsersStatusFilter] = useState('all');
  const [usersPage, setUsersPage] = useState(1);
  const USERS_PAGE_SIZE = 8;

  // Search / Filter — Service Catalog
  const [svcSearch, setSvcSearch] = useState('');
  const [svcCatFilter, setSvcCatFilter] = useState('all');
  const [svcPage, setSvcPage] = useState(1);
  const SVC_PAGE_SIZE = 8;

  useEffect(() => {
    fetchAllData();
    // Auto-poll every 15 seconds so staff updates reflect automatically
    const interval = setInterval(() => {
      fetchAllData();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = () => {
    fetchAdminSummary();
    fetchPendingVerifications();
    fetchUsersList();
    fetchCategories();
    fetchServices();
    fetchReportsSummary();
    fetchReportsBookings();
    fetchReportsTransactions();
    fetchStaffPerformance();
    fetchStaffDetails();
    fetchAuditLogs();
  };

  const fetchAdminSummary = async () => {
    try {
      const res = await api.get('/admin/summary');
      setAdminSummary(res.data);
    } catch (err) {
      console.error('Failed to load admin summary', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingVerifications = async () => {
    try {
      const res = await api.get('/admin/pending-verifications');
      setPendingVerifications(res.data);
    } catch (err) {
      console.error('Failed to fetch pending verifications', err);
    }
  };

  const fetchUsersList = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsersList(res.data);
    } catch (err) {
      console.error('Failed to load users list', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/services/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data);
    } catch (err) {
      console.error('Failed to load services', err);
    }
  };

  const fetchReportsSummary = async () => {
    try {
      const res = await api.get('/admin/reports/summary');
      setReportsSummary(res.data);
    } catch (err) {
      console.error('Failed to load reports summary', err);
    }
  };

  const fetchReportsBookings = async () => {
    try {
      const res = await api.get('/admin/reports/bookings');
      setReportsBookings(res.data);
    } catch (err) {
      console.error('Failed to load reports bookings', err);
    }
  };

  const fetchReportsTransactions = async () => {
    try {
      const res = await api.get('/admin/reports/transactions');
      setReportsTransactions(res.data);
    } catch (err) {
      console.error('Failed to load reports transactions', err);
    }
  };

  const fetchStaffPerformance = async () => {
    try {
      const res = await api.get('/admin/reports/staff-performance');
      setStaffPerformance(res.data);
    } catch (err) {
      console.error('Failed to load staff performance', err);
    }
  };

  const fetchStaffDetails = async () => {
    try {
      const res = await api.get('/admin/reports/staff-details');
      setStaffDetails(res.data || { encodedCustomers: [], staffPayments: [], staffBookings: [], staffLogs: [] });
    } catch (err) {
      console.error('Failed to load staff detailed reports', err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await api.get('/admin/audit-logs');
      setAuditLogs(res.data);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    }
  };



  const handleVerifyAccountSubmit = async (e) => {
    e.preventDefault();
    setVerifyMsg('');
    setGeneratedPassword('');
    setPwdCopied(false);

    try {
      const res = await api.post('/admin/verify-customer', {
        user_id: verifyModalTarget.user_id,
        action: verifyAction,
        remarks: verifyRemarks
      });

      setVerifyMsg(`Account successfully ${verifyAction}!`);
      if (res.data.generated_password) {
        setGeneratedPassword(res.data.generated_password);
      }
      // Only auto-close for rejections; for approvals keep modal open to show password
      if (verifyAction !== 'approved') {
        setTimeout(() => {
          setVerifyModalTarget(null);
          fetchPendingVerifications();
          fetchAdminSummary();
        }, 800);
      } else {
        fetchPendingVerifications();
        fetchAdminSummary();
        fetchUsersList();
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

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setStaffMsg('');

    const contact = (staffForm.contact_number || '').trim();
    if (contact.length !== 11 || !/^\d{11}$/.test(contact)) {
      setStaffMsg('Contact number must be exactly 11 digits (e.g. 09123456789).');
      return;
    }

    const email = (staffForm.email || '').trim().toLowerCase();
    if (!email.endsWith('@gmail.com')) {
      setStaffMsg('User email address must use @gmail.com (e.g. name@gmail.com).');
      return;
    }

    try {
      await api.post('/admin/users', staffForm);
      setStaffMsg(`${staffForm.role === 'staff' ? 'Staff' : 'Customer'} account created successfully!`);
      setTimeout(() => {
        setShowStaffModal(false);
        setStaffForm({ firstname: '', lastname: '', gender: 'Male', age: 30, contact_number: '', email: '', password: '', role: 'staff' });
        setStaffMsg('');
        fetchUsersList();
      }, 800);
    } catch (err) {
      setStaffMsg(err.response?.data?.message || 'Failed to create user account.');
    }
  };

  const handleToggleStaffStatus = async (userId, currentStatus) => {
    const newStatus = (currentStatus === 'active' || currentStatus === 'verified') ? 'inactive' : 'active';
    try {
      await api.put('/admin/user-status', { user_id: userId, account_status: newStatus });
      fetchUsersList();
    } catch (err) {
      console.error('Failed to toggle user status', err);
    }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    setServiceMsg('');

    try {
      await api.post('/services', serviceForm);
      setServiceMsg('Service item created successfully!');
      setShowServiceModal(false);
      fetchServices();
    } catch (err) {
      setServiceMsg(err.response?.data?.message || 'Failed to create service.');
    }
  };

  return (
    <div className="app-shell">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-title">Admin Management Portal</div>
        </header>

        <div className="page-content">
          {/* Tab: Overview */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Section Header */}
              <div className="section-header">
                <div>
                  <h1 className="section-title" style={{ fontSize: '1.5rem' }}>Admin Dashboard Overview</h1>
                  <p className="section-subtitle">Customer account verifications, staff governance, service catalog management, and revenue analytics</p>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon stat-icon-amber"><UserCheck size={22} /></div>
                  <div>
                    <div className="stat-value">{adminSummary.summary?.pending_verifications || 0}</div>
                    <div className="stat-label">Pending Verifications</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon stat-icon-orange"><Calendar size={22} /></div>
                  <div>
                    <div className="stat-value">{adminSummary.summary?.pending_bookings || 0}</div>
                    <div className="stat-label">Pending Bookings</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon stat-icon-green"><Check size={22} /></div>
                  <div>
                    <div className="stat-value">{adminSummary.summary?.completed_bookings || 0}</div>
                    <div className="stat-label">Completed Events</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon stat-icon-purple"><DollarSign size={22} /></div>
                  <div>
                    <div className="stat-value">₱{parseFloat(adminSummary.summary?.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    <div className="stat-label">Total System Revenue</div>
                  </div>
                </div>
              </div>
              <div className="card p-6">
                <div className="section-header">
                  <div>
                    <h3 className="section-title">Pending Customer Account Verifications</h3>
                    <p className="section-subtitle">Staff-encoded customer accounts requiring admin approval</p>
                  </div>
                  <button onClick={() => setActiveTab('verifications')} className="btn btn-secondary btn-sm">
                    View All Verifications ({pendingVerifications.length})
                  </button>
                </div>
                {pendingVerifications.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon"><UserCheck size={24} /></div>
                    <div className="empty-title">All customer verifications processed</div>
                    <div className="empty-desc">There are currently no customer accounts awaiting admin approval.</div>
                  </div>
                ) : (
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Customer No.</th>
                          <th>Customer Name</th>
                          <th>Email</th>
                          <th>Contact</th>
                          <th>Registered By</th>
                          <th>Date Registered</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingVerifications.slice(0, 5).map((u) => (
                          <tr key={u.user_id}>
                            <td><span className="badge badge-pending">{u.customer_no || 'Pending'}</span></td>
                            <td>
                              <strong>{u.lastname}, {u.firstname}</strong>
                              {u.middlename && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}> {u.middlename}</span>}
                            </td>
                            <td>{u.email}</td>
                            <td>{u.contact_number}</td>
                            <td>{u.staff_firstname ? `${u.staff_firstname} ${u.staff_lastname}` : <span style={{ color: 'var(--brand)', fontSize: '0.8rem' }}>Self-Registered</span>}</td>
                            <td>{new Date(u.created_at).toLocaleDateString()}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <button
                                  onClick={() => {
                                    setVerifyModalTarget(u);
                                    setVerifyAction('approved');
                                    setVerifyRemarks('Documents & credentials verified by Admin.');
                                    setVerifyMsg('');
                                    setGeneratedPassword('');
                                  }}
                                  className="btn btn-success btn-sm"
                                  style={{ padding: '0.25rem 0.55rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                  title="Approve Account"
                                >
                                  <CheckCircle2 size={13} /> Approve
                                </button>
                                <button
                                  onClick={() => {
                                    setVerifyModalTarget(u);
                                    setVerifyAction('rejected');
                                    setVerifyRemarks('Documents or credentials unverified.');
                                    setVerifyMsg('');
                                    setGeneratedPassword('');
                                  }}
                                  className="btn btn-danger btn-sm"
                                  style={{ padding: '0.25rem 0.55rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                  title="Reject Account"
                                >
                                  <X size={13} /> Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
                <div className="card p-6">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <BarChart3 size={18} style={{ color: 'var(--brand)' }} />
                    <h3 className="section-title">Reports & Monitoring Hub</h3>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    Monitor staff-encoded customer accounts, event status tracking, financial collections, and transaction audit trails.
                  </p>
                  <button onClick={() => setActiveTab('reports')} className="btn btn-primary btn-sm">
                    View Reports & Monitoring ({reportsBookings.length})
                  </button>
                </div>

                <div className="card p-6">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Users size={18} style={{ color: 'var(--brand)' }} />
                    <h3 className="section-title">Users Management</h3>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    Manage staff and customer accounts, view roles, and toggle account activation.
                  </p>
                  <button onClick={() => setActiveTab('users')} className="btn btn-secondary btn-sm">
                    Manage Users ({usersList.length})
                  </button>
                </div>

                <div className="card p-6">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <ShoppingBag size={18} style={{ color: 'var(--brand)' }} />
                    <h3 className="section-title">Catalog Manager</h3>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    Manage catering packages, food items, dessert bars, and equipment rentals.
                  </p>
                  <button onClick={() => setActiveTab('services')} className="btn btn-secondary btn-sm">
                    View Catalog ({services.length})
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Reports & Monitoring */}
          {activeTab === 'reports' && (() => {
            const staffList = usersList.filter(u => u.role === 'staff');

            // Filter Bookings Report
            const filteredBookingsReport = reportsBookings.filter(b => {
              const searchStr = `${b.booking_id} ${b.customer_firstname} ${b.customer_lastname} ${b.event_type} ${b.venue_address}`.toLowerCase();
              const matchSearch = searchStr.includes(repSearch.toLowerCase());
              const matchStatus = repStatusFilter === 'all' || b.status === repStatusFilter;
              const matchStaff = repStaffFilter === 'all' || String(b.handled_by) === String(repStaffFilter);
              return matchSearch && matchStatus && matchStaff;
            });

            const repTotalPages = Math.max(1, Math.ceil(filteredBookingsReport.length / REP_PAGE_SIZE));
            const repPageSafe = Math.min(repPage, repTotalPages);
            const pagedBookingsReport = filteredBookingsReport.slice((repPageSafe - 1) * REP_PAGE_SIZE, repPageSafe * REP_PAGE_SIZE);

            // Filter Transactions Report
            const filteredTxReport = reportsTransactions.filter(tx => {
              const searchStr = `${tx.payment_id} ${tx.reference_no || ''} ${tx.customer_firstname} ${tx.customer_lastname} ${tx.recorded_by_firstname} ${tx.recorded_by_lastname}`.toLowerCase();
              const matchSearch = searchStr.includes(repSearch.toLowerCase());
              const matchStaff = repStaffFilter === 'all' || String(tx.recorded_by) === String(repStaffFilter);
              return matchSearch && matchStaff;
            });

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Section Header */}
                <div className="section-header">
                  <div>
                    <h1 className="section-title" style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <BarChart3 size={24} style={{ color: 'var(--brand)' }} /> Reports & Monitoring Hub
                    </h1>
                    <p className="section-subtitle">
                      Monitor event status updates, staff-encoded accounts, financial collections, and cashier receipts.
                    </p>
                  </div>
                  <button onClick={fetchAllData} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <RefreshCw size={14} /> Refresh Reports
                  </button>
                </div>

                {/* KPI Cards */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon stat-icon-purple"><Receipt size={22} /></div>
                    <div>
                      <div className="stat-value">₱{parseFloat(reportsSummary.total_billed || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                      <div className="stat-label">Total Contract Billed</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon stat-icon-green"><DollarSign size={22} /></div>
                    <div>
                      <div className="stat-value">₱{parseFloat(reportsSummary.total_collected || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                      <div className="stat-label">Total Revenue Collected</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon stat-icon-orange"><CreditCard size={22} /></div>
                    <div>
                      <div className="stat-value">₱{parseFloat(reportsSummary.outstanding_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                      <div className="stat-label">Outstanding Balance</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon stat-icon-amber"><Calendar size={22} /></div>
                    <div>
                      <div className="stat-value">{reportsSummary.total_bookings || 0}</div>
                      <div className="stat-label">Total Event Orders</div>
                    </div>
                  </div>
                </div>

                {/* Sub-tab Navigation */}
                <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--border)', paddingBottom: '0', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setRepSubTab('bookings')}
                    style={{
                      padding: '0.6rem 1.25rem', border: 'none', background: 'none', cursor: 'pointer',
                      fontWeight: repSubTab === 'bookings' ? 700 : 400,
                      color: repSubTab === 'bookings' ? 'var(--brand)' : 'var(--text-muted)',
                      borderBottom: repSubTab === 'bookings' ? '2px solid var(--brand)' : '2px solid transparent',
                      marginBottom: '-2px', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem'
                    }}
                  >
                    <Calendar size={16} /> Bookings Status ({reportsBookings.length})
                  </button>
                  <button
                    onClick={() => setRepSubTab('financial')}
                    style={{
                      padding: '0.6rem 1.25rem', border: 'none', background: 'none', cursor: 'pointer',
                      fontWeight: repSubTab === 'financial' ? 700 : 400,
                      color: repSubTab === 'financial' ? 'var(--brand)' : 'var(--text-muted)',
                      borderBottom: repSubTab === 'financial' ? '2px solid var(--brand)' : '2px solid transparent',
                      marginBottom: '-2px', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem'
                    }}
                  >
                    <Receipt size={16} /> Financial Collections ({reportsTransactions.length})
                  </button>
                  <button
                    onClick={() => setRepSubTab('staff_performance')}
                    style={{
                      padding: '0.6rem 1.25rem', border: 'none', background: 'none', cursor: 'pointer',
                      fontWeight: repSubTab === 'staff_performance' ? 700 : 400,
                      color: repSubTab === 'staff_performance' ? 'var(--brand)' : 'var(--text-muted)',
                      borderBottom: repSubTab === 'staff_performance' ? '2px solid var(--brand)' : '2px solid transparent',
                      marginBottom: '-2px', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem'
                    }}
                  >
                    <Users size={16} /> Staff Performance ({staffPerformance.length})
                  </button>
                  <button
                    onClick={() => setRepSubTab('staff_details')}
                    style={{
                      padding: '0.6rem 1.25rem', border: 'none', background: 'none', cursor: 'pointer',
                      fontWeight: repSubTab === 'staff_details' ? 700 : 400,
                      color: repSubTab === 'staff_details' ? 'var(--brand)' : 'var(--text-muted)',
                      borderBottom: repSubTab === 'staff_details' ? '2px solid var(--brand)' : '2px solid transparent',
                      marginBottom: '-2px', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem'
                    }}
                  >
                    <UserCheck size={16} /> Staff-Encoded Reports Feed ({(staffDetails.encodedCustomers || []).length + (staffDetails.staffPayments || []).length + (staffDetails.staffBookings || []).length})
                  </button>
                </div>

                {/* Sub-Tab 1: Bookings Status & Operational Report */}
                {repSubTab === 'bookings' && (
                  <div className="card p-6">
                    <div className="section-header" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 className="section-title">Complete Bookings Status & Monitoring</h3>
                        <p className="section-subtitle" style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Live feed of customer bookings, staff handling, and fulfillment status (auto-refreshed)
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={fetchAllData} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          <RefreshCw size={14} /> Refresh Live Data
                        </button>
                        <button onClick={() => window.print()} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Printer size={14} /> Print Report
                        </button>
                      </div>
                    </div>

                    {/* Filter Bar */}
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                        <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                          className="form-input"
                          style={{ paddingLeft: '2.25rem' }}
                          placeholder="Search customer, booking ID, event type..."
                          value={repSearch}
                          onChange={e => { setRepSearch(e.target.value); setRepPage(1); }}
                        />
                      </div>

                      <select className="form-select" style={{ width: 'auto' }} value={repStatusFilter} onChange={e => { setRepStatusFilter(e.target.value); setRepPage(1); }}>
                        <option value="all">All Event Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="on_the_way">On The Way</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>

                      <select className="form-select" style={{ width: 'auto' }} value={repStaffFilter} onChange={e => { setRepStaffFilter(e.target.value); setRepPage(1); }}>
                        <option value="all">All Staff Handlers</option>
                        {staffList.map(s => (
                          <option key={s.user_id} value={s.user_id}>{s.firstname} {s.lastname}</option>
                        ))}
                      </select>
                    </div>

                    <div className="table-wrap">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Booking Ref</th>
                            <th>Customer Info</th>
                            <th>Event Details</th>
                            <th>Venue Address</th>
                            <th>Status</th>
                            <th>Total Billed</th>
                            <th>Total Paid</th>
                            <th>Balance</th>
                            <th>Handled By (Staff)</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pagedBookingsReport.length === 0 ? (
                            <tr><td colSpan={10} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No bookings found matching filters.</td></tr>
                          ) : pagedBookingsReport.map(b => (
                            <tr key={b.booking_id}>
                              <td><strong style={{ color: 'var(--brand)' }}>#BK-{b.booking_id}</strong></td>
                              <td>
                                <div><strong>{b.customer_lastname}, {b.customer_firstname}</strong></div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.customer_phone || b.customer_email}</div>
                              </td>
                              <td>
                                <div style={{ fontWeight: 600 }}>{b.event_type}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📅 {new Date(b.event_date).toLocaleDateString()} | 👥 {b.guest_count} pax</div>
                              </td>
                              <td><span style={{ fontSize: '0.8rem' }}>{b.venue_address}</span></td>
                              <td>
                                <span className={`badge badge-${b.status}`}>
                                  {b.status.replace(/_/g, ' ').toUpperCase()}
                                </span>
                              </td>
                              <td><strong>₱{parseFloat(b.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></td>
                              <td style={{ color: 'var(--success, #22c55e)' }}>₱{parseFloat(b.total_paid || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                              <td style={{ color: b.balance > 0 ? 'var(--danger, #ef4444)' : 'var(--text-muted)' }}>
                                ₱{parseFloat(b.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </td>
                              <td>
                                {b.staff_firstname ? (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>
                                      👤 {b.staff_firstname} {b.staff_lastname}
                                    </span>
                                  </div>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Unassigned</span>
                                )}
                              </td>
                              <td>
                                <button onClick={() => setSelectedBookingModal(b)} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                                  <Eye size={13} /> View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {repTotalPages > 1 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>
                          Page {repPageSafe} of {repTotalPages} ({filteredBookingsReport.length} items)
                        </span>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button disabled={repPageSafe <= 1} onClick={() => setRepPage(prev => prev - 1)} className="btn btn-secondary btn-sm"><ChevronLeft size={14} /></button>
                          <button disabled={repPageSafe >= repTotalPages} onClick={() => setRepPage(prev => prev + 1)} className="btn btn-secondary btn-sm"><ChevronRight size={14} /></button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-Tab 2: Financial Collections */}
                {repSubTab === 'financial' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Method Cards */}
                    <div className="grid-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                      {['cash', 'gcash', 'bank_transfer', 'card'].map(method => {
                        const matches = reportsTransactions.filter(t => t.payment_method === method);
                        const total = matches.reduce((sum, t) => sum + parseFloat(t.amount_paid || 0), 0);
                        return (
                          <div key={method} className="card p-4" style={{ borderLeft: '4px solid var(--brand)' }}>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                              {method.replace(/_/g, ' ')}
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.25rem 0', color: 'var(--text-main)' }}>
                              ₱{total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{matches.length} Payments Recorded</div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="card p-6">
                      <div className="section-header mb-4">
                        <h3 className="section-title">All Payment Transactions & Cashier Ledger</h3>
                      </div>
                      <div className="table-wrap">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Pay ID</th>
                              <th>Ref No.</th>
                              <th>Payment Date</th>
                              <th>Customer Name</th>
                              <th>Booking / Event</th>
                              <th>Payment Method</th>
                              <th>Amount Paid</th>
                              <th>Recorded By (Staff)</th>
                              <th>Inspect</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredTxReport.length === 0 ? (
                              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No transactions recorded.</td></tr>
                            ) : filteredTxReport.map(tx => (
                              <tr key={tx.payment_id}>
                                <td><strong style={{ color: 'var(--brand)' }}>#PAY-{tx.payment_id}</strong></td>
                                <td><code>{tx.reference_no || 'N/A (Cash)'}</code></td>
                                <td>{new Date(tx.payment_date).toLocaleString()}</td>
                                <td><strong>{tx.customer_lastname}, {tx.customer_firstname}</strong></td>
                                <td>#BK-{tx.booking_id} ({tx.event_type})</td>
                                <td><span className="badge badge-primary">{tx.payment_method.toUpperCase()}</span></td>
                                <td style={{ fontWeight: 700, color: 'var(--success, #22c55e)' }}>₱{parseFloat(tx.amount_paid).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                <td>
                                  <span className="badge badge-pending" style={{ fontSize: '0.78rem' }}>
                                    👤 {tx.staff_firstname || tx.recorded_by_firstname} {tx.staff_lastname || tx.recorded_by_lastname}
                                  </span>
                                </td>
                                <td>
                                  <button onClick={() => setSelectedTxModal(tx)} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                                    <Eye size={13} /> Slip
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-Tab 3: Staff Handling & Performance */}
                {repSubTab === 'staff_performance' && (
                  <div className="card p-6">
                    <div className="section-header mb-4">
                      <div>
                        <h3 className="section-title">Staff Performance & Handling Matrix</h3>
                        <p className="section-subtitle">Breakdown of bookings handled and total funds collected by each staff member.</p>
                      </div>
                    </div>

                    <div className="table-wrap">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Staff ID</th>
                            <th>Staff Full Name</th>
                            <th>Email & Contact</th>
                            <th>Bookings Handled</th>
                            <th>Payments Recorded</th>
                            <th>Total Funds Collected</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {staffPerformance.length === 0 ? (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No staff performance data found.</td></tr>
                          ) : staffPerformance.map(s => (
                            <tr key={s.staff_id}>
                              <td><strong>#STF-{s.staff_id}</strong></td>
                              <td><strong>{s.lastname}, {s.firstname}</strong></td>
                              <td>
                                <div>{s.email}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.contact_number}</div>
                              </td>
                              <td><span className="badge badge-pending">{s.total_handled_bookings} Bookings</span></td>
                              <td><span className="badge badge-secondary">{s.payments_processed} Payments</span></td>
                              <td>
                                <strong style={{ color: 'var(--success, #22c55e)', fontSize: '0.95rem' }}>
                                  ₱{parseFloat(s.total_money_collected || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </strong>
                              </td>
                              <td>
                                <span className={`badge badge-${s.account_status}`}>
                                  {s.account_status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Sub-Tab 4: Staff-Encoded Reports Feed */}
                {repSubTab === 'staff_details' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Top KPI Cards for Staff Activity Feed */}
                    <div className="grid-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                      <div className="card p-4" style={{ borderLeft: '4px solid var(--brand)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Customers Encoded</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.25rem 0', color: 'var(--text-main)' }}>
                          {(staffDetails.encodedCustomers || []).length}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Profiles registered by staff</div>
                      </div>

                      <div className="card p-4" style={{ borderLeft: '4px solid var(--success, #22c55e)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Payments Collected</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.25rem 0', color: 'var(--success, #22c55e)' }}>
                          ₱{(staffDetails.staffPayments || []).reduce((s, p) => s + parseFloat(p.amount_paid || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(staffDetails.staffPayments || []).length} transactions recorded</div>
                      </div>

                      <div className="card p-4" style={{ borderLeft: '4px solid #f59e0b' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Bookings Handled</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.25rem 0', color: 'var(--text-main)' }}>
                          {(staffDetails.staffBookings || []).length}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Events managed by staff</div>
                      </div>

                      <div className="card p-4" style={{ borderLeft: '4px solid #8b5cf6' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Audit Actions Logged</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.25rem 0', color: 'var(--text-main)' }}>
                          {(staffDetails.staffLogs || []).length}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-time staff activities</div>
                      </div>
                    </div>

                    {/* Card 1: Staff-Encoded Customers */}
                    <div className="card p-6">
                      <div className="section-header mb-3">
                        <div>
                          <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <UserCheck size={18} style={{ color: 'var(--brand)' }} /> Customer Accounts Encoded by Staff
                          </h3>
                          <p className="section-subtitle">Accounts registered & encoded directly by staff members</p>
                        </div>
                        <span className="badge badge-primary">{(staffDetails.encodedCustomers || []).length} Accounts</span>
                      </div>

                      <div className="table-wrap">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Customer No.</th>
                              <th>Customer Name</th>
                              <th>Email</th>
                              <th>Contact</th>
                              <th>Encoded By (Staff)</th>
                              <th>Date Encoded</th>
                              <th>Account Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(staffDetails.encodedCustomers || []).length === 0 ? (
                              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No customer accounts encoded by staff found.</td></tr>
                            ) : (staffDetails.encodedCustomers || []).map(c => (
                              <tr key={c.user_id}>
                                <td><span className="badge badge-pending">{c.customer_no || 'Pending'}</span></td>
                                <td><strong>{c.customer_lastname}, {c.customer_firstname}</strong></td>
                                <td>{c.customer_email}</td>
                                <td>{c.customer_phone}</td>
                                <td>
                                  <div style={{ fontWeight: 600 }}>👤 {c.staff_firstname} {c.staff_lastname}</div>
                                  <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{c.staff_email}</div>
                                </td>
                                <td>{new Date(c.created_at).toLocaleDateString()}</td>
                                <td>
                                  <span className={`badge badge-${c.account_status}`}>
                                    {c.account_status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Card 2: Staff Payments Recorded */}
                    <div className="card p-6">
                      <div className="section-header mb-3">
                        <div>
                          <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Receipt size={18} style={{ color: 'var(--brand)' }} /> Staff Financial Collections Ledger
                          </h3>
                          <p className="section-subtitle">Payment transactions recorded by staff cashiers</p>
                        </div>
                        <span className="badge badge-success">{(staffDetails.staffPayments || []).length} Payments</span>
                      </div>

                      <div className="table-wrap">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Payment ID</th>
                              <th>Ref / Control No.</th>
                              <th>Customer</th>
                              <th>Event Type</th>
                              <th>Amount Paid</th>
                              <th>Method</th>
                              <th>Recorded By (Staff)</th>
                              <th>Date Recorded</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(staffDetails.staffPayments || []).length === 0 ? (
                              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No payment transactions recorded by staff found.</td></tr>
                            ) : (staffDetails.staffPayments || []).map(p => (
                              <tr key={p.payment_id}>
                                <td><strong style={{ color: 'var(--brand)' }}>#PAY-{p.payment_id}</strong></td>
                                <td><code>{p.reference_no || 'N/A (Cash)'}</code></td>
                                <td><strong>{p.customer_lastname}, {p.customer_firstname}</strong></td>
                                <td>#BK-{p.booking_id} ({p.event_type})</td>
                                <td><strong style={{ color: 'var(--success, #22c55e)' }}>₱{parseFloat(p.amount_paid).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></td>
                                <td><span className="badge badge-primary">{p.payment_method.toUpperCase()}</span></td>
                                <td>
                                  <div style={{ fontWeight: 600 }}>👤 {p.staff_firstname} {p.staff_lastname}</div>
                                  <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{p.staff_email}</div>
                                </td>
                                <td>{new Date(p.payment_date).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Card 3: Bookings Handled & Managed by Staff */}
                    <div className="card p-6">
                      <div className="section-header mb-3">
                        <div>
                          <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Calendar size={18} style={{ color: 'var(--brand)' }} /> Bookings Handled & Processed by Staff
                          </h3>
                          <p className="section-subtitle">Event bookings accepted, managed, or status-updated by staff coordinators</p>
                        </div>
                        <span className="badge badge-pending">{(staffDetails.staffBookings || []).length} Bookings</span>
                      </div>

                      <div className="table-wrap">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Booking Ref</th>
                              <th>Customer Name</th>
                              <th>Event Type & Date</th>
                              <th>Venue Address</th>
                              <th>Booking Status</th>
                              <th>Contract Value</th>
                              <th>Handled By (Staff)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(staffDetails.staffBookings || []).length === 0 ? (
                              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No staff-handled bookings found.</td></tr>
                            ) : (staffDetails.staffBookings || []).map(b => (
                              <tr key={b.booking_id}>
                                <td><strong style={{ color: 'var(--brand)' }}>#BK-{b.booking_id}</strong></td>
                                <td>
                                  <strong>{b.customer_lastname}, {b.customer_firstname}</strong>
                                  <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{b.customer_phone}</div>
                                </td>
                                <td>
                                  <div><strong>{b.event_type}</strong></div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📅 {new Date(b.event_date).toLocaleDateString()} | 👥 {b.guest_count} pax</div>
                                </td>
                                <td><span style={{ fontSize: '0.8rem' }}>{b.venue_address}</span></td>
                                <td>
                                  <span className={`badge badge-${b.status}`}>
                                    {b.status.replace(/_/g, ' ').toUpperCase()}
                                  </span>
                                </td>
                                <td><strong>₱{parseFloat(b.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></td>
                                <td>
                                  <div style={{ fontWeight: 600 }}>👤 {b.staff_firstname} {b.staff_lastname}</div>
                                  <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{b.staff_email}</div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Card 4: Staff Operational Activity & Audit Trail Feed */}
                    <div className="card p-6">
                      <div className="section-header mb-3">
                        <div>
                          <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Activity size={18} style={{ color: 'var(--brand)' }} /> Staff Operational Activity & Audit Trail
                          </h3>
                          <p className="section-subtitle">Real-time log of actions executed by staff members</p>
                        </div>
                        <span className="badge badge-secondary">{(staffDetails.staffLogs || []).length} Actions Logged</span>
                      </div>

                      <div className="table-wrap">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Log ID</th>
                              <th>Staff Member</th>
                              <th>Action Type</th>
                              <th>Entity / Target</th>
                              <th>Operation Details</th>
                              <th>Timestamp</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(staffDetails.staffLogs || []).length === 0 ? (
                              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No recent staff activity logs found.</td></tr>
                            ) : (staffDetails.staffLogs || []).map(log => (
                              <tr key={log.log_id}>
                                <td><code style={{ fontSize: '0.78rem' }}>#LOG-{log.log_id}</code></td>
                                <td>
                                  <div style={{ fontWeight: 600 }}>👤 {log.staff_firstname} {log.staff_lastname}</div>
                                  <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{log.staff_email}</div>
                                </td>
                                <td>
                                  <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                                    {log.action.replace(/_/g, ' ')}
                                  </span>
                                </td>
                                <td><span style={{ textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 600 }}>{log.entity_type} #{log.entity_id}</span></td>
                                <td style={{ fontSize: '0.85rem' }}>{log.details}</td>
                                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(log.created_at).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Tab: Pending Verifications */}
          {activeTab === 'verifications' && (() => {
            const filteredVerif = pendingVerifications.filter(u =>
              `${u.firstname} ${u.lastname} ${u.email}`.toLowerCase().includes(verifSearch.toLowerCase())
            );
            return (
              <div className="card p-6">
                <div className="section-header">
                  <h3 className="section-title">Customer Accounts Awaiting Admin Verification</h3>
                </div>
                {/* Search */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      className="form-input"
                      style={{ paddingLeft: '2.25rem' }}
                      placeholder="Search by name or email…"
                      value={verifSearch}
                      onChange={e => setVerifSearch(e.target.value)}
                    />
                  </div>
                </div>
                {filteredVerif.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon"><UserCheck size={24} /></div>
                    <div className="empty-title">{verifSearch ? 'No results found' : 'All caught up!'}</div>
                    <div className="empty-desc">{verifSearch ? 'Try a different search term.' : 'No pending customer account verifications in queue.'}</div>
                  </div>
                ) : (
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Customer No.</th>
                          <th>Customer Name</th>
                          <th>Middlename</th>
                          <th>Email</th>
                          <th>Contact</th>
                          <th>Registered By</th>
                          <th>Date Registered</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredVerif.map((u) => (
                          <tr key={u.user_id}>
                            <td><span className="badge badge-pending">{u.customer_no || <em style={{ color: 'var(--text-muted)' }}>Pending</em>}</span></td>
                            <td>
                              <strong>{u.lastname}, {u.firstname}</strong>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.gender}, {u.age} y/o</div>
                            </td>
                            <td>{u.middlename || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                            <td>{u.email}</td>
                            <td>{u.contact_number}</td>
                            <td>{u.staff_firstname ? `${u.staff_firstname} ${u.staff_lastname}` : <span style={{ color: 'var(--brand)', fontWeight: 500 }}>Self-Registered</span>}</td>
                            <td>{new Date(u.created_at).toLocaleDateString()}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <button
                                  onClick={() => {
                                    setVerifyModalTarget(u);
                                    setVerifyAction('approved');
                                    setVerifyRemarks('Documents & credentials verified by Admin.');
                                    setVerifyMsg('');
                                    setGeneratedPassword('');
                                  }}
                                  className="btn btn-success btn-sm"
                                  style={{ padding: '0.25rem 0.55rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                  title="Approve Account"
                                >
                                  <CheckCircle2 size={13} /> Approve
                                </button>
                                <button
                                  onClick={() => {
                                    setVerifyModalTarget(u);
                                    setVerifyAction('rejected');
                                    setVerifyRemarks('Documents or credentials unverified.');
                                    setVerifyMsg('');
                                    setGeneratedPassword('');
                                  }}
                                  className="btn btn-danger btn-sm"
                                  style={{ padding: '0.25rem 0.55rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                  title="Reject Account"
                                >
                                  <X size={13} /> Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Tab: Users Management */}
          {activeTab === 'users' && (() => {
            const filteredUsers = usersList.filter(u => {
              const matchSearch = `${u.firstname} ${u.lastname} ${u.email}`.toLowerCase().includes(usersSearch.toLowerCase());
              const matchRole = usersRoleFilter === 'all' || u.role === usersRoleFilter;
              const matchStatus = usersStatusFilter === 'all' || u.account_status === usersStatusFilter;
              return matchSearch && matchRole && matchStatus;
            });
            const usersTotalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PAGE_SIZE));
            const usersPageSafe = Math.min(usersPage, usersTotalPages);
            const pagedUsers = filteredUsers.slice((usersPageSafe - 1) * USERS_PAGE_SIZE, usersPageSafe * USERS_PAGE_SIZE);
            return (
              <div className="card p-6">
                <div className="section-header">
                  <div>
                    <h3 className="section-title">System Users Management</h3>
                    <p className="section-subtitle">Overview and account governance of all staff members and registered customers</p>
                  </div>
                  <button onClick={() => setShowStaffModal(true)} className="btn btn-primary btn-sm">
                    <Plus size={16} /> Create User
                  </button>
                </div>
                {/* Search & Filters */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                    <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      className="form-input"
                      style={{ paddingLeft: '2.25rem' }}
                      placeholder="Search by name or email…"
                      value={usersSearch}
                      onChange={e => { setUsersSearch(e.target.value); setUsersPage(1); }}
                    />
                  </div>
                  <select className="form-select" style={{ width: 'auto' }} value={usersRoleFilter} onChange={e => { setUsersRoleFilter(e.target.value); setUsersPage(1); }}>
                    <option value="all">All Roles</option>
                    <option value="staff">Staff</option>
                    <option value="customer">Customer</option>
                  </select>
                  <select className="form-select" style={{ width: 'auto' }} value={usersStatusFilter} onChange={e => { setUsersStatusFilter(e.target.value); setUsersPage(1); }}>
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="verified">Verified</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Customer No.</th>
                        <th>Full Name</th>
                        <th>Role</th>
                        <th>Email</th>
                        <th>Contact</th>
                        <th>Status</th>
                        <th>Date Joined</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedUsers.length === 0 ? (
                        <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No users found matching your filters.</td></tr>
                      ) : pagedUsers.map((u) => (
                        <tr key={u.user_id}>
                          <td>{u.customer_no ? <span className="badge badge-pending">{u.customer_no}</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                          <td><strong>{u.lastname}, {u.firstname}</strong></td>
                          <td>
                            <span className={`badge ${u.role === 'staff' ? 'badge-pending' : 'badge-preparing'}`}>
                              {u.role.toUpperCase()}
                            </span>
                          </td>
                          <td>{u.email}</td>
                          <td>{u.contact_number}</td>
                          <td>
                            <span className={`badge badge-${u.account_status}`}>
                              {u.account_status}
                            </span>
                          </td>
                          <td>{new Date(u.created_at).toLocaleDateString()}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                              <button
                                onClick={() => setViewUserModalTarget(u)}
                                className="btn btn-sm btn-secondary"
                                style={{ padding: '0.25rem 0.55rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                title="View Account Details"
                              >
                                <Eye size={13} /> View
                              </button>

                              {(u.account_status === 'active' || u.account_status === 'verified') ? (
                                <button
                                  onClick={() => handleToggleStaffStatus(u.user_id, u.account_status)}
                                  className="btn btn-sm btn-danger"
                                  style={{ padding: '0.25rem 0.55rem', fontSize: '0.78rem' }}
                                >
                                  Deactivate
                                </button>
                              ) : u.account_status === 'inactive' ? (
                                <button
                                  onClick={() => handleToggleStaffStatus(u.user_id, u.account_status)}
                                  className="btn btn-sm btn-success"
                                  style={{ padding: '0.25rem 0.55rem', fontSize: '0.78rem' }}
                                >
                                  Activate
                                </button>
                              ) : u.account_status === 'pending' && u.role === 'customer' ? (
                                <button
                                  onClick={() => {
                                    setVerifyModalTarget(u);
                                    setVerifyAction('approved');
                                    setVerifyRemarks('Documents & credentials verified by Admin.');
                                    setVerifyMsg('');
                                  }}
                                  className="btn btn-sm btn-warning"
                                  style={{ background: 'var(--amber)', color: '#000', padding: '0.25rem 0.55rem', fontSize: '0.78rem' }}
                                >
                                  Verify
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Pagination */}
                {usersTotalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <span>Showing {(usersPageSafe - 1) * USERS_PAGE_SIZE + 1}–{Math.min(usersPageSafe * USERS_PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length} users</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setUsersPage(p => Math.max(1, p - 1))} disabled={usersPageSafe === 1}><ChevronLeft size={16} /></button>
                      {Array.from({ length: usersTotalPages }, (_, i) => i + 1).map(pg => (
                        <button key={pg} onClick={() => setUsersPage(pg)} className={`btn btn-sm ${pg === usersPageSafe ? 'btn-primary' : 'btn-ghost'}`}>{pg}</button>
                      ))}
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setUsersPage(p => Math.min(usersTotalPages, p + 1))} disabled={usersPageSafe === usersTotalPages}><ChevronRight size={16} /></button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Tab: Service Catalog Manager */}
          {activeTab === 'services' && (() => {
            const filteredSvc = services.filter(srv => {
              const matchSearch = `${srv.service_name} ${srv.description || ''}`.toLowerCase().includes(svcSearch.toLowerCase());
              const matchCat = svcCatFilter === 'all' || String(srv.category_id) === svcCatFilter;
              return matchSearch && matchCat;
            });
            const svcTotalPages = Math.max(1, Math.ceil(filteredSvc.length / SVC_PAGE_SIZE));
            const svcPageSafe = Math.min(svcPage, svcTotalPages);
            const pagedSvc = filteredSvc.slice((svcPageSafe - 1) * SVC_PAGE_SIZE, svcPageSafe * SVC_PAGE_SIZE);
            return (
              <div className="card p-6">
                <div className="section-header">
                  <h3 className="section-title">Catering Packages & Rental Services Catalog</h3>
                  <button onClick={() => setShowServiceModal(true)} className="btn btn-primary btn-sm">
                    <Plus size={16} /> Add New Service Package
                  </button>
                </div>
                {/* Search & Filters */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                    <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      className="form-input"
                      style={{ paddingLeft: '2.25rem' }}
                      placeholder="Search services…"
                      value={svcSearch}
                      onChange={e => { setSvcSearch(e.target.value); setSvcPage(1); }}
                    />
                  </div>
                  <select className="form-select" style={{ width: 'auto' }} value={svcCatFilter} onChange={e => { setSvcCatFilter(e.target.value); setSvcPage(1); }}>
                    <option value="all">All Categories</option>
                    {categories.map(c => (
                      <option key={c.category_id} value={String(c.category_id)}>{c.category_name}</option>
                    ))}
                  </select>
                </div>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Service ID</th>
                        <th>Category</th>
                        <th>Service Name</th>
                        <th>Description</th>
                        <th>Base Price</th>
                        <th>Unit</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedSvc.length === 0 ? (
                        <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No services found.</td></tr>
                      ) : pagedSvc.map((srv) => (
                        <tr key={srv.service_id}>
                          <td>#SRV-{srv.service_id}</td>
                          <td><span className="badge badge-pending">{srv.category_name}</span></td>
                          <td><strong>{srv.service_name}</strong></td>
                          <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{srv.description}</td>
                          <td style={{ color: 'var(--amber)', fontWeight: '600' }}>
                            ₱{parseFloat(srv.base_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td>{srv.unit}</td>
                          <td>
                            <span className={`badge ${srv.is_active ? 'badge-verified' : 'badge-rejected'}`}>
                              {srv.is_active ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Pagination */}
                {svcTotalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <span>Showing {(svcPageSafe - 1) * SVC_PAGE_SIZE + 1}–{Math.min(svcPageSafe * SVC_PAGE_SIZE, filteredSvc.length)} of {filteredSvc.length} services</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setSvcPage(p => Math.max(1, p - 1))} disabled={svcPageSafe === 1}><ChevronLeft size={16} /></button>
                      {Array.from({ length: svcTotalPages }, (_, i) => i + 1).map(pg => (
                        <button key={pg} onClick={() => setSvcPage(pg)} className={`btn btn-sm ${pg === svcPageSafe ? 'btn-primary' : 'btn-ghost'}`}>{pg}</button>
                      ))}
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setSvcPage(p => Math.min(svcTotalPages, p + 1))} disabled={svcPageSafe === svcTotalPages}><ChevronRight size={16} /></button>
                    </div>
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

      {/* Account Verification Modal */}
      {verifyModalTarget && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Customer Verification Audit</h3>
              <button
                onClick={() => {
                  setVerifyModalTarget(null);
                  setGeneratedPassword('');
                  setVerifyMsg('');
                  setPwdCopied(false);
                }}
                className="btn btn-ghost btn-icon"
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              {/* Customer Profile Info */}
              <div className="card p-4 mb-4" style={{ background: 'var(--bg-elevated)', fontSize: '0.875rem', lineHeight: 1.8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Registration Profile
                  </span>
                  <span className="badge badge-pending" style={{ fontWeight: 700, fontSize: '0.825rem', color: 'var(--brand)' }}>
                    {verifyModalTarget.customer_no || `CUST-${new Date(verifyModalTarget.created_at || Date.now()).getFullYear()}-${String(verifyModalTarget.user_id).padStart(4, '0')}`}
                  </span>
                </div>
                <p><strong>Customer No.:</strong>{' '}
                  <span style={{ color: 'var(--brand)', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.95rem' }}>
                    {verifyModalTarget.customer_no || `CUST-${new Date(verifyModalTarget.created_at || Date.now()).getFullYear()}-${String(verifyModalTarget.user_id).padStart(4, '0')}`}
                  </span>
                </p>
                <p><strong>Name:</strong> {verifyModalTarget.lastname}, {verifyModalTarget.firstname}{verifyModalTarget.middlename ? ` ${verifyModalTarget.middlename}` : ''}</p>
                <p><strong>Email:</strong> {verifyModalTarget.email}</p>
                <p><strong>Contact:</strong> {verifyModalTarget.contact_number}</p>
                <p><strong>Age / Gender:</strong> {verifyModalTarget.age} y/o ({verifyModalTarget.gender})</p>
              </div>

              {/* Success Message */}
              {verifyMsg && (
                <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
                  <CheckCircle2 size={16} />
                  <span>{verifyMsg}</span>
                </div>
              )}

              {/* Generated Password Display */}
              {generatedPassword && (
                <div style={{
                  background: 'var(--brand-dim)',
                  border: '1.5px solid var(--brand)',
                  borderRadius: 'var(--r-lg)',
                  padding: '1rem 1.25rem',
                  marginBottom: '1.25rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <KeyRound size={16} style={{ color: 'var(--brand)' }} />
                    <strong style={{ fontSize: '0.875rem', color: 'var(--brand)' }}>Auto-Generated Password</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <code style={{
                      flex: 1, background: 'var(--bg-base)', border: '1px solid var(--border)',
                      borderRadius: 'var(--r-md)', padding: '0.5rem 0.875rem',
                      fontSize: '1rem', fontWeight: 700, letterSpacing: '0.1em',
                      color: 'var(--text-primary)', fontFamily: 'monospace'
                    }}>
                      {generatedPassword}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className={`btn btn-sm ${pwdCopied ? 'btn-success' : 'btn-secondary'}`}
                      title="Copy to clipboard"
                    >
                      {pwdCopied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                    </button>
                  </div>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.625rem', margin: '0.625rem 0 0' }}>
                    ⚠️ This password is shown <strong>once only</strong>. Please relay it to the customer via phone or message.
                  </p>
                </div>
              )}

              {/* Verification Form — hide after successful approval */}
              {!generatedPassword && (
                <form onSubmit={handleVerifyAccountSubmit} id="verify-account-form">
                  <div className="form-group">
                    <label className="form-label">Verification Decision</label>
                    <select
                      className="form-select"
                      value={verifyAction}
                      onChange={(e) => setVerifyAction(e.target.value)}
                    >
                      <option value="approved">✅ Approve Account — Generate Password &amp; Activate</option>
                      <option value="rejected">❌ Reject Account — Set Status to Rejected</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Admin Remarks / Audit Notes</label>
                    <textarea
                      className="form-textarea"
                      rows="3"
                      placeholder="Enter remarks or verification details..."
                      value={verifyRemarks}
                      onChange={(e) => setVerifyRemarks(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="modal-footer" style={{ padding: '1rem 0 0 0', borderTop: '1px solid var(--border)' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setVerifyModalTarget(null);
                        setGeneratedPassword('');
                        setVerifyMsg('');
                        setPwdCopied(false);
                      }}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                    <button type="submit" className={`btn ${verifyAction === 'approved' ? 'btn-success' : 'btn-danger'}`}>
                      <ShieldCheck size={15} /> Confirm {verifyAction === 'approved' ? 'Approval' : 'Rejection'}
                    </button>
                  </div>
                </form>
              )}

              {/* Close button shown after approval (password is visible) */}
              {generatedPassword && (
                <div style={{ textAlign: 'right', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setVerifyModalTarget(null);
                      setGeneratedPassword('');
                      setVerifyMsg('');
                      setPwdCopied(false);
                    }}
                    className="btn btn-primary"
                  >
                    <Check size={15} /> Done — Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create User Account */}
      {showStaffModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Create New User Account</h3>
              <button onClick={() => { setShowStaffModal(false); setStaffMsg(''); }} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              {staffMsg && (
                <div className={`alert ${staffMsg.includes('successfully') ? 'alert-success' : 'alert-error'}`}>
                  {staffMsg.includes('successfully') ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{staffMsg}</span>
                </div>
              )}
              <form onSubmit={handleCreateStaff}>
                <div className="form-group">
                  <label className="form-label">Account Role</label>
                  <select className="form-select" value={staffForm.role} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}>
                    <option value="staff">Staff</option>
                    <option value="customer">Customer</option>
                  </select>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input
                      type="text" className="form-input"
                      value={staffForm.firstname} onChange={(e) => setStaffForm({ ...staffForm, firstname: e.target.value })} required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text" className="form-input"
                      value={staffForm.lastname} onChange={(e) => setStaffForm({ ...staffForm, lastname: e.target.value })} required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Middle Name <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(Optional)</span></label>
                  <input
                    type="text" className="form-input"
                    placeholder="Middle name"
                    value={staffForm.middlename || ''} onChange={(e) => setStaffForm({ ...staffForm, middlename: e.target.value })}
                  />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select className="form-select" value={staffForm.gender} onChange={(e) => setStaffForm({ ...staffForm, gender: e.target.value })}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Age</label>
                    <input type="number" className="form-input" value={staffForm.age} onChange={(e) => setStaffForm({ ...staffForm, age: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Number <span style={{ color: 'var(--danger, #ef4444)' }}>*</span></label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={11}
                    pattern="[0-9]{11}"
                    className="form-input"
                    placeholder="e.g. 09123456789 (11 digits)"
                    value={staffForm.contact_number}
                    onChange={(e) => setStaffForm({ ...staffForm, contact_number: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                    required
                  />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-input" value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-input" value={staffForm.password} onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })} required />
                  </div>
                </div>
                <div className="modal-footer" style={{ padding: '1rem 0 0 0', borderTop: '1px solid var(--border)' }}>
                  <button type="button" onClick={() => { setShowStaffModal(false); setStaffMsg(''); }} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary">
                    <Plus size={16} /> Create {staffForm.role === 'staff' ? 'Staff' : 'Customer'} Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Service Item */}
      {showServiceModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Add Service / Rental Item</h3>
              <button onClick={() => setShowServiceModal(false)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateService}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={serviceForm.category_id}
                    onChange={(e) => setServiceForm({ ...serviceForm, category_id: e.target.value })}
                    required
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map(c => (
                      <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Service Name</label>
                  <input
                    type="text" className="form-input"
                    placeholder="e.g. VIP Buffet Package"
                    value={serviceForm.service_name} onChange={(e) => setServiceForm({ ...serviceForm, service_name: e.target.value })} required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea" rows="2"
                    value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  ></textarea>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Base Price (₱)</label>
                    <input
                      type="number" step="0.01" className="form-input"
                      value={serviceForm.base_price} onChange={(e) => setServiceForm({ ...serviceForm, base_price: e.target.value })} required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit Type</label>
                    <input
                      type="text" className="form-input" placeholder="package / unit / per head"
                      value={serviceForm.unit} onChange={(e) => setServiceForm({ ...serviceForm, unit: e.target.value })} required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Image URL (Photo Banner Link)</label>
                  <input
                    type="url" className="form-input" placeholder="e.g. https://images.unsplash.com/photo-..."
                    value={serviceForm.image_url} onChange={(e) => setServiceForm({ ...serviceForm, image_url: e.target.value })}
                  />
                </div>

                <div className="modal-footer" style={{ padding: '1rem 0 0 0', borderTop: '1px solid var(--border)' }}>
                  <button type="button" onClick={() => setShowServiceModal(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Service</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: View User Account Details (Admin Only) */}
      {viewUserModalTarget && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-box" style={{ maxWidth: '580px', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{ width: 38, height: 38, borderRadius: 'var(--r-lg)', background: 'var(--brand-dim)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Eye size={18} />
                </div>
                <div>
                  <h3 className="modal-title" style={{ margin: 0 }}>User Account Details</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                    Complete profile metadata for account #{viewUserModalTarget.user_id}
                  </p>
                </div>
              </div>
              <button onClick={() => setViewUserModalTarget(null)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ paddingTop: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.88rem' }}>
                <div style={{ background: 'var(--bg-elevated)', padding: '0.875rem', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>User ID</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>#{viewUserModalTarget.user_id}</div>
                </div>

                <div style={{ background: 'var(--bg-elevated)', padding: '0.875rem', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Customer / Account No.</div>
                  <div style={{ fontWeight: 700, color: 'var(--brand)' }}>{viewUserModalTarget.customer_no || 'N/A (Staff/Admin)'}</div>
                </div>

                <div style={{ background: 'var(--bg-elevated)', padding: '0.875rem', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Full Name</div>
                  <div style={{ fontWeight: 600 }}>
                    {viewUserModalTarget.lastname}, {viewUserModalTarget.firstname} {viewUserModalTarget.middlename ? `(${viewUserModalTarget.middlename})` : ''}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-elevated)', padding: '0.875rem', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Account Role</div>
                  <div>
                    <span className={`badge ${viewUserModalTarget.role === 'staff' ? 'badge-pending' : viewUserModalTarget.role === 'admin' ? 'badge-primary' : 'badge-preparing'}`}>
                      {viewUserModalTarget.role.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-elevated)', padding: '0.875rem', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Email Address</div>
                  <div style={{ fontWeight: 600, color: 'var(--brand)', wordBreak: 'break-all' }}>{viewUserModalTarget.email}</div>
                </div>

                <div style={{ background: 'var(--bg-elevated)', padding: '0.875rem', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Contact Number</div>
                  <div style={{ fontWeight: 600 }}>{viewUserModalTarget.contact_number}</div>
                </div>

                <div style={{ background: 'var(--bg-elevated)', padding: '0.875rem', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Demographics</div>
                  <div>{viewUserModalTarget.gender}, {viewUserModalTarget.age} years old</div>
                </div>

                <div style={{ background: 'var(--bg-elevated)', padding: '0.875rem', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Account Status</div>
                  <div>
                    <span className={`badge badge-${viewUserModalTarget.account_status}`}>
                      {viewUserModalTarget.account_status}
                    </span>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-elevated)', padding: '0.875rem', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Date Registered / Created</div>
                  <div>{new Date(viewUserModalTarget.created_at).toLocaleString()}</div>
                </div>
              </div>

              <div className="modal-footer" style={{ padding: '1.25rem 0 0', marginTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setViewUserModalTarget(null)} className="btn btn-primary">
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Official Transaction Audit Slip & Receipt Certificate */}
      {selectedTxModal && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-box" style={{ maxWidth: '600px', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{ width: 38, height: 38, borderRadius: 'var(--r-lg)', background: 'var(--brand-dim)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Receipt size={20} />
                </div>
                <div>
                  <h3 className="modal-title" style={{ margin: 0 }}>Transaction Audit & Official Slip</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                    Payment Control No. #PAY-{selectedTxModal.payment_id}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedTxModal(null)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ paddingTop: '1.25rem' }}>
              {/* Printable Certificate Frame */}
              <div style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)',
                padding: '1.25rem', marginBottom: '1.25rem', fontSize: '0.88rem'
              }}>
                {/* Header */}
                <div style={{ textAlign: 'center', paddingBottom: '1rem', borderBottom: '1px dashed var(--border)', marginBottom: '1rem' }}>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>CaterMS Catering Management System</h4>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>OFFICIAL TRANSACTION & AUDIT SLIP</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--brand)', fontWeight: 600, marginTop: '0.2rem' }}>
                    Date & Time: {new Date(selectedTxModal.payment_date).toLocaleString()}
                  </div>
                </div>

                {/* Section: Operator Accountability */}
                <div style={{ marginBottom: '1rem', background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.25rem' }}>
                    PROCESSED / RECORDED BY (STAFF ACCOUNTABILITY)
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    👤 {selectedTxModal.staff_firstname || selectedTxModal.recorded_by_firstname} {selectedTxModal.staff_lastname || selectedTxModal.recorded_by_lastname}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    User ID: #{selectedTxModal.recorded_by} | Role: Staff Cashier
                  </div>
                </div>

                {/* Grid Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Customer Name</div>
                    <div style={{ fontWeight: 600 }}>{selectedTxModal.customer_lastname}, {selectedTxModal.customer_firstname}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Event & Booking ID</div>
                    <div style={{ fontWeight: 600 }}>#BK-{selectedTxModal.booking_id} ({selectedTxModal.event_type})</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Payment Method</div>
                    <div><span className="badge badge-primary">{selectedTxModal.payment_method.toUpperCase()}</span></div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Reference / Control No.</div>
                    <div style={{ fontFamily: 'monospace', fontWeight: 600 }}>{selectedTxModal.reference_no || 'N/A (Cash)'}</div>
                  </div>
                </div>

                {/* Amount Paid Summary */}
                <div style={{
                  background: 'var(--brand-dim)', border: '1px solid var(--brand)', borderRadius: 'var(--r-md)',
                  padding: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Amount Paid in this Transaction</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--brand)' }}>
                      ₱{parseFloat(selectedTxModal.amount_paid).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status</div>
                    <div style={{ fontWeight: 700, color: 'var(--success, #22c55e)' }}>RECORDED</div>
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ padding: '1rem 0 0', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => window.print()} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Printer size={15} /> Print Official Slip
                </button>
                <button onClick={() => setSelectedTxModal(null)} className="btn btn-primary">
                  Close Certificate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: View Booking Details */}
      {selectedBookingModal && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-box" style={{ maxWidth: '580px', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{ width: 38, height: 38, borderRadius: 'var(--r-lg)', background: 'var(--brand-dim)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 className="modal-title" style={{ margin: 0 }}>Booking Details #BK-{selectedBookingModal.booking_id}</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                    {selectedBookingModal.event_type} event on {new Date(selectedBookingModal.event_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedBookingModal(null)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ paddingTop: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.88rem' }}>
                <div style={{ background: 'var(--bg-elevated)', padding: '0.875rem', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Customer Name</div>
                  <div style={{ fontWeight: 600 }}>{selectedBookingModal.customer_lastname}, {selectedBookingModal.customer_firstname}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedBookingModal.customer_phone || selectedBookingModal.customer_contact}</div>
                </div>

                <div style={{ background: 'var(--bg-elevated)', padding: '0.875rem', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Event Type & Guests</div>
                  <div style={{ fontWeight: 600 }}>{selectedBookingModal.event_type}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>👥 {selectedBookingModal.guest_count} Guest Count</div>
                </div>

                <div style={{ background: 'var(--bg-elevated)', padding: '0.875rem', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Venue Address</div>
                  <div style={{ fontWeight: 600 }}>{selectedBookingModal.venue_address}</div>
                </div>

                <div style={{ background: 'var(--bg-elevated)', padding: '0.875rem', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Catering Services / Line Items</div>
                  <div style={{ fontWeight: 600, color: 'var(--brand)' }}>
                    {selectedBookingModal.items_summary || 'No items selected'}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-elevated)', padding: '0.875rem', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Event Status</div>
                  <div>
                    <span className={`badge badge-${selectedBookingModal.status}`}>
                      {selectedBookingModal.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-elevated)', padding: '0.875rem', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Handled By (Staff)</div>
                  <div>
                    {selectedBookingModal.staff_firstname ? (
                      <span className="badge badge-secondary">
                        👤 {selectedBookingModal.staff_firstname} {selectedBookingModal.staff_lastname}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>
                    )}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-elevated)', padding: '0.875rem', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Contract Value</div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--brand)' }}>
                    ₱{parseFloat(selectedBookingModal.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-elevated)', padding: '0.875rem', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Paid / Remaining Balance</div>
                  <div style={{ fontWeight: 600, color: 'var(--success, #22c55e)' }}>
                    Paid: ₱{parseFloat(selectedBookingModal.total_paid || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: selectedBookingModal.balance > 0 ? 'var(--danger, #ef4444)' : 'var(--text-muted)' }}>
                    Bal: ₱{parseFloat(selectedBookingModal.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ padding: '1.25rem 0 0', marginTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setSelectedBookingModal(null)} className="btn btn-primary">
                  Close Booking Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
