
// api.js FINAL
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.watrix.online/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const storage = localStorage.getItem('auth-storage');
    if (storage) {
      const { state } = JSON.parse(storage);
      if (state?.token) config.headers.Authorization = `Bearer ${state.token}`;
    }
  }
  return config;
});

// WAHA DEFAULT SESSION ONLY
export const wahaAPI = {
  createDefault: () => api.post('/waha/sessions/default'),
  startDefault: () => api.post('/waha/sessions/default/start'),
  deleteDefault: () => api.delete('/waha/sessions/default'),
  getStatus: () => api.get('/waha/sessions/default/status'),
  getQR: () => api.get('/waha/sessions/default/qr'),
};

export default api;
