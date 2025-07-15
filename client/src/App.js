import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';
import { queryClient } from './services/queryConfig';
// Performance monitoring is auto-initialized on import
// eslint-disable-next-line no-unused-vars
import performanceMonitor from './utils/performanceMonitor';
// Clear any existing localStorage data to start fresh
import './utils/clearStorage';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Vehicles = lazy(() => import('./pages/Vehicles'));
const VehicleDetail = lazy(() => import('./pages/VehicleDetail'));
const AddVehicle = lazy(() => import('./pages/AddVehicle'));
const EditVehicle = lazy(() => import('./pages/EditVehicle'));
const Reports = lazy(() => import('./pages/Reports'));

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="App">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Direct access to dashboard - no authentication required */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="vehicles" element={<Vehicles />} />
                <Route path="vehicles/add" element={<AddVehicle />} />
                <Route path="vehicles/:id" element={<VehicleDetail />} />
                <Route path="vehicles/:id/edit" element={<EditVehicle />} />
                <Route path="reports" element={<Reports />} />
              </Route>
            </Routes>
          </Suspense>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                theme: {
                  primary: '#4aed88',
                },
              },
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
