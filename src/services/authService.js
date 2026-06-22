import { API_ENDPOINTS } from '../config/apiConfig';
import api from './api';

const { AUTH } = API_ENDPOINTS;

export const authService = {

  login: async (cpf, senha) => {
    try {
      const response = await api.post(AUTH.LOGIN, {
        cpf: cpf.replace(/\D/g, ''),
        senha: senha,
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

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'erro ao realizar login',
      };
    }
  },

  getUserData: async () => {
    try {
      const response = await api.get(AUTH.ME);
      return response.data;
    } catch (error) {
      return null;
    }
  },

  logout: () => {
    sessionStorage.clear();
    window.location.href = '/login';
  },

  isAuthenticated: () => {
    const token = sessionStorage.getItem('access_token');
    const expiresAt = sessionStorage.getItem('expires_at');

    if (!token || !expiresAt) {
      return false;
    }

    const now = new Date().getTime();
    return now < parseInt(expiresAt);
  },

  isTokenExpiringSoon: () => {
    const expiresAt = sessionStorage.getItem('expires_at');
    if (!expiresAt) return true;

    const now = new Date().getTime();
    const fiveMinutes = 5 * 60 * 1000;
    return now > (parseInt(expiresAt) - fiveMinutes);
  },
};
