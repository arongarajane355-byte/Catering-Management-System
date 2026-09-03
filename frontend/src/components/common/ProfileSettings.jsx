import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, CheckCircle2, AlertCircle, User, KeyRound } from 'lucide-react';

const ProfileSettings = () => {
  const { user, fetchCurrentUser } = useAuth();
  const [profileForm, setProfileForm] = useState({
    customer_no: '',
    lastname: '',
    middlename: '',
    firstname: '',
    gender: 'Male',
    age: 25,
    contact_number: '',
    email: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ text: '', isError: false });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        customer_no: user.customer_no || (user.user_id ? `USR-${String(user.user_id).padStart(4, '0')}` : ''),
        lastname: user.lastname || '',
        middlename: user.middlename || '',
        firstname: user.firstname || '',
        gender: user.gender || 'Male',
        age: user.age || 25,
        contact_number: user.contact_number || '',
        email: user.email || '',
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ text: '', isError: false });

    const fn = profileForm.firstname.trim();
    const ln = profileForm.lastname.trim();
    const email = profileForm.email.trim().toLowerCase();
    const contact = profileForm.contact_number.trim();
    const ageVal = parseInt(profileForm.age, 10);

    if (!fn || !ln || !email || !contact || isNaN(ageVal)) {
      setProfileMsg({ text: 'Please fill in all required profile fields.', isError: true });
      return;
    }

    if (!email.endsWith('@gmail.com')) {
      setProfileMsg({ text: 'Email address must use @gmail.com domain.', isError: true });
      return;
    }

    if (contact.length !== 11 || !/^\d{11}$/.test(contact)) {
      setProfileMsg({ text: 'Contact Number must be exactly 11 digits (e.g. 09123456789).', isError: true });
      return;
    }

    const cp = profileForm.current_password.trim();
    const np = profileForm.new_password.trim();
    const confP = profileForm.confirm_password.trim();

    if (cp || np || confP) {
      if (!cp || !np || !confP) {
        setProfileMsg({
          text: 'To change password, please fill in Current Password, New Password, and Confirm New Password.',
          isError: true
        });
        return;
      }

      if (np !== confP) {
        setProfileMsg({
          text: 'New Password and Confirmed Change Password do not match.',
          isError: true
        });
        return;
      }

      if (np.length < 6) {
        setProfileMsg({
          text: 'New password must be at least 6 characters long.',
          isError: true
        });
        return;
      }
    }

    setSubmitting(true);

    try {
      await api.put('/auth/profile', {
        firstname: fn,
        middlename: profileForm.middlename ? profileForm.middlename.trim() : null,
        lastname: ln,
        gender: profileForm.gender,
        age: ageVal,
        contact_number: contact,
        email: email,
        current_password: cp || undefined,
        new_password: np || undefined,
        confirm_password: confP || undefined
      });

      setProfileMsg({ text: 'Profile settings and password updated successfully!', isError: false });
      setProfileForm(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: ''
      }));

      if (fetchCurrentUser) {
        await fetchCurrentUser();
      }
    } catch (err) {
      setProfileMsg({
        text: err.response?.data?.message || 'Failed to update profile settings.',
        isError: true
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card p-6" style={{ maxWidth: '720px' }}>
      <div className="section-header mb-6">
        <div>
          <h2 className="section-title" style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={22} className="text-brand" /> Profile &amp; Account Settings
          </h2>
          <p className="section-subtitle">
            Update your personal identification details, email address, and account credentials
          </p>
        </div>
      </div>

      {profileMsg.text && (
        <div className={`alert ${profileMsg.isError ? 'alert-error' : 'alert-success'}`} style={{ marginBottom: '1.25rem' }}>
          {profileMsg.isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{profileMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile}>
        {/* Account Identifier Badge */}
        {profileForm.customer_no && (
          <div className="form-group mb-4">
            <label className="form-label">
              Account No.
            </label>
            <input
              type="text"
              className="form-input"
              value={profileForm.customer_no}
              readOnly
              style={{ fontWeight: 700, color: 'var(--brand)', background: 'var(--bg-elevated)', cursor: 'not-allowed', width: '220px' }}
            />
          </div>
        )}

        {/* Personal Details */}
        <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="prof-lastname">
              Last Name <span style={{ color: 'var(--danger, #ef4444)' }}>*</span>
            </label>
            <input
              id="prof-lastname"
              type="text"
              className="form-input"
              value={profileForm.lastname}
              onChange={(e) => setProfileForm({ ...profileForm, lastname: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="prof-firstname">
              First Name <span style={{ color: 'var(--danger, #ef4444)' }}>*</span>
            </label>
            <input
              id="prof-firstname"
              type="text"
              className="form-input"
              value={profileForm.firstname}
              onChange={(e) => setProfileForm({ ...profileForm, firstname: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="prof-middlename">
            Middle Name <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(Optional)</span>
          </label>
          <input
            id="prof-middlename"
            type="text"
            className="form-input"
            value={profileForm.middlename}
            onChange={(e) => setProfileForm({ ...profileForm, middlename: e.target.value })}
          />
        </div>

        <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="prof-gender">
              Gender <span style={{ color: 'var(--danger, #ef4444)' }}>*</span>
            </label>
            <select
              id="prof-gender"
              className="form-select"
              value={profileForm.gender}
              onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
              required
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="prof-age">
              Age <span style={{ color: 'var(--danger, #ef4444)' }}>*</span>
            </label>
            <input
              id="prof-age"
              type="number"
              className="form-input"
              value={profileForm.age}
              onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
              min="1"
              max="120"
              required
            />
          </div>
        </div>

        <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="prof-contact">
              Contact Number <span style={{ color: 'var(--danger, #ef4444)' }}>*</span>
            </label>
            <input
              id="prof-contact"
              type="tel"
              inputMode="numeric"
              maxLength={11}
              pattern="[0-9]{11}"
              className="form-input"
              placeholder="e.g. 09123456789"
              value={profileForm.contact_number}
              onChange={(e) => setProfileForm({ ...profileForm, contact_number: e.target.value.replace(/\D/g, '').slice(0, 11) })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="prof-email">
              Email Address <span style={{ color: 'var(--danger, #ef4444)' }}>*</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--brand)', marginLeft: '6px', fontWeight: 600 }}>Must use @gmail.com</span>
            </label>
            <input
              id="prof-email"
              type="email"
              className="form-input"
              placeholder="user@gmail.com"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Change Password Subsection */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <KeyRound size={16} style={{ color: 'var(--brand)' }} /> Change Password
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Leave fields blank if you do not wish to change your password.
          </p>

          {/* Current Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="prof-current-password">Current Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="prof-current-password"
                type={showCurrentPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Enter current password"
                value={profileForm.current_password}
                onChange={(e) => setProfileForm({ ...profileForm, current_password: e.target.value })}
                style={{ paddingRight: '2.75rem' }}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(v => !v)}
                style={{
                  position: 'absolute', right: '0.75rem', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', padding: 0
                }}
                aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
              >
                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
            {/* New Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="prof-new-password">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="prof-new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter new password"
                  value={profileForm.new_password}
                  onChange={(e) => setProfileForm({ ...profileForm, new_password: e.target.value })}
                  style={{ paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(v => !v)}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', padding: 0
                  }}
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="prof-confirm-password">Confirmed Change Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="prof-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Confirm new password"
                  value={profileForm.confirm_password}
                  onChange={(e) => setProfileForm({ ...profileForm, confirm_password: e.target.value })}
                  style={{ paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(v => !v)}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', padding: 0
                  }}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving Changes…' : 'Save Profile Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
