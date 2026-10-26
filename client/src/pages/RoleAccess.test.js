import React from 'react';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Vehicles from './Vehicles';
let mockAccess;
jest.mock('../context/AuthContext', () => ({ useAuth: () => mockAccess }));
jest.mock('../services/vehicleService', () => ({ vehicleService: { getAllVehicles: async () => ({ data: [{ _id: 'vehicle1', vehicleNumber: 'TEST-01', make: 'Toyota', type: 'Car', status: 'Active' }] }) } }));
afterEach(cleanup);
for (const role of ['admin', 'editor', 'viewer']) {
  test(`${role} sees only permitted vehicle actions`, async () => {
    mockAccess = { isAdmin: role === 'admin', canEdit: role !== 'viewer' };
    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Vehicles /></MemoryRouter>);
    await waitFor(() => expect(screen.getAllByText('TEST-01').length).toBeGreaterThan(0));
    const add = screen.queryAllByRole('link', { name: 'Add Vehicle' });
    expect(add.length > 0).toBe(role !== 'viewer');
    const actions = screen.queryAllByRole('button', { name: 'Actions for TEST-01' });
    if (role === 'viewer') expect(actions).toHaveLength(0);
    else {
      fireEvent.click(actions[0]);
      expect(screen.getByText('Edit vehicle')).toBeTruthy();
      expect(Boolean(screen.queryByText('Archive vehicle'))).toBe(role === 'admin');
    }
  });
}
