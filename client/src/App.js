import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';
import { queryClient } from './services/queryConfig';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, RequireSession, RequireRoles } from './context/AuthContext';

// Lazy load pages for better performance
const Login = lazy(() => import('./pages/Login'));
const Profile = lazy(() => import('./pages/Profile'));
const Activity = lazy(() => import('./pages/Activity'));
const Users = lazy(() => import('./pages/Users'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Vehicles = lazy(() => import('./pages/Vehicles'));
const VehicleDetail = lazy(() => import('./pages/VehicleDetail'));
const AddVehicle = lazy(() => import('./pages/AddVehicle'));
const EditVehicle = lazy(() => import('./pages/EditVehicle'));
const Reports = lazy(() => import('./pages/Reports'));

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider><Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider><div className="App">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<RequireSession />}>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="vehicles" element={<Vehicles />} />
                  <Route path="vehicles/:id" element={<VehicleDetail />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="profile" element={<Profile />} />
                  <Route element={<RequireRoles roles={['admin', 'editor']} />}>
                    <Route path="vehicles/add" element={<AddVehicle />} />
                    <Route path="vehicles/:id/edit" element={<EditVehicle />} />
                  </Route>
                  <Route element={<RequireRoles roles={['admin']} />}>
                    <Route path="users" element={<Users />} />
                    <Route path="activity" element={<Activity />} />
                    <Route path="archive" element={<Vehicles archived />} />
                  </Route>
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--fleet-surface-raised)',
                color: 'var(--fleet-text)',
                border: '1px solid var(--fleet-border)',
              },
              success: {
                duration: 3000,
                theme: {
                  primary: '#4aed88',
                },
              },
            }}
          />
        </div></AuthProvider>
      </Router></ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
