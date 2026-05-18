import axios from 'axios';

const rawBase = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
const cleanBase = rawBase.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: cleanBase,
});

// Interceptor to inject JWT Authorization Token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const getData = () => api.get('/api/data');
export const getClients = () => api.get('/api/clients');
export const getTasks = () => api.get('/api/tasks');
export const getCompliance = () => api.get('/api/compliance');
export const getInvoices = () => api.get('/api/invoices');
export const getRevenue = () => api.get('/api/revenue');
export const getTeam = () => api.get('/api/team');

export const verifyCredentials = (email, password) => {
  return api.post('/api/verify-credentials', null, {
    params: { email, password }
  });
};

export const createClient = (client) => api.post('/api/clients', client);
export const createTask = (task) => api.post('/api/tasks', task);
export const createCompliance = (compliance) => api.post('/api/compliance', compliance);
export const createInvoice = (invoice) => api.post('/api/invoices', invoice);

export const updateClient = (client) => api.put('/api/clients', client);
export const updateTask = (task) => api.put('/api/tasks', task);
export const updateCompliance = (compliance) => api.put('/api/compliance', compliance);
export const updateInvoice = (invoice) => api.put('/api/invoices', invoice);

export const removeTask = (taskId) => api.delete('/api/tasks', { params: { task_id: taskId } });
export const removeClient = (clientId) => api.delete('/api/clients', { params: { client_id: clientId } });
export const removeCompliance = (complianceId) => api.delete('/api/compliance', { params: { comp_id: complianceId } });
export const removeInvoice = (invoiceId) => api.delete('/api/invoices', { params: { invoice_id: invoiceId } });

export default api;
