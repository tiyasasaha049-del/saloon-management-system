import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('lumina_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('lumina_jwt_token') || '');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const profile = await apiService.getMe();
          setUser(profile);
          localStorage.setItem('lumina_user', JSON.stringify(profile));
        } catch (err) {
          console.warn('[AUTH] Token validation failed:', err);
          // Token invalid or backend offline, fallback to saved user or logout
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (username, password) => {
    const res = await apiService.login(username, password);
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('lumina_jwt_token', res.access_token);
    localStorage.setItem('lumina_user', JSON.stringify(res.user));
    return res.user;
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('lumina_jwt_token');
    localStorage.removeItem('lumina_user');
  };

  const switchRole = (newRole) => {
    if (!user) return;
    const updated = { ...user, role: newRole };
    setUser(updated);
    localStorage.setItem('lumina_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      switchRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
