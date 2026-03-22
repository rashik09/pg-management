import { createContext, useContext, useState, useEffect } from 'react';
import { getProfile } from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      getProfile()
        .then(data => {
          setUser(data);
        })
        .catch(() => {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_name');
          localStorage.removeItem('user_role');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_name', userData.name);
    localStorage.setItem('user_role', userData.role);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_role');
    setUser(null);
    window.location.href = '/';
  };

  const isOwner = user?.role === 'owner';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isOwner }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
