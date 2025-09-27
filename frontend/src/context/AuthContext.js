import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Checking auth state, token found:', !!token);
      
      if (token) {
        // Set authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Decode JWT to get user info (simple decode, not verification)
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('JWT payload:', payload);
        
        // Create user object from JWT payload
        const userData = {
          id: payload.userId,
          email: payload.email,
          role: payload.role || 'customer'
        };
        
        console.log('Setting user from token:', userData);
        setUser(userData);
      } else {
        console.log('No token found');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid token
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = (token) => {
    console.log('Login called with token:', token);
    
    try {
      // Store token
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Decode JWT payload
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Decoded JWT payload:', payload);
      
      // Set user state
      const userData = {
        id: payload.userId,
        email: payload.email,
        role: payload.role || 'customer',
        name: payload.name || payload.email // Fallback to email if no name
      };
      
      console.log('Setting user state:', userData);
      setUser(userData);
      
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    }
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  // Debug logging
  console.log('AuthContext state:', { user: !!user, loading });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};