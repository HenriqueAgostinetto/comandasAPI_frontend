// Henrique Agostinetto Piva
import axios from 'axios';
import { BASE_URL, TIMEOUT, API_ENDPOINTS } from '../config/apiConfig';

const { AUTH } = API_ENDPOINTS;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('access_token') || localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = sessionStorage.getItem('refresh_token') || localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await api.post(AUTH.REFRESH, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token, token_type, expires_in, refresh_expires_in } = response.data;

          sessionStorage.setItem('access_token', access_token);
          sessionStorage.setItem('refresh_token', refresh_token);
          sessionStorage.setItem('token_type', token_type);
          sessionStorage.setItem('expires_in', expires_in);
          sessionStorage.setItem('refresh_expires_in', refresh_expires_in);
          sessionStorage.setItem('loginRealizado', 'true');

          const now = new Date().getTime();
          const expiresAt = now + (expires_in * 1000);
          const refreshExpiresAt = now + (refresh_expires_in * 1000);

          sessionStorage.setItem('expires_at', expiresAt);
          sessionStorage.setItem('refresh_expires_at', refreshExpiresAt);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        sessionStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    } else {
      const errorMessage = error.response?.data?.detail || error.message || 'erro desconhecido';

      error.apiMessage = errorMessage;
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  get: async (url, config = {}) => {
    return api.get(url, config);
  },
  post: async (url, data, config = {}) => {
    return api.post(url, data, config);
  },
  put: async (url, data, config = {}) => {
    return api.put(url, data, config);
  },
  delete: async (url, config = {}) => {
    return api.delete(url, config);
  },
};

export default api;
