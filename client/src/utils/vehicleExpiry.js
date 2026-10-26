// The earliest document expiry determines which vehicle needs attention first.
export function earliestVehicleExpiry(vehicle) {
  const dates = [vehicle.insuranceExpiry, vehicle.licenseExpiry]
    .filter(Boolean)
    .map(value => new Date(value).getTime())
    .filter(Number.isFinite);
  return dates.length ? Math.min(...dates) : Infinity;
}

export function compareVehicleExpiry(a, b) {
  const first = earliestVehicleExpiry(a);
  const second = earliestVehicleExpiry(b);
  return first === second ? 0 : first < second ? -1 : 1;
}
