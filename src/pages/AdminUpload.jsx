import React, { useState } from 'react';
import { verifyCredentials } from '../api';

export const AdminUpload = ({ adminAuth, setAdminAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus({ type: 'info', message: 'Verifying credentials...' });
    try {
      const res = await verifyCredentials(email, password);
      const token = res.data.token;
      setAdminAuth(token);
      setStatus({ type: '', message: '' });
      setEmail('');
      setPassword('');
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.detail || 'Invalid credentials' });
    }
  };

  const handleLogout = () => {
    setAdminAuth(null);
    setStatus({ type: 'info', message: 'Logged out successfully' });
  };

  if (!adminAuth) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <form onSubmit={handleLogin} style={{ background: '#fff', padding: 32, borderRadius: 12, border: '1px solid #F1F5F9', width: 340, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, textAlign: 'center', color: '#0F172A' }}>Admin Access Portal</h2>
          <p style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 24 }}>Authenticate to unlock editing & creation actions.</p>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required 
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 6, boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required 
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 6, boxSizing: 'border-box' }} />
          </div>
          <button type="submit" style={{ width: '100%', padding: 10, background: '#6366F1', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>
            Verify Credentials
          </button>
          
          {status.message && (
            <div style={{ marginTop: 20, padding: 12, borderRadius: 6, fontSize: 13, textAlign: 'center',
              background: status.type === 'error' ? '#FEF2F2' : status.type === 'success' ? '#F0FDF4' : '#EFF6FF',
              color: status.type === 'error' ? '#DC2626' : status.type === 'success' ? '#15803D' : '#2563EB',
              border: `1px solid ${status.type === 'error' ? '#FECACA' : status.type === 'success' ? '#BBF7D0' : '#BFDBFE'}`
            }}>
              {status.message}
            </div>
          )}
        </form>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div style={{ background: '#fff', padding: 32, borderRadius: 12, border: '1px solid #F1F5F9', width: 420, textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ width: 56, height: 56, background: '#D1FAE5', color: '#059669', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 16px' }}>
          ✓
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: '#0F172A' }}>Admin Mode Activated</h2>
        <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, marginBottom: 24 }}>
          You have successfully authenticated as administrator. Editing, additions, and creation dialog actions are now unlocked across all pages!
        </p>

        <div style={{ background: '#F8FAFC', borderRadius: 8, padding: 16, marginBottom: 24, border: '1px solid #E2E8F0', textAlign: 'left', fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: '#64748B' }}>Authenticated Role:</span>
            <strong style={{ color: '#0F172A' }}>System Administrator</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#64748B' }}>Session Status:</span>
            <strong style={{ color: '#10B981' }}>Active (JWT Validated)</strong>
          </div>
        </div>

        <button onClick={handleLogout} style={{ width: '100%', padding: 12, background: '#EF4444', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>
          Log Out Admin Session
        </button>
      </div>
    </div>
  );
};
