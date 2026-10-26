import { vehicleService } from './backendVehicleService';
import api from './api';
jest.mock('./api', () => ({ __esModule: true, default: { get: jest.fn(), defaults: { baseURL: 'http://localhost:5002/api/' } } }));
test('fleet records use separate image URLs instead of embedded image data', async () => {
  api.get.mockResolvedValue({ data: { data: [{ _id: 'vehicle-1', hasImage: true, updatedAt: '2026-10-26' }, { _id: 'vehicle-2', hasImage: false }] } });
  const response = await vehicleService.getAllVehicles();
  expect(response.data[0].imageUrl).toBe('http://localhost:5002/api/vehicles/vehicle-1/image?v=2026-10-26');
  expect(response.data[1].imageUrl).toBeUndefined();
});

test('detail photo and document URLs resolve against the backend', async () => {
  api.get.mockResolvedValue({ data: { data: { _id: 'vehicle-1', vehicleImages: ['/uploads/users/photo.jpg'], documents: [{ name: 'Insurance', url: '/uploads/users/policy.pdf' }] } } });
  const response = await vehicleService.getVehicleById('vehicle-1');
  expect(response.data.vehicleImages[0]).toBe('http://localhost:5002/uploads/users/photo.jpg');
  expect(response.data.documents[0].url).toBe('http://localhost:5002/uploads/users/policy.pdf');
});
