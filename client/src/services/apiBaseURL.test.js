import { apiBaseURL } from './apiBaseURL';
test('hosted API and images use the frontend origin even with a legacy backend URL', () => {
  expect(apiBaseURL('dt-vehicles-frontend.vercel.app', 'https://dt-vehicles-backend.vercel.app/api')).toBe('/api');
  expect(apiBaseURL('fleet.example.com')).toBe('/api');
});
test('local development retains its backend and configured override', () => {
  expect(apiBaseURL('localhost')).toBe('http://localhost:5002/api');
  expect(apiBaseURL('127.0.0.1', 'http://localhost:5003/api')).toBe('http://localhost:5003/api');
});
