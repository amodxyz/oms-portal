import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'https://oms-portal-backend.vercel.app/api';

const api = axios.create({
  baseURL: BASE_URL,
});

export default api;
