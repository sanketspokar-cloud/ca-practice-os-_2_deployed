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

export const verifyCredentials = (email, password) => {
  return api.post('/api/verify-credentials', null, {
    params: { email, password }
  });
};

export const createClient = (client, email, password) => api.post('/api/clients', client, { params: { email, password } });
export const createTask = (task, email, password) => api.post('/api/tasks', task, { params: { email, password } });
export const createCompliance = (compliance, email, password) => api.post('/api/compliance', compliance, { params: { email, password } });
export const createInvoice = (invoice, email, password) => api.post('/api/invoices', invoice, { params: { email, password } });

export default api;
