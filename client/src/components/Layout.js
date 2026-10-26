import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';

const Layout = () => {
  return (
    <div className="fleet-app-shell min-h-screen">
      <Navigation />
      <main className="w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
