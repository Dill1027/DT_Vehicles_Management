import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
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
  const login = useCallback(async (credentials) => {
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
  }, []);

  // Mock logout function
  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Mock permission check (always returns true for demo)
  const hasPermission = useCallback((permission) => {
    return true; // Allow all actions in demo mode
  }, []);

  // Mock role check (always returns true for admin)
  const hasRole = useCallback((role) => {
    return user?.role === role || user?.role === 'admin';
  }, [user?.role]);

  // Mock admin check (demo user is always admin)
  const isAdmin = useCallback(() => {
    return user?.role === 'admin';
  }, [user?.role]);

  // Mock update user function
  const updateUser = useCallback((userData) => {
    setUser(prevUser => ({ ...prevUser, ...userData }));
  }, []);

  // Mock clear error function
  const clearError = useCallback(() => {
    // No-op for demo
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    hasPermission,
    hasRole,
    isAdmin,
    updateUser,
    clearError,
    // Add some default user data for demo
    error: null,
    token: 'demo-token'
  }), [user, isAuthenticated, loading, login, logout, hasPermission, hasRole, isAdmin, updateUser, clearError]);

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
