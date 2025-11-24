import axios from 'axios';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.watrix.online/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔥 INTERCEPTOR: auto tambahkan token
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

/* ======================================
   AUTH API
====================================== */
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

/* ======================================
   CAMPAIGNS API
====================================== */
export const campaignsAPI = {
  getAll: () => api.get('/campaigns'),
  getOne: (id) => api.get(`/campaigns/${id}`),
  create: (data) => api.post('/campaigns', data),
  update: (id, data) => api.put(`/campaigns/${id}`, data),
  send: (id, contactIds) =>
    api.post(`/campaigns/${id}/send`, { contactIds }),
};

/* ======================================
   CONTACTS API
====================================== */
export const contactsAPI = {
  getAll: () => api.get('/contacts'),
  getOne: (id) => api.get(`/contacts/${id}`),
  create: (data) => api.post('/contacts', data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),

  importCsv: (formData) =>
    api.post('/contacts/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

/* ======================================
   MESSAGES API
====================================== */
export const messagesAPI = {
  getAll: () => api.get('/messages'),
  getStats: () => api.get('/messages/stats'),
};

/* ======================================
   WAHA API (DEFAULT SESSION ONLY)
====================================== */
export const wahaAPI = {
  createSession: () => api.post('/waha/sessions', { name: 'default' }),
  start: () => api.post('/waha/sessions/default/start'),
  getQR: () => api.get('/waha/sessions/default/qr'),
  delete: () => api.delete('/waha/sessions/default'),
  status: () => api.get('/waha/sessions/default/status'),
};

/* ======================================
   DASHBOARD API
====================================== */
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getActivity: () => api.get('/dashboard/activity'),
};

export default api;
