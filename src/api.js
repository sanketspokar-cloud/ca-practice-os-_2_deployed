import axios from 'axios';

const rawBase = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
const cleanBase = rawBase.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: cleanBase,
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

export const createClient = (client) => api.post('/api/clients', client);
export const createTask = (task) => api.post('/api/tasks', task);
export const createCompliance = (compliance) => api.post('/api/compliance', compliance);
export const createInvoice = (invoice) => api.post('/api/invoices', invoice);

export default api;
