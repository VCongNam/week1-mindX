import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || '/api';

  // Setup axios interceptor to add token to requests
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch current user
  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Login - redirect to authorization URL
  const login = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/login`);
      const { authUrl } = response.data;
      window.location.href = authUrl;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  // Handle callback - exchange code for token
  const handleCallback = async (code) => {
    try {
      const response = await axios.post(`${API_URL}/auth/callback`, { code });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error('Callback failed:', error);
      throw error;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    handleCallback
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
