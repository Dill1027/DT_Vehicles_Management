import React from 'react';
import { TruckIcon } from '@heroicons/react/24/outline';
import { Expiry, Status, VehicleActions, formatDate, expiryDays } from './FleetUI';

export default function VehicleCard({ vehicle, onEdit, onDelete, onRestore, onView }) {
  const image = vehicle.vehicleImages?.[0] || vehicle.imageUrl;
  const days = [vehicle.insuranceExpiry, vehicle.licenseExpiry].map(expiryDays).filter(value => value !== null);
  const nearest = days.length ? Math.min(...days) : null;
  const urgency = nearest === null ? '' : nearest < 0 ? 'expired' : nearest <= 30 ? 'soon' : '';
  return <article className={`fleet-vehicle-card fleet-card-${urgency}`}>
    {urgency && <div className={`fleet-card-alert ${urgency}`}><span aria-hidden="true">●</span> {urgency === 'expired' ? 'Document expired' : nearest === 0 ? 'Document expires today' : `Document expires in ${nearest} days`}</div>}
    <button className="fleet-card-image" onClick={() => onView(vehicle)} aria-label={`View ${vehicle.vehicleNumber}`}>
      {image ? <img src={image} alt={`${vehicle.make || ''} ${vehicle.vehicleNumber}`} loading="lazy" /> : <TruckIcon className="h-12 w-12 text-gray-400" />}
    </button>
    <div className="fleet-card-content">
      <div className="flex justify-between gap-2 items-start">
        <div>
          <button className="fleet-vehicle-link" onClick={() => onView(vehicle)}>
            {vehicle.vehicleNumber}
          </button>
          <p className="text-sm text-gray-500 mt-1">
            {[vehicle.make, vehicle.model, vehicle.year].filter(Boolean).join(' · ')}
          </p>
        </div>
        <VehicleActions vehicle={vehicle} onEdit={onEdit} onDelete={onDelete} onRestore={onRestore} />
      </div>
      <div className="flex flex-wrap gap-2 my-4">
        <Status value={vehicle.status} />
        <span className="fleet-badge neutral">
          {vehicle.type}
        </span>
      </div>
      <dl className="fleet-card-facts">
        {vehicle.archivedAt && <div><dt>Archived</dt><dd>{formatDate(vehicle.archivedAt)}</dd></div>}
        <div>
          <dt>Department</dt>
          <dd>
            {vehicle.department || 'Unassigned'}
          </dd>
        </div>
        <div>
          <dt>Fuel</dt>
          <dd>
            {vehicle.fuelType || 'Not set'}
          </dd>
        </div>
        <div>
          <dt>Insurance</dt>
          <dd>
            <Expiry value={vehicle.insuranceExpiry} />
          </dd>
        </div>
        <div>
          <dt>License</dt>
          <dd>
            <Expiry value={vehicle.licenseExpiry} />
          </dd>
        </div>
      </dl>
    </div>
  </article>;
}
