import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
});

/**
 * Request interceptor — URL'ye göre doğru token'ı seç.
 * /superadmin/... → superadmin token
 * diğerleri → werkstatt token (varsa)
 */
api.interceptors.request.use((config) => {
  const url = config.url || '';
  let token;
  if (url.startsWith('/superadmin')) {
    token = localStorage.getItem('superadmin_token');
  } else {
    token = localStorage.getItem('werkstatt_token');
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Response interceptor — 401'de doğru token'ı temizle + doğru login'e yönlendir.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const path = window.location.pathname;

      if (url.startsWith('/superadmin')) {
        localStorage.removeItem('superadmin_token');
        localStorage.removeItem('superadmin_data');
        if (path.startsWith('/superadmin')) window.location.href = '/superadmin/login';
      } else {
        localStorage.removeItem('werkstatt_token');
        localStorage.removeItem('werkstatt_data');
        if (path.startsWith('/admin') || path === '/onboarding' || path === '/pending') {
          window.location.href = '/admin/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;