import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Calendar, Users, MapPin, DollarSign, Clock, CheckCircle,
  XCircle, AlertCircle, FileText, CheckSquare, Sparkles,
  ChevronRight, Star, ShieldCheck, Eye, RefreshCw, Award
} from 'lucide-react';

const EventWorkflowManagement = () => {
  const [activeSubTab, setActiveSubTab] = useState('inquiries'); // 'inquiries' | 'active_orders'
  const [requests, setRequests] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Review Inquiry Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState('approved');
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState('');

  // Requirement Review Modal State
  const [reqReviewModal, setReqReviewModal] = useState(null);
  const [reqAction, setReqAction] = useState('approved');
  const [reqRemarks, setReqRemarks] = useState('');
  const [reqReviewSubmitting, setReqReviewSubmitting] = useState(false);

  // Milestone Update State
  const [milestoneModal, setMilestoneModal] = useState(null);
  const [milestoneStatus, setMilestoneStatus] = useState('completed');
  const [milestoneNotes, setMilestoneNotes] = useState('');
  const [milestoneSubmitting, setMilestoneSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqRes, orderRes] = await Promise.all([
        api.get('/workflow/requests'),
        api.get('/workflow/orders')
      ]);
      setRequests(reqRes.data || []);
      setOrders(orderRes.data || []);

      if (orderRes.data && orderRes.data.length > 0 && !selectedOrder) {
        fetchOrderDetails(orderRes.data[0].order_id);
      }
    } catch (err) {
      console.error('Failed to load workflow management data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequestDetails = async (requestId) => {
    try {
      const res = await api.get(`/workflow/requests/${requestId}`);
      setSelectedRequest(res.data);
    } catch (err) {
      console.error('Failed to load request details:', err);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const res = await api.get(`/workflow/orders/${orderId}`);
      setSelectedOrder(res.data);
    } catch (err) {
      console.error('Failed to load order details:', err);
    }
  };

  const handleOpenReviewModal = (req, action) => {
    setSelectedRequest(req);
    setReviewAction(action);
    setReviewRemarks(action === 'approved' ? 'Inquiry details verified and event order confirmed.' : '');
    setReviewFeedback('');
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setReviewSubmitting(true);
    setReviewFeedback('');
    try {
      const res = await api.post(`/workflow/requests/${selectedRequest.request_id}/review`, {
        action: reviewAction,
        remarks: reviewRemarks
      });

      setReviewFeedback(`Inquiry ${selectedRequest.request_no} has been ${reviewAction}! Active event record created.`);
      setTimeout(() => {
        setReviewModalOpen(false);
        fetchData();
        if (res.data?.order_id) {
          setActiveSubTab('active_orders');
          fetchOrderDetails(res.data.order_id);
        }
      }, 1300);
    } catch (err) {
      setReviewFeedback(err.response?.data?.message || 'Failed to review request.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleOpenReqReview = (req) => {
    setReqReviewModal(req);
    setReqAction('approved');
    setReqRemarks('Document verified and accepted.');
  };

  const handleSubmitReqReview = async (e) => {
    e.preventDefault();
    if (!reqReviewModal) return;

    setReqReviewSubmitting(true);
    try {
      await api.post(`/workflow/requirements/${reqReviewModal.requirement_id}/review`, {
        action: reqAction,
        remarks: reqRemarks
      });

      setReqReviewModal(null);
      fetchOrderDetails(selectedOrder.order_id);
      fetchData();
    } catch (err) {
      console.error('Failed to review requirement:', err);
    } finally {
      setReqReviewSubmitting(false);
    }
  };

  const handleOpenMilestoneModal = (m) => {
    setMilestoneModal(m);
    setMilestoneStatus(m.status === 'pending' ? 'in_progress' : 'completed');
    setMilestoneNotes(m.notes || '');
  };

  const handleSubmitMilestone = async (e) => {
    e.preventDefault();
    if (!milestoneModal) return;

    setMilestoneSubmitting(true);
    try {
      await api.post(`/workflow/milestones/${milestoneModal.milestone_id}/log`, {
        status: milestoneStatus,
        notes: milestoneNotes
      });

      setMilestoneModal(null);
      fetchOrderDetails(selectedOrder.order_id);
      fetchData();
    } catch (err) {
      console.error('Failed to update milestone:', err);
    } finally {
      setMilestoneSubmitting(false);
    }
  };

  const pendingInquiriesCount = requests.filter(r => r.status === 'pending').length;
  const activeOrdersCount = orders.filter(o => o.status !== 'closed').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Controls & Navigation Header */}
      <div className="card" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '1rem', background: 'var(--surface)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--r-md)',
            background: 'linear-gradient(135deg, var(--brand), #818cf8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.2rem'
          }}>
            ⚡
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Event Lifecycle & Preparation Workflow</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              End-to-end event workflow: review inquiries, approve active orders, inspect checklists, and log prep progress
            </p>
          </div>
        </div>

        {/* Sub-tabs switch */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--surface-2)', padding: '0.25rem', borderRadius: 'var(--r-md)' }}>
          <button
            className={`btn btn-sm ${activeSubTab === 'inquiries' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveSubTab('inquiries')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none' }}
          >
            <Clock size={14} />
            Inquiries Queue
            {pendingInquiriesCount > 0 && (
              <span style={{
                background: 'var(--danger)', color: '#fff', fontSize: '0.68rem',
                fontWeight: 800, padding: '1px 6px', borderRadius: 999
              }}>
                {pendingInquiriesCount}
              </span>
            )}
          </button>

          <button
            className={`btn btn-sm ${activeSubTab === 'active_orders' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveSubTab('active_orders')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none' }}
          >
            <CheckSquare size={14} />
            Active Placements & Prep ({activeOrdersCount})
          </button>
        </div>
      </div>

      {/* VIEW 1: INQUIRIES & APPLICATIONS (Stage 1 & 2) */}
      {activeSubTab === 'inquiries' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
              Booking Inquiries & Proposals
            </h3>
            <button className="btn btn-secondary btn-sm" onClick={fetchData} title="Refresh inquiries">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          {requests.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
              No booking inquiries found.
            </p>
          ) : (
            <div className="table-container" style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Inquiry No</th>
                    <th>Customer</th>
                    <th>Occasion / Event</th>
                    <th>Target Date</th>
                    <th>Venue</th>
                    <th>Guests</th>
                    <th>Estimated Budget</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.request_id}>
                      <td>
                        <strong style={{ fontFamily: 'monospace', color: 'var(--brand)' }}>
                          {r.request_no}
                        </strong>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{r.customer_firstname} {r.customer_lastname}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.customer_contact}</div>
                      </td>
                      <td><strong>{r.event_type}</strong></td>
                      <td>{new Date(r.event_date).toLocaleDateString()}</td>
                      <td style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.venue_address}
                      </td>
                      <td>{r.guest_count} pax</td>
                      <td><strong>₱{parseFloat(r.estimated_budget || 0).toLocaleString()}</strong></td>
                      <td>
                        <span className={`badge ${
                          r.status === 'approved' ? 'badge-success' :
                          r.status === 'rejected' ? 'badge-danger' : 'badge-warning'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => { fetchRequestDetails(r.request_id); handleOpenReviewModal(r, 'approved'); }}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--success)' }}
                            title="Approve and spawn active event order"
                          >
                            ✓ Approve
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => { fetchRequestDetails(r.request_id); handleOpenReviewModal(r, 'rejected'); }}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--danger)' }}
                            title="Reject inquiry"
                          >
                            ✕ Reject
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
      )}

      {/* VIEW 2: ACTIVE PLACEMENTS / EVENT ORDERS & PREP LIFECYCLE (Stages 3, 4, 5, 6) */}
      {activeSubTab === 'active_orders' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 340px) 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Order Selector List */}
          <div className="card">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.875rem' }}>
              Active Confirmed Events ({orders.length})
            </h3>

            {orders.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                No active event orders yet. Approve an inquiry from the queue to spawn one!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {orders.map((o) => {
                  const isSelected = selectedOrder?.order_id === o.order_id;
                  return (
                    <div
                      key={o.order_id}
                      onClick={() => fetchOrderDetails(o.order_id)}
                      style={{
                        padding: '0.875rem',
                        borderRadius: 'var(--r-md)',
                        background: isSelected ? 'var(--brand-dim)' : 'var(--surface-2)',
                        border: `1px solid ${isSelected ? 'var(--brand)' : 'var(--border)'}`,
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.82rem', color: 'var(--brand)' }}>
                          {o.order_no}
                        </span>
                        <span className={`badge ${o.status === 'closed' ? 'badge-secondary' : o.status === 'completed' ? 'badge-success' : 'badge-primary'}`}>
                          {o.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{o.event_type}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                        Customer: <strong>{o.customer_firstname} {o.customer_lastname}</strong>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{
                            width: `${o.progress_percentage}%`,
                            height: '100%',
                            background: o.progress_percentage >= 100 ? 'var(--success)' : 'var(--brand)'
                          }} />
                        </div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                          {o.progress_percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Lifecycle Inspector */}
          <div>
            {selectedOrder ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Event Summary Card */}
                <div className="card" style={{ borderLeft: '4px solid var(--brand)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1rem', color: 'var(--brand)' }}>
                          {selectedOrder.order_no}
                        </span>
                        <span className={`badge ${selectedOrder.status === 'closed' ? 'badge-secondary' : selectedOrder.status === 'completed' ? 'badge-success' : 'badge-primary'}`}>
                          {selectedOrder.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                        {selectedOrder.event_type}
                      </h2>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Contract Amount</div>
                      <strong style={{ fontSize: '1.25rem' }}>
                        ₱{parseFloat(selectedOrder.contract_amount || 0).toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '0.75rem', padding: '0.75rem', background: 'var(--surface-2)',
                    borderRadius: 'var(--r-md)', fontSize: '0.8rem'
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Client:</span>{' '}
                      <strong>{selectedOrder.customer_firstname} {selectedOrder.customer_lastname}</strong> ({selectedOrder.customer_contact})
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Date & Venue:</span>{' '}
                      <strong>{new Date(selectedOrder.event_date).toLocaleDateString()}</strong> — {selectedOrder.venue_address}
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Guests:</span>{' '}
                      <strong>{selectedOrder.guest_count} persons</strong>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: 600 }}>Overall Execution Progress</span>
                      <strong style={{ color: selectedOrder.progress_percentage >= 100 ? 'var(--success)' : 'var(--brand)' }}>
                        {selectedOrder.progress_percentage}% Complete
                      </strong>
                    </div>
                    <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{
                        width: `${selectedOrder.progress_percentage}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--brand), #818cf8)'
                      }} />
                    </div>
                  </div>
                </div>

                {/* Stage 4: Requirements Review Section */}
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                        Stage 4 — Requirements & Documents Verification Loop
                      </h3>
                      <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                        Inspect client-submitted downpayment proof, signed contracts, dietary sheets, and venue passes
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {selectedOrder.requirements?.map((req) => (
                      <div
                        key={req.requirement_id}
                        style={{
                          padding: '0.875rem 1rem',
                          borderRadius: 'var(--r-md)',
                          background: 'var(--surface-2)',
                          border: '1px solid var(--border)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '1rem'
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 260 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{req.title}</span>
                            <span className={`badge ${
                              req.status === 'approved' ? 'badge-success' :
                              req.status === 'submitted' ? 'badge-info' :
                              req.status === 'rejected' ? 'badge-danger' : 'badge-warning'
                            }`}>
                              {req.status}
                            </span>
                          </div>

                          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>
                            {req.description}
                          </p>

                          {req.submission_notes && (
                            <div style={{ fontSize: '0.75rem', marginTop: '0.35rem', color: 'var(--text-subtle)' }}>
                              <strong>Client Notes:</strong> {req.submission_notes}
                            </div>
                          )}

                          {req.file_url && (
                            <div style={{ marginTop: '0.35rem' }}>
                              <a
                                href={req.file_url}
                                target="_blank"
                                rel="noreferrer"
                                style={{ fontSize: '0.75rem', color: 'var(--brand)', textDecoration: 'underline' }}
                              >
                                📎 View Uploaded Document Attachment
                              </a>
                            </div>
                          )}
                        </div>

                        <div>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenReqReview(req)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}
                          >
                            <ShieldCheck size={14} /> Review & Verify
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stage 5: Execution Milestones Logging */}
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                        Stage 5 — Event Preparation Milestones Logging
                      </h3>
                      <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                        Log progress across kitchen prep, table dressing, catering service, and egress breakdown
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {selectedOrder.milestones?.map((m, idx) => {
                      const isDone = m.status === 'completed';
                      const isInProgress = m.status === 'in_progress';
                      return (
                        <div
                          key={m.milestone_id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '1rem',
                            padding: '0.875rem',
                            borderRadius: 'var(--r-md)',
                            background: isDone ? 'rgba(34,197,94,0.04)' : isInProgress ? 'rgba(99,102,241,0.04)' : 'var(--surface-2)',
                            border: `1px solid ${isDone ? 'rgba(34,197,94,0.2)' : isInProgress ? 'rgba(99,102,241,0.25)' : 'var(--border)'}`
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flex: 1, minWidth: 260 }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: '50%',
                              background: isDone ? 'var(--success)' : isInProgress ? 'var(--brand)' : 'var(--border)',
                              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 800, fontSize: '0.82rem', flexShrink: 0
                            }}>
                              {isDone ? '✓' : idx + 1}
                            </div>

                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <strong style={{ fontSize: '0.88rem' }}>{m.milestone_name}</strong>
                                <span className={`badge ${isDone ? 'badge-success' : isInProgress ? 'badge-info' : 'badge-secondary'}`}>
                                  {m.status.replace('_', ' ')} (+{m.weight_percentage}%)
                                </span>
                              </div>

                              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '0.15rem 0 0' }}>
                                {m.description}
                              </p>

                              {m.notes && (
                                <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', marginTop: '0.25rem' }}>
                                  <em>Operational log: {m.notes}</em>
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleOpenMilestoneModal(m)}
                              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}
                            >
                              <Sparkles size={14} /> Update Milestone
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Stage 6: Client Evaluation Results */}
                {selectedOrder.evaluation && (
                  <div className="card" style={{ border: '1px solid rgba(245,158,11,0.3)' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Award size={18} color="var(--warning)" />
                      Stage 6 — Final Client Closeout Evaluation
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
                      <div className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Food Quality</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--warning)' }}>⭐ {selectedOrder.evaluation.food_quality_rating}/5</div>
                      </div>
                      <div className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Staff Service</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--warning)' }}>⭐ {selectedOrder.evaluation.service_staff_rating}/5</div>
                      </div>
                      <div className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Punctuality</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--warning)' }}>⭐ {selectedOrder.evaluation.punctuality_rating}/5</div>
                      </div>
                      <div className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Overall Rating</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand)' }}>⭐ {selectedOrder.evaluation.overall_rating}/5</div>
                      </div>
                    </div>

                    {selectedOrder.evaluation.feedback_comments && (
                      <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--surface-2)', borderRadius: 'var(--r-md)', fontSize: '0.82rem' }}>
                        <strong>Client Comments:</strong> "{selectedOrder.evaluation.feedback_comments}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: 'var(--text-muted)' }}>Select an active event order from the left to inspect its lifecycle.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Inquiry Modal */}
      {reviewModalOpen && selectedRequest && (
        <div className="modal-overlay" onClick={() => setReviewModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h3 className="modal-title">Review Event Inquiry ({selectedRequest.request_no})</h3>
              <button className="btn-icon" onClick={() => setReviewModalOpen(false)}>✕</button>
            </div>

            {reviewFeedback && (
              <div style={{
                background: reviewFeedback.includes('approved') ? 'var(--success-dim)' : 'var(--danger-dim)',
                padding: '0.75rem', borderRadius: 'var(--r-md)', marginBottom: '1rem', fontSize: '0.85rem'
              }}>
                {reviewFeedback}
              </div>
            )}

            <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '0.82rem', background: 'var(--surface-2)', padding: '0.75rem', borderRadius: 'var(--r-md)' }}>
                <div><strong>Occasion:</strong> {selectedRequest.event_type}</div>
                <div><strong>Target Date:</strong> {new Date(selectedRequest.event_date).toLocaleDateString()}</div>
                <div><strong>Venue:</strong> {selectedRequest.venue_address}</div>
                <div><strong>Guest Count:</strong> {selectedRequest.guest_count} persons</div>
                <div><strong>Budget Ceiling:</strong> ₱{parseFloat(selectedRequest.estimated_budget || 0).toLocaleString()}</div>
                {selectedRequest.special_requests && <div><strong>Special Requests:</strong> {selectedRequest.special_requests}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Review Action</label>
                <select
                  className="form-control"
                  value={reviewAction}
                  onChange={(e) => setReviewAction(e.target.value)}
                >
                  <option value="approved">✓ Approve & Spawn Active Event Order</option>
                  <option value="rejected">✕ Reject Inquiry</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Coordinator Feedback & Remarks</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  placeholder="Enter remarks for the client..."
                  required={reviewAction === 'rejected'}
                />
              </div>

              <div className="modal-footer" style={{ padding: 0 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setReviewModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={reviewSubmitting}>
                  {reviewSubmitting ? 'Processing...' : `Confirm ${reviewAction.toUpperCase()}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Requirement Modal */}
      {reqReviewModal && (
        <div className="modal-overlay" onClick={() => setReqReviewModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3 className="modal-title">Verify Requirement: {reqReviewModal.title}</h3>
              <button className="btn-icon" onClick={() => setReqReviewModal(null)}>✕</button>
            </div>

            <form onSubmit={handleSubmitReqReview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '0.82rem', background: 'var(--surface-2)', padding: '0.75rem', borderRadius: 'var(--r-md)' }}>
                {reqReviewModal.submission_notes && (
                  <div><strong>Client Notes:</strong> {reqReviewModal.submission_notes}</div>
                )}
                {reqReviewModal.file_url && (
                  <div style={{ marginTop: '0.25rem' }}>
                    <a href={reqReviewModal.file_url} target="_blank" rel="noreferrer" style={{ color: 'var(--brand)' }}>
                      📎 View Attachment Link
                    </a>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Verification Decision</label>
                <select
                  className="form-control"
                  value={reqAction}
                  onChange={(e) => setReqAction(e.target.value)}
                >
                  <option value="approved">✓ Approve Document</option>
                  <option value="rejected">✕ Reject / Request Re-upload</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Review Remarks</label>
                <input
                  type="text"
                  className="form-control"
                  value={reqRemarks}
                  onChange={(e) => setReqRemarks(e.target.value)}
                  placeholder="e.g. Deposit validated against bank statement"
                  required
                />
              </div>

              <div className="modal-footer" style={{ padding: 0 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setReqReviewModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={reqReviewSubmitting}>
                  {reqReviewSubmitting ? 'Saving...' : 'Save Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Milestone Modal */}
      {milestoneModal && (
        <div className="modal-overlay" onClick={() => setMilestoneModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3 className="modal-title">Update Prep Milestone</h3>
              <button className="btn-icon" onClick={() => setMilestoneModal(null)}>✕</button>
            </div>

            <form onSubmit={handleSubmitMilestone} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                {milestoneModal.milestone_name} (+{milestoneModal.weight_percentage}% progress)
              </div>

              <div className="form-group">
                <label className="form-label">Milestone Status</label>
                <select
                  className="form-control"
                  value={milestoneStatus}
                  onChange={(e) => setMilestoneStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">✓ Completed</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Operational Notes</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={milestoneNotes}
                  onChange={(e) => setMilestoneNotes(e.target.value)}
                  placeholder="e.g. Meat marinated, vegetable prep completed in kitchen batch 1..."
                />
              </div>

              <div className="modal-footer" style={{ padding: 0 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setMilestoneModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={milestoneSubmitting}>
                  {milestoneSubmitting ? 'Updating...' : 'Save Milestone Progress'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventWorkflowManagement;
