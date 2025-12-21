import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUserLoggedIn = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // Fetch user profile from /auth/me
      const response = await api.get('/auth/me');
      if (response && response.data) {
        setUser({
          email: response.data.email,
          role: response.data.role,
        });
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response && response.data) {
        const { token, email: userEmail, role } = response.data;
        localStorage.setItem('token', token);
        setUser({ email: userEmail, role });
        return response.data;
      }
      throw new Error('Invalid login response structure');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, phone, role) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', { name, email, password, phone, role });
      if (response && response.data) {
        const { token, email: userEmail, role: userRole } = response.data;
        localStorage.setItem('token', token);
        setUser({ email: userEmail, role: userRole });
        return response.data;
      }
      throw new Error('Invalid registration response structure');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    checkMe: checkUserLoggedIn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
