import React from 'react';
import { render, screen, waitFor, fireEvent, cleanup, act } from '@testing-library/react';
import VehicleOperations from './VehicleOperations';
import api from '../services/api';
let mockAccess;
jest.mock('../context/AuthContext', () => ({ useAuth: () => mockAccess }));
jest.mock('react-hot-toast', () => ({ __esModule: true, default: { success: jest.fn(), error: jest.fn() } }));
jest.mock('../services/api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn(), defaults: { baseURL: 'http://localhost:5002/api' } } }));
const summary = { service: { totalCost: 100, monthlyCost: 100, count: 1 }, fuel: { totalCost: 100, monthlyCost: 100, liters: 10, count: 1, averageKmPerLiter: 10 } };
beforeEach(() => {
  jest.clearAllMocks();
  api.get.mockResolvedValue({ data: { data: [{ _id: 'record1', date: '2026-01-01', category: 'Service', description: 'Oil change', odometer: 1000, cost: 100, liters: 10, fullTank: true, receiptName: 'bill.pdf' }], summary, pagination: { page: 1, pages: 1, total: 1 } } });
  api.post.mockResolvedValue({ data: {} });
});
afterEach(cleanup);
test('viewer can read service history and bill without mutation controls', async () => {
  mockAccess = { canEdit: false, isAdmin: false };
  render(<VehicleOperations vehicle={{ _id: 'vehicle1' }} kind="service" />);
  await screen.findByText('Oil change');
  expect(screen.queryByRole('button', { name: 'Add Service Record' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Remove' })).toBeNull();
  expect(screen.getByRole('link', { name: 'Receipt' }).getAttribute('href')).toBe('http://localhost:5002/api/operations/vehicle1/service/record1/receipt');
});
test('editor submits full-tank fuel data and cannot remove records', async () => {
  mockAccess = { canEdit: true, isAdmin: false };
  render(<VehicleOperations vehicle={{ _id: 'vehicle1' }} kind="fuel" />);
  await screen.findByRole('button', { name: 'Edit' });
  expect(screen.queryByRole('button', { name: 'Remove' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Add Fuel Record' }));
  fireEvent.change(screen.getByLabelText('Odometer (km)'), { target: { value: '1500' } });
  fireEvent.change(screen.getByLabelText('Total cost (LKR)'), { target: { value: '9000' } });
  fireEvent.change(screen.getByLabelText('Fuel quantity (litres)'), { target: { value: '30' } });
  fireEvent.click(screen.getByLabelText('Full tank'));
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Save Fuel Record' })); });
  await waitFor(() => expect(api.post).toHaveBeenCalled());
  expect(api.post.mock.calls[0][0]).toBe('/operations/vehicle1/fuel');
  expect(api.post.mock.calls[0][1].requestId).toMatch(/^[a-f0-9-]{36}$/i);
  expect(api.post.mock.calls[0][1]).toMatchObject({ fullTank: true, liters: '30', odometer: '1500', cost: '9000' });
});
test('archived history is read-only even for Admin', async () => {
  mockAccess = { canEdit: true, isAdmin: true };
  render(<VehicleOperations vehicle={{ _id: 'vehicle1', archivedAt: '2026-01-01' }} kind="service" />);
  await screen.findByText('Oil change');
  expect(screen.queryByRole('button', { name: 'Add Service Record' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Remove' })).toBeNull();
});
