import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
});

export const getData = () => api.get('/data');
export const getClients = () => api.get('/clients');
export const getTasks = () => api.get('/tasks');
export const getCompliance = () => api.get('/compliance');
export const getInvoices = () => api.get('/invoices');
export const getRevenue = () => api.get('/revenue');
export const getTeam = () => api.get('/team');

export const uploadData = (file, email, password) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload-data', formData, {
    params: { email, password },
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const verifyCredentials = (email, password) => {
  return api.post('/verify-credentials', null, {
    params: { email, password }
  });
};

export default api;
