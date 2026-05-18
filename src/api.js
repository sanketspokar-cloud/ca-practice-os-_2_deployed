import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
});

export const getData = () => api.get('/api/data');
export const getClients = () => api.get('/api/clients');
export const getTasks = () => api.get('/api/tasks');
export const getCompliance = () => api.get('/api/compliance');
export const getInvoices = () => api.get('/api/invoices');
export const getRevenue = () => api.get('/api/revenue');
export const getTeam = () => api.get('/api/team');

export const uploadData = (file, email, password) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/api/upload-data', formData, {
    params: { email, password },
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const verifyCredentials = (email, password) => {
  return api.post('/api/verify-credentials', null, {
    params: { email, password }
  });
};

export default api;
