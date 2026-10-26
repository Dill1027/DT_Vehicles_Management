import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import api from '../services/api';
import { queryClient } from '../services/queryConfig';
import LoadingSpinner from '../components/LoadingSpinner';
import { ErrorState } from '../components/FleetUI';
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const refresh = useCallback(async () => {
    setError(false);
    try {
      setUser((await api.get('/auth/me')).data.user);
    }
    catch (failure) {
      if (failure.response?.status === 401) setUser(null); else setError(true);
    }
    finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    refresh();
    const expired = () => {
      queryClient.clear();
      setUser(null);
      setError(false);
    };
    window.addEventListener('fleet-session-expired', expired);
    return () => window.removeEventListener('fleet-session-expired', expired);
  }, [refresh]);
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    setError(false);
    setUser(response.data.user);
    return response.data.user;
  };
  const logout = async () => {
    await api.post('/auth/logout');
    queryClient.clear();
    setUser(null);
  };
  const value = { user, loading, error, refresh, login, logout, setUser, canEdit: ['admin', 'editor'].includes(user?.role), isAdmin: user?.role === 'admin' };
  return <AuthContext.Provider value={value}>
    {children}
  </AuthContext.Provider>;
}

export function RequireSession() {
  const { user, loading, error, refresh } = useAuth();
  const location = useLocation();
  if (loading) return <div className="py-20">
    <LoadingSpinner />
  </div>;
  if (error && !user) return <ErrorState retry={refresh} />;
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}

export function RequireRoles({ roles }) {
  const { user } = useAuth();
  return roles.includes(user?.role) ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
