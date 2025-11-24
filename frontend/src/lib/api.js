import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.watrix.online/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const storage = localStorage.getItem('auth-storage');
    if (storage) {
      const { state } = JSON.parse(storage);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    }
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// Campaigns API
export const campaignsAPI = {
  getAll: () => api.get('/campaigns'),
  getOne: (id) => api.get(`/campaigns/${id}`),
  create: (data) => api.post('/campaigns', data),
  update: (id, data) => api.put(`/campaigns/${id}`, data),
  send: (id, contactIds) => api.post(`/campaigns/${id}/send`, { contactIds }),
};

// Contacts API
export const contactsAPI = {
  getAll: () => api.get('/contacts'),
  getOne: (id) => api.get(`/contacts/${id}`),
  create: (data) => api.post('/contacts', data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
  importCsv: (formData) => api.post('/contacts/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// Messages API
export const messagesAPI = {
  getAll: () => api.get('/messages'),
  getStats: () => api.get('/messages/stats'),
};

// WAHA API (single default session in free mode)
export const wahaAPI = {
  // Backend will emulate a single default session
  getSessions: () => api.get('/waha/sessions'),
  // If sessionName is empty, backend will use 'default'
  createSession: (sessionName) => api.post('/waha/sessions', { name: sessionName || 'default' }),
  getQR: (sessionName = 'default') => api.get(`/waha/sessions/${sessionName}/qr`),
  getStatus: (sessionName = 'default') => api.get(`/waha/sessions/${sessionName}/status`),
  deleteSession: (sessionName = 'default') => api.delete(`/waha/sessions/${sessionName}`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getActivity: () => api.get('/dashboard/activity'),
};

export default api;
