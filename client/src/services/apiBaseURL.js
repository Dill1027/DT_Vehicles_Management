// Hosted requests stay on the frontend origin so browsers can retain the
// HttpOnly session cookie. Vercel forwards /api to the backend.
export function apiBaseURL(hostname, configuredURL) {
  const local = hostname === 'localhost' || hostname === '127.0.0.1';
  return local ? configuredURL || 'http://localhost:5002/api' : '/api';
}
