// Henrique Agostinetto Piva
import { createContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, BASE_URL } from '../config/apiConfig';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const recoveredUser = localStorage.getItem('user');
      return recoveredUser ? JSON.parse(recoveredUser) : null;
    } catch {
      return null;
    }
  });
  const [authenticated, setAuthenticated] = useState(
    () => Boolean(localStorage.getItem('access_token') && localStorage.getItem('user')),
  );
  const loading = false;
  const navigate = useNavigate();

  const login = async (username, password) => {
    try {
      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cpf: username,
          senha: password
        }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();

      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);

        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
        }

        const userResponse = await fetch(`${BASE_URL}${API_ENDPOINTS.AUTH.ME}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${data.access_token}`
          }
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
          setAuthenticated(true);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setAuthenticated(false);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ authenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
