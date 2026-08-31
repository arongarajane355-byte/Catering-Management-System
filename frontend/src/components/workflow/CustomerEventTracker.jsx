import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Calendar, MapPin, Users, DollarSign, Clock, CheckCircle,
  AlertCircle, UploadCloud, Star, ChevronRight, FileText,
  Sparkles, CheckSquare, Plus, ArrowRight, ShieldAlert, Award
} from 'lucide-react';
import NewBookingRequestModal from './NewBookingRequestModal';

const CustomerEventTracker = () => {
  const [requests, setRequests] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Requirement Submission State
  const [activeReqModal, setActiveReqModal] = useState(null);
  const [reqNotes, setReqNotes] = useState('');
  const [reqFile, setReqFile] = useState(null);
  const [reqSubmitting, setReqSubmitting] = useState(false);
  const [reqMessage, setReqMessage] = useState('');

  // Evaluation Form State
  const [evalForm, setEvalForm] = useState({
    food_quality_rating: 5,
    service_staff_rating: 5,
    punctuality_rating: 5,
    overall_rating: 5,
    feedback_comments: '',
    recommend_to_others: true
  });
  const [evalSubmitting, setEvalSubmitting] = useState(false);
  const [evalMessage, setEvalMessage] = useState('');

  useEffect(() => {
    fetchWorkflowData();
  }, []);

  const fetchWorkflowData = async () => {
    setLoading(true);
    try {
      const [reqRes, orderRes] = await Promise.all([
        api.get('/workflow/requests'),
        api.get('/workflow/orders')
      ]);
      setRequests(reqRes.data || []);
      setOrders(orderRes.data || []);

      if (orderRes.data && orderRes.data.length > 0) {
        // If there's an active order, fetch details for the first one or maintain selection
        const targetId = selectedOrder ? selectedOrder.order_id : orderRes.data[0].order_id;
        fetchOrderDetails(targetId);
      }
    } catch (err) {
      console.error('Failed to load workflow data:', err);
    } finally {
      setLoading(false);
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

  const handleOpenReqModal = (req) => {
    setActiveReqModal(req);
    setReqNotes(req.submission_notes || '');
    setReqFile(null);
    setReqMessage('');
  };

  const handleSubmitRequirement = async (e) => {
    e.preventDefault();
    if (!activeReqModal) return;

    setReqSubmitting(true);
    setReqMessage('');
    try {
      const formData = new FormData();
      formData.append('submission_notes', reqNotes);
      if (reqFile) {
        formData.append('file', reqFile);
      }

      await api.post(`/workflow/requirements/${activeReqModal.requirement_id}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setReqMessage('Requirement submitted successfully! Under review by staff.');
      setTimeout(() => {
        setActiveReqModal(null);
        fetchOrderDetails(selectedOrder.order_id);
      }, 1200);
    } catch (err) {
      setReqMessage(err.response?.data?.message || 'Failed to submit requirement.');
    } finally {
      setReqSubmitting(false);
    }
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setEvalSubmitting(true);
    setEvalMessage('');
    try {
      await api.post(`/workflow/orders/${selectedOrder.order_id}/evaluate`, evalForm);
      setEvalMessage('Thank you! Your feedback has been recorded and the event is officially closed.');
      setTimeout(() => {
        fetchOrderDetails(selectedOrder.order_id);
        fetchWorkflowData();
      }, 1500);
    } catch (err) {
      setEvalMessage(err.response?.data?.message || 'Failed to submit evaluation.');
    } finally {
      setEvalSubmitting(false);
    }
  };

  if (loading && !selectedOrder && orders.length === 0 && requests.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading event tracker and lifecycle records...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(129,140,248,0.04))',
        border: '1px solid rgba(99,102,241,0.25)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{
            width: 46, height: 46, borderRadius: 'var(--r-md)',
            background: 'linear-gradient(135deg, var(--brand), #818cf8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.25rem'
          }}>
            🎯
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Event Lifecycle & Progress Tracker</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Track your event from inquiry review to document submission, kitchen prep, and post-event closeout.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowRequestModal(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={16} /> Submit New Booking Inquiry
        </button>
      </div>

      {/* Grid: Left Column (Inquiries & Orders List), Right Column (Active Event Detail & Lifecycle) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 360px) 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Confirmed Active Events Section */}
          <div className="card">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckSquare size={16} color="var(--brand)" />
              Active Confirmed Events ({orders.length})
            </h3>

            {orders.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                No active confirmed event orders yet.
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
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.82rem', color: 'var(--brand)' }}>
                          {o.order_no}
                        </span>
                        <span className={`badge ${o.status === 'closed' ? 'badge-secondary' : o.status === 'completed' ? 'badge-success' : 'badge-primary'}`}>
                          {o.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                        {o.event_type}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        <Calendar size={13} /> {new Date(o.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        <span>•</span>
                        <Users size={13} /> {o.guest_count} guests
                      </div>

                      {/* Progress Bar Mini */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{
                            width: `${o.progress_percentage}%`,
                            height: '100%',
                            background: o.progress_percentage >= 100 ? 'var(--success)' : 'var(--brand)',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: o.progress_percentage >= 100 ? 'var(--success)' : 'var(--text)' }}>
                          {o.progress_percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Stage 1: Submitted Inquiries / Booking Requests */}
          <div className="card">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} color="var(--info)" />
              My Booking Inquiries ({requests.length})
            </h3>

            {requests.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                You haven't submitted any inquiries yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {requests.map((r) => (
                  <div
                    key={r.request_id}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--r-md)',
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {r.request_no}
                      </span>
                      <span className={`badge ${r.status === 'approved' ? 'badge-success' : r.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                        {r.status}
                      </span>
                    </div>

                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{r.event_type}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Date: {new Date(r.event_date).toLocaleDateString()}
                    </div>

                    {r.review_remarks && (
                      <div style={{
                        marginTop: '0.4rem', padding: '0.4rem 0.5rem', borderRadius: 4,
                        background: r.status === 'approved' ? 'var(--success-dim)' : 'var(--danger-dim)',
                        fontSize: '0.72rem', color: r.status === 'approved' ? 'var(--success)' : 'var(--danger)'
                      }}>
                        <strong>Coordinator Note:</strong> {r.review_remarks}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Active Event Lifecycle & Stages 4, 5, 6 */}
        <div>
          {selectedOrder ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Event Header Banner */}
              <div className="card" style={{ borderLeft: '4px solid var(--brand)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1rem', color: 'var(--brand)' }}>
                        {selectedOrder.order_no}
                      </span>
                      <span className={`badge ${selectedOrder.status === 'closed' ? 'badge-secondary' : selectedOrder.status === 'completed' ? 'badge-success' : 'badge-primary'}`}>
                        {selectedOrder.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
                      {selectedOrder.event_type}
                    </h1>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Contract Total</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)' }}>
                      ₱{parseFloat(selectedOrder.contract_amount || 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '0.75rem', padding: '0.75rem', background: 'var(--surface-2)',
                  borderRadius: 'var(--r-md)', fontSize: '0.8rem'
                }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Target Date:</span>{' '}
                    <strong>{new Date(selectedOrder.event_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Venue:</span>{' '}
                    <strong>{selectedOrder.venue_address}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Guests:</span>{' '}
                    <strong>{selectedOrder.guest_count} persons</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Staff Coordinator:</span>{' '}
                    <strong>{selectedOrder.coordinator_firstname ? `${selectedOrder.coordinator_firstname} ${selectedOrder.coordinator_lastname}` : 'Catering Admin'}</strong>
                  </div>
                </div>

                {/* Main Progress Bar */}
                <div style={{ marginTop: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', fontSize: '0.82rem' }}>
                    <span style={{ fontWeight: 600 }}>Overall Execution & Prep Progress</span>
                    <strong style={{ color: selectedOrder.progress_percentage >= 100 ? 'var(--success)' : 'var(--brand)' }}>
                      {selectedOrder.progress_percentage}% Complete
                    </strong>
                  </div>
                  <div style={{ height: 10, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{
                      width: `${selectedOrder.progress_percentage}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, var(--brand), #818cf8)',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                </div>
              </div>

              {/* Stage 4: Requirements Checklist Section */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText size={18} color="var(--brand)" />
                      Stage 4 — Requirements & Documents Checklist
                    </h3>
                    <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                      Submit required deposits, signed contracts, and venue permits for coordinator sign-off
                    </p>
                  </div>
                  <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>
                    {selectedOrder.requirements?.filter(r => r.status === 'approved').length || 0} / {selectedOrder.requirements?.length || 0} Approved
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {selectedOrder.requirements?.map((req) => (
                    <div
                      key={req.requirement_id}
                      style={{
                        padding: '1rem',
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
                      <div style={{ flex: 1, minWidth: 240 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{req.title}</span>
                          <span className={`badge ${
                            req.status === 'approved' ? 'badge-success' :
                            req.status === 'submitted' ? 'badge-info' :
                            req.status === 'rejected' ? 'badge-danger' : 'badge-warning'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                          {req.description}
                        </p>

                        {req.submission_notes && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.4rem' }}>
                            <em>Submitted notes: {req.submission_notes}</em>
                          </div>
                        )}

                        {req.review_remarks && (
                          <div style={{
                            marginTop: '0.4rem', padding: '0.35rem 0.6rem', borderRadius: 4,
                            background: req.status === 'approved' ? 'var(--success-dim)' : 'var(--danger-dim)',
                            fontSize: '0.74rem', color: req.status === 'approved' ? 'var(--success)' : 'var(--danger)'
                          }}>
                            <strong>Review feedback:</strong> {req.review_remarks}
                          </div>
                        )}
                      </div>

                      <div>
                        {req.status === 'approved' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)', fontSize: '0.8rem', fontWeight: 600 }}>
                            <CheckCircle size={18} /> Verified
                          </div>
                        ) : (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenReqModal(req)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                          >
                            <UploadCloud size={15} />
                            {req.status === 'submitted' ? 'Re-upload / Edit' : 'Submit Requirement'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stage 5: Execution Milestones Timeline */}
              <div className="card">
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={18} color="var(--info)" />
                  Stage 5 — Event Preparation Milestones
                </h3>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  Live progress updates logged by the catering operations team
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {selectedOrder.milestones?.map((m, idx) => {
                    const isDone = m.status === 'completed';
                    const isInProgress = m.status === 'in_progress';
                    return (
                      <div
                        key={m.milestone_id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '1rem',
                          padding: '0.875rem',
                          borderRadius: 'var(--r-md)',
                          background: isDone ? 'rgba(34,197,94,0.05)' : isInProgress ? 'rgba(99,102,241,0.05)' : 'var(--surface-2)',
                          border: `1px solid ${isDone ? 'rgba(34,197,94,0.2)' : isInProgress ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`
                        }}
                      >
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: isDone ? 'var(--success)' : isInProgress ? 'var(--brand)' : 'var(--border)',
                          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800, fontSize: '0.82rem', flexShrink: 0
                        }}>
                          {isDone ? '✓' : idx + 1}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{m.milestone_name}</span>
                            <span className={`badge ${isDone ? 'badge-success' : isInProgress ? 'badge-info' : 'badge-secondary'}`}>
                              {m.status.replace('_', ' ')} (+{m.weight_percentage}%)
                            </span>
                          </div>

                          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0.4rem' }}>
                            {m.description}
                          </p>

                          {m.notes && (
                            <div style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.03)', padding: '0.3rem 0.6rem', borderRadius: 4, color: 'var(--text-subtle)' }}>
                              <strong>Staff update:</strong> {m.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stage 6: Evaluation & Closeout */}
              <div className="card" style={{ border: selectedOrder.evaluation ? '1px solid var(--border)' : '1px solid rgba(245,158,11,0.3)' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={18} color="var(--warning)" />
                  Stage 6 — Post-Event Evaluation & Satisfaction Closeout
                </h3>

                {selectedOrder.evaluation ? (
                  <div style={{
                    marginTop: '0.875rem', padding: '1.25rem', background: 'var(--surface-2)',
                    borderRadius: 'var(--r-md)', display: 'flex', flexDirection: 'column', gap: '0.75rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)' }}>
                      <CheckCircle size={18} />
                      <strong style={{ fontSize: '0.95rem' }}>Event Officially Closed & Evaluated</strong>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginTop: '0.25rem' }}>
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
                      <div style={{ fontSize: '0.82rem', marginTop: '0.25rem', color: 'var(--text-subtle)' }}>
                        <strong>Your Testimonial:</strong> "{selectedOrder.evaluation.feedback_comments}"
                      </div>
                    )}
                  </div>
                ) : selectedOrder.progress_percentage >= 100 || selectedOrder.status === 'completed' ? (
                  <form onSubmit={handleSubmitEvaluation} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                      The catering service has completed! Please rate your experience across all 4 key metrics to finalize the event closeout.
                    </p>

                    {evalMessage && (
                      <div style={{
                        background: 'var(--success-dim)', border: '1px solid rgba(34,197,94,0.3)',
                        color: 'var(--success)', padding: '0.75rem', borderRadius: 'var(--r-md)', fontSize: '0.85rem'
                      }}>
                        {evalMessage}
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                      {[
                        { key: 'food_quality_rating', label: 'Food Taste & Quality' },
                        { key: 'service_staff_rating', label: 'Crew & Staff Service' },
                        { key: 'punctuality_rating', label: 'Punctuality & Setup' },
                        { key: 'overall_rating', label: 'Overall Experience' }
                      ].map((crit) => (
                        <div key={crit.key} className="form-group">
                          <label className="form-label" style={{ fontSize: '0.78rem' }}>{crit.label}</label>
                          <select
                            className="form-control"
                            value={evalForm[crit.key]}
                            onChange={(e) => setEvalForm({ ...evalForm, [crit.key]: parseInt(e.target.value) })}
                          >
                            <option value={5}>⭐⭐⭐⭐⭐ 5 - Outstanding</option>
                            <option value={4}>⭐⭐⭐⭐ 4 - Good</option>
                            <option value={3}>⭐⭐⭐ 3 - Average</option>
                            <option value={2}>⭐⭐ 2 - Poor</option>
                            <option value={1}>⭐ 1 - Unsatisfactory</option>
                          </select>
                        </div>
                      ))}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Client Feedback Comments & Suggestions</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Tell us what you liked about the dishes, staff responsiveness, and event execution..."
                        value={evalForm.feedback_comments}
                        onChange={(e) => setEvalForm({ ...evalForm, feedback_comments: e.target.value })}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={evalSubmitting}
                      style={{ alignSelf: 'flex-start' }}
                    >
                      {evalSubmitting ? 'Submitting...' : 'Submit Evaluation & Close Event'}
                    </button>
                  </form>
                ) : (
                  <div style={{
                    marginTop: '0.75rem', padding: '1rem', background: 'var(--surface-2)',
                    borderRadius: 'var(--r-md)', color: 'var(--text-muted)', fontSize: '0.82rem'
                  }}>
                    Evaluation will unlock once all event preparation & service milestones reach 100% completion.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.875rem' }}>📋</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No Event Selected</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: 360, margin: '0.5rem auto 1.25rem' }}>
                Select an active event from the list or submit a new inquiry proposal above to begin tracking.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Requirement Submission Modal */}
      {activeReqModal && (
        <div className="modal-overlay" onClick={() => setActiveReqModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h3 className="modal-title">{activeReqModal.title}</h3>
              <button className="btn-icon" onClick={() => setActiveReqModal(null)}>✕</button>
            </div>

            {reqMessage && (
              <div style={{
                background: reqMessage.includes('success') ? 'var(--success-dim)' : 'var(--danger-dim)',
                padding: '0.75rem', borderRadius: 'var(--r-md)', marginBottom: '1rem', fontSize: '0.85rem'
              }}>
                {reqMessage}
              </div>
            )}

            <form onSubmit={handleSubmitRequirement} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                {activeReqModal.description}
              </p>

              <div className="form-group">
                <label className="form-label">Upload Document / Proof Photo (Optional)</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) => setReqFile(e.target.files[0])}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Submission Notes / Reference No. / Remarks</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Enter payment reference number, dietary details, or ingress pass details..."
                  value={reqNotes}
                  onChange={(e) => setReqNotes(e.target.value)}
                  required={!reqFile}
                />
              </div>

              <div className="modal-footer" style={{ padding: 0 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveReqModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={reqSubmitting}>
                  {reqSubmitting ? 'Uploading...' : 'Submit for Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Booking Request Modal */}
      <NewBookingRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSuccess={fetchWorkflowData}
      />
    </div>
  );
};

export default CustomerEventTracker;
