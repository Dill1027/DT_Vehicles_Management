import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import authService from '../services/authService';

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  LOAD_USER: 'LOAD_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        loading: true,
        error: null
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case AUTH_ACTIONS.LOAD_USER:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on app start
  useEffect(() => {
    const loadUser = () => {
      try {
        const token = authService.getToken();
        const user = authService.getCurrentUser();
        
        if (token && user && authService.isAuthenticated()) {
          dispatch({
            type: AUTH_ACTIONS.LOAD_USER,
            payload: { user, token }
          });
        } else {
          // Clear any invalid data and set to logged out state
          authService.logout();
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      } catch (error) {
        console.error('Error loading user:', error);
        // Clear corrupted data and logout
        authService.logout();
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = useCallback(async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });
      
      const { user, token } = await authService.login(credentials);
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token }
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    authService.logout();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  // Update user function
  const updateUser = useCallback((userData) => {
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: userData
    });
    
    // Also update in localStorage if needed
    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...userData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error updating user in localStorage:', error);
    }
  }, []);

  // Check permissions
  const hasPermission = useCallback((permission) => {
    if (!state.user) return false;
    
    // Admin users have all permissions
    if (state.user.role === 'admin') return true;
    
    // Define role-based permissions
    const rolePermissions = {
      admin: ['create_vehicle', 'edit_vehicle', 'delete_vehicle', 'view_vehicle'],
      manager: ['create_vehicle', 'edit_vehicle', 'view_vehicle'],
      mechanic: ['edit_vehicle', 'view_vehicle'],
      user: ['view_vehicle']
    };

    const userPermissions = rolePermissions[state.user.role] || [];
    return userPermissions.includes(permission);
  }, [state.user]);

  // Check role
  const hasRole = useCallback((role) => {
    return state.user?.role === role;
  }, [state.user?.role]);

  // Check if admin
  const isAdmin = useCallback(() => {
    return state.user?.role === 'admin';
  }, [state.user?.role]);

  // Context value
  const value = useMemo(() => ({
    ...state,
    login,
    logout,
    clearError,
    updateUser,
    hasPermission,
    hasRole,
    isAdmin
  }), [state, login, logout, clearError, updateUser, hasPermission, hasRole, isAdmin]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// PropTypes validation
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
