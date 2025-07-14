import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Force rebuild with API URL fixes - $(date)
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
