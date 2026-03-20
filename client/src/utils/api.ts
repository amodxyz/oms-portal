import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'https://oms-portal-backend.vercel.app/api';

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401 && !window.location.pathname.startsWith('/superadmin')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
