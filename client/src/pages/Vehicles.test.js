import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Vehicles from './Vehicles';
import { vehicleService } from '../services/vehicleService';
import { useAuth } from '../context/AuthContext';
jest.mock('../services/vehicleService', () => ({ vehicleService: { getAllVehicles: jest.fn() } }));
jest.mock('../context/AuthContext', () => ({ useAuth: jest.fn() }));
const date = days => new Date(Date.now() + days * 86400000).toISOString();
const setup = async (permissions = {}) => {
  useAuth.mockReturnValue(permissions);
  vehicleService.getAllVehicles.mockResolvedValue({ data: [
    { _id: 'a', vehicleNumber: 'EXPIRED', licenseExpiry: date(-2) },
    { _id: 'b', vehicleNumber: 'SOON', insuranceExpiry: date(3) },
    { _id: 'c', vehicleNumber: 'LATER', insuranceExpiry: date(20) },
    { _id: 'd', vehicleNumber: 'NO-DATE' },
  ] });
  const result = render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Vehicles /></MemoryRouter>);
  await screen.findByText('4 vehicles found');
  return result;
};
test('expiry filters show counts, select upcoming vehicles and can be removed', async () => {
  const { container } = await setup();
  expect(container.querySelector('.fleet-card-expired')).toHaveTextContent('EXPIRED');
  expect(container.querySelectorAll('.fleet-card-soon')).toHaveLength(2);
  expect(screen.getByRole('button', { name: /Next 7 days/ })).toHaveTextContent('1');
  fireEvent.click(screen.getByRole('button', { name: /Next 7 days/ }));
  expect(screen.getByText('1 vehicles found')).toBeInTheDocument();
  expect(container.querySelector('.fleet-vehicle-grid')).toHaveTextContent('SOON');
  expect(container.querySelector('.fleet-vehicle-grid')).not.toHaveTextContent('EXPIRED');
  fireEvent.click(screen.getByRole('button', { name: 'Remove filter Next 7 days' }));
  expect(screen.getByText('4 vehicles found')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Grid size'), { target: { value: 'compact' } });
  expect(container.querySelector('.fleet-grid-compact')).toBeInTheDocument();
});
test('search chips clear the search and mobile add action respects permissions', async () => {
  const { container } = await setup({ canEdit: true });
  expect(container.querySelector('.fleet-mobile-add')).toHaveAttribute('href', '/vehicles/add');
  fireEvent.change(screen.getByRole('textbox', { name: 'Search vehicles' }), { target: { value: 'SOON' } });
  expect(screen.getByText('1 vehicles found')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Remove filter Search: SOON' }));
  await waitFor(() => expect(screen.getByText('4 vehicles found')).toBeInTheDocument());
});
test('viewer does not receive a mobile add action', async () => {
  const { container } = await setup({ canEdit: false });
  expect(container.querySelector('.fleet-mobile-add')).toBeNull();
});
