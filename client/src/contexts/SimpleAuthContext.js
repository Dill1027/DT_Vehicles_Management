import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockUserService } from '../services/mockDataService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Always authenticated for demo

  // Initialize with demo user
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const result = await mockUserService.getCurrentUser();
        setUser(result.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to initialize user:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  // Mock login function (always succeeds)
  const login = async (credentials) => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = await mockUserService.getCurrentUser();
      setUser(result.data);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, message: 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  // Mock logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  // Mock permission check (always returns true for demo)
  const hasPermission = (permission) => {
    return true; // Allow all actions in demo mode
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    hasPermission,
    // Add some default user data for demo
    error: null,
    token: 'demo-token'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
