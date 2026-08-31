import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { X, Plus, Trash2, Calendar, MapPin, Users, DollarSign, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

const EVENT_TYPES = [
  'Wedding Reception',
  'Birthday Party',
  'Baptismal / Christening',
  'Corporate Gala / Seminar',
  'Debut Celebration',
  'Family Reunion',
  'Anniversary Dinner',
  'Thanksgiving Gathering',
  'Other Celebration'
];

const NewBookingRequestModal = ({ isOpen, onClose, onSuccess }) => {
  const [services, setServices] = useState([]);
  const [eventType, setEventType] = useState(EVENT_TYPES[0]);
  const [eventDate, setEventDate] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [guestCount, setGuestCount] = useState(50);
  const [specialRequests, setSpecialRequests] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState('');
  const [selectedItems, setSelectedItems] = useState([{ service_id: '', quantity: 1 }]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchServices();
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen]);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data || []);
      if (res.data && res.data.length > 0 && (!selectedItems[0].service_id)) {
        setSelectedItems([{ service_id: res.data[0].service_id, quantity: 1 }]);
      }
    } catch (err) {
      console.error('Failed to load services:', err);
    }
  };

  const handleAddItem = () => {
    if (services.length > 0) {
      setSelectedItems([...selectedItems, { service_id: services[0].service_id, quantity: 1 }]);
    }
  };

  const handleRemoveItem = (index) => {
    const updated = selectedItems.filter((_, i) => i !== index);
    setSelectedItems(updated.length > 0 ? updated : [{ service_id: services[0]?.service_id || '', quantity: 1 }]);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...selectedItems];
    updated[index][field] = field === 'quantity' ? Math.max(1, parseInt(value) || 1) : value;
    setSelectedItems(updated);
  };

  // Calculate estimated total based on selected items
  const calculatedItemsTotal = selectedItems.reduce((sum, item) => {
    const svc = services.find(s => String(s.service_id) === String(item.service_id));
    if (svc) {
      return sum + (parseFloat(svc.base_price) * (item.quantity || 1));
    }
    return sum;
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!eventType || !eventDate || !venueAddress || !guestCount) {
      setErrorMsg('Please fill in all required fields (event type, date, venue, guest count).');
      return;
    }

    const validItems = selectedItems.filter(it => it.service_id);
    if (validItems.length === 0) {
      setErrorMsg('Please select at least one catering package or service.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        event_type: eventType,
        event_date: eventDate,
        venue_address: venueAddress,
        guest_count: parseInt(guestCount),
        special_requests: specialRequests,
        estimated_budget: parseFloat(estimatedBudget) || calculatedItemsTotal,
        items: validItems
      };

      const res = await api.post('/workflow/requests', payload);
      setSuccessMsg(`Inquiry ${res.data.request_no} submitted successfully! Our event coordinators will review it.`);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit booking inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 720, maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--r-md)',
              background: 'linear-gradient(135deg, var(--brand), #818cf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="modal-title" style={{ fontSize: '1.15rem' }}>Submit Event Inquiry & Proposal</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Stage 1 — Submit your event details for catering coordinator review
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        {errorMsg && (
          <div style={{
            background: 'var(--danger-dim)', border: '1px solid rgba(239,68,68,0.3)',
            color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: 'var(--r-md)',
            marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem'
          }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            background: 'var(--success-dim)', border: '1px solid rgba(34,197,94,0.3)',
            color: 'var(--success)', padding: '0.75rem 1rem', borderRadius: 'var(--r-md)',
            marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem'
          }}>
            <CheckCircle size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Event Occasion / Type *</label>
              <select
                className="form-control"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                required
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Target Event Date *</label>
              <input
                type="date"
                className="form-control"
                value={eventDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setEventDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Venue / Complete Event Address *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Grand Ballroom, 123 Rizal Ave, Quezon City"
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Expected Guests *</label>
              <input
                type="number"
                min="10"
                max="5000"
                className="form-control"
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Service & Package Selection */}
          <div className="card" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <label className="form-label" style={{ margin: 0, fontWeight: 700, color: 'var(--text)' }}>
                Requested Packages & Add-on Services
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
              >
                <Plus size={14} /> Add Service
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {selectedItems.map((item, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'center' }}>
                  <select
                    className="form-control"
                    value={item.service_id}
                    onChange={(e) => handleItemChange(idx, 'service_id', e.target.value)}
                    required
                  >
                    {services.map((s) => (
                      <option key={s.service_id} value={s.service_id}>
                        {s.service_name} (₱{parseFloat(s.base_price).toLocaleString()} / {s.unit})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                    placeholder="Qty"
                    required
                  />

                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>
                    ₱{(() => {
                      const svc = services.find(s => String(s.service_id) === String(item.service_id));
                      return svc ? (parseFloat(svc.base_price) * item.quantity).toLocaleString() : '0';
                    })()}
                  </div>

                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => handleRemoveItem(idx)}
                    style={{ color: 'var(--danger)', padding: '0.25rem' }}
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{
              display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
              gap: '0.5rem', marginTop: '0.75rem', paddingTop: '0.5rem',
              borderTop: '1px solid var(--border)', fontSize: '0.85rem'
            }}>
              <span style={{ color: 'var(--text-muted)' }}>Estimated Package Total:</span>
              <strong style={{ color: 'var(--brand)', fontSize: '1rem' }}>
                ₱{calculatedItemsTotal.toLocaleString()}
              </strong>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Client Budget Ceiling (Optional)</label>
              <input
                type="number"
                className="form-control"
                placeholder={calculatedItemsTotal ? `e.g. ${calculatedItemsTotal}` : 'e.g. 50000'}
                value={estimatedBudget}
                onChange={(e) => setEstimatedBudget(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Theme / Special Dietary Requests</label>
              <textarea
                className="form-control"
                rows="2"
                placeholder="e.g. Rustic floral theme, Halal-friendly options, No seafood allergy considerations"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: '0.5rem', padding: 0 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: 160 }}>
              {loading ? 'Submitting...' : 'Submit Inquiry Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewBookingRequestModal;
