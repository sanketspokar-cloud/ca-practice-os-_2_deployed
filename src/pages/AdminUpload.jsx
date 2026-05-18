import React, { useState } from 'react';
import { uploadData, verifyCredentials } from '../api';

export const AdminUpload = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [file, setFile] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus({ type: 'info', message: 'Verifying credentials...' });
    try {
      await verifyCredentials(email, password);
      setIsLoggedIn(true);
      setStatus({ type: '', message: '' });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.detail || 'Invalid credentials' });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setStatus({ type: 'info', message: 'Uploading...' });
    try {
      const res = await uploadData(file, email, password);
      setStatus({ type: 'success', message: res.data.message });
      // Clear sensitive metadata after successful upload as requested
      setFile(null);
      setEmail('');
      setPassword('');
      setIsLoggedIn(false);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.detail || 'Upload failed' });
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <form onSubmit={handleLogin} style={{ background: '#fff', padding: 32, borderRadius: 12, border: '1px solid #F1F5F9', width: 320 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, textAlign: 'center' }}>Admin Login</h2>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required 
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 6 }} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required 
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 6 }} />
          </div>
          <button type="submit" style={{ width: '100%', padding: 10, background: '#6366F1', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>
            Login to Upload
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
      <div style={{ background: '#fff', padding: 32, borderRadius: 12, border: '1px solid #F1F5F9', width: 400 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>Upload Data</h2>
        <p style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 24 }}>Select a JSON file to update the system data.</p>
        
        <form onSubmit={handleUpload}>
          <div style={{ marginBottom: 24, border: '2px dashed #E2E8F0', padding: 40, textAlign: 'center', borderRadius: 12 }}>
            <input type="file" accept=".json" onChange={e => setFile(e.target.files[0])} required id="file-upload" style={{ display: 'none' }} />
            <label htmlFor="file-upload" style={{ cursor: 'pointer', color: '#6366F1', fontWeight: 500 }}>
              {file ? file.name : 'Click to select JSON file'}
            </label>
          </div>

          <button type="submit" style={{ width: '100%', padding: 12, background: '#6366F1', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>
            Transfer to Backend
          </button>
          
          <button type="button" onClick={() => setIsLoggedIn(false)} style={{ width: '100%', marginTop: 12, background: 'none', border: 'none', color: '#64748B', fontSize: 13, cursor: 'pointer' }}>
            Cancel
          </button>
        </form>

        {status.message && (
          <div style={{ marginTop: 20, padding: 12, borderRadius: 6, fontSize: 13, textAlign: 'center',
            background: status.type === 'error' ? '#FEF2F2' : status.type === 'success' ? '#F0FDF4' : '#EFF6FF',
            color: status.type === 'error' ? '#DC2626' : status.type === 'success' ? '#15803D' : '#2563EB',
            border: `1px solid ${status.type === 'error' ? '#FECACA' : status.type === 'success' ? '#BBF7D0' : '#BFDBFE'}`
          }}>
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
};
