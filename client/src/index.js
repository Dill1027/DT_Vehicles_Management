import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Force rebuild with API URL fixes - $(date)
const root = ReactDOM.createRoot(document.getElementById('root'));

// Use StrictMode only in development to avoid double rendering in production
if (process.env.NODE_ENV === 'development') {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  root.render(<App />);
}
