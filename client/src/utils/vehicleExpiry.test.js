import { compareVehicleExpiry } from './vehicleExpiry';

test('orders expired documents before upcoming documents using either expiry field', () => {
  const vehicles = [
    { id: 'later', insuranceExpiry: '2030-12-01' },
    { id: 'soon', insuranceExpiry: '2030-11-01', licenseExpiry: '2030-10-28' },
    { id: 'expired', insuranceExpiry: '2030-11-01', licenseExpiry: '2030-10-01' },
  ];
  expect(vehicles.sort(compareVehicleExpiry).map(v => v.id)).toEqual(['expired', 'soon', 'later']);
});

test('keeps missing and invalid dates last and preserves equal expiry order', () => {
  const vehicles = [
    { id: 'missing' },
    { id: 'first', licenseExpiry: '2030-10-28' },
    { id: 'invalid', insuranceExpiry: 'invalid', licenseExpiry: null },
    { id: 'second', insuranceExpiry: '2030-10-28' },
  ];
  expect(vehicles.sort(compareVehicleExpiry).map(v => v.id)).toEqual(['first', 'second', 'missing', 'invalid']);
});
