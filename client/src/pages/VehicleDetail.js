import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, PencilIcon, TruckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { vehicleService } from '../services/vehicleService';
import { useAuth } from '../context/AuthContext';
import VehicleOperations from '../components/VehicleOperations';
import LoadingSpinner from '../components/LoadingSpinner';
import { ErrorState, Expiry, PageHeader, Status, VehicleActions, formatDate, useDialogFocus } from '../components/FleetUI';
function Facts({ entries }) {
  return <dl className="fleet-detail-facts">
    {entries.map(([label, value]) => <div key={label}>
      <dt>
        {label}
      </dt>
      <dd>
        {value ?? 'Not set'}
      </dd>
    </div>)}
  </dl>;
}

export default function VehicleDetail() {
  const { canEdit, isAdmin } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState('overview');
  const [image, setImage] = useState(null);
  const lightboxRef = useRef(null);
  useDialogFocus(image !== null, lightboxRef, () => setImage(null));
  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setVehicle((await vehicleService.getVehicleById(id)).data);
    }
    catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => {
    load();
  }, [load]);
  const onDelete = async () => {
    if (!window.confirm('Archive this vehicle? It can be restored from the Archive page.')) return;
    try {
      await vehicleService.archiveVehicle(id);
      toast.success('Vehicle archived');
      navigate('/vehicles');
    }
    catch {
      toast.error('Unable to archive vehicle');
    }
  };
  if (loading) return <div className="fleet-page py-16">
    <LoadingSpinner />
  </div>;
  if (error) return <div className="fleet-page">
    <ErrorState retry={load} />
  </div>;
  if (!vehicle) return <div className="fleet-empty">
    <h1>Vehicle not found</h1>
    <Link to="/vehicles">Back to Vehicles</Link>
  </div>;
  const images = vehicle.vehicleImages?.length ? vehicle.vehicleImages : [vehicle.imageUrl].filter(Boolean);
  const dateFields = [['Insurance', 'insuranceExpiry'], ['Vehicle license', 'licenseExpiry'], ['Emission test', 'emissionExpiry'], ['Revenue license', 'revenueExpiry'], ['Registration', 'registrationExpiry']];
  return <div className="fleet-page">
    <Link className="inline-flex gap-2 items-center text-sm text-gray-500 mb-5" to="/vehicles"><ArrowLeftIcon className="h-4 w-4" />Back to Vehicles</Link>
    <PageHeader eyebrow="VEHICLE PROFILE" title={vehicle.vehicleNumber} description={[vehicle.make, vehicle.model, vehicle.year].filter(Boolean).join(' · ')}>
      <Status value={vehicle.status} />
      {canEdit && !vehicle.archivedAt && <Link className="btn btn-primary" to={`/vehicles/${id}/edit`}><PencilIcon className="h-4 w-4 mr-2" />Edit Vehicle</Link>}
      {isAdmin && <Link className="btn btn-outline" to={`/activity?vehicle=${id}`}>Activity</Link>}
      <VehicleActions vehicle={vehicle} onDelete={isAdmin && !vehicle.archivedAt ? onDelete : undefined} />
    </PageHeader>
    <div className="fleet-tabs fleet-detail-tabs" role="tablist" aria-label="Vehicle sections">
      {['overview', 'documents', 'service', 'fuel'].map(t => <button key={t} id={`vehicle-tab-${t}`} role="tab" tabIndex={tab === t ? 0 : -1} onKeyDown={e => {
        const tabs = ['overview', 'documents', 'service', 'fuel'];
        const index = tabs.indexOf(t);
        const next = e.key === 'ArrowRight' ? tabs[(index + 1) % tabs.length] : e.key === 'ArrowLeft' ? tabs[(index + tabs.length - 1) % tabs.length] : e.key === 'Home' ? tabs[0] : e.key === 'End' ? tabs[tabs.length - 1] : null;
        if (next) { e.preventDefault(); setTab(next); document.getElementById(`vehicle-tab-${next}`)?.focus(); }
      }} aria-selected={tab === t} aria-controls="vehicle-tab-panel" className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
        {t.charAt(0).toUpperCase() + t.slice(1)}
      </button>)}
    </div>
    <div id="vehicle-tab-panel" role="tabpanel" aria-labelledby={`vehicle-tab-${tab}`}>
    {tab === 'overview'  && <div className="fleet-detail-grid">
      <section className="fleet-panel p-5 sm:p-6">
        <h2 className="mb-5">Vehicle Photos</h2>
        {images.length ? <><button className="fleet-detail-photo" onClick={() => setImage(0)}>
          <img src={images[0]} alt={`${vehicle.vehicleNumber} main view`} />
        </button><div className="fleet-thumbnails">
            {images.map((src, i) => <button key={`${src}-${i}`} onClick={() => setImage(i)} aria-label={`Open photo ${i + 1}`}>
              <img src={src} alt={`Vehicle view ${i + 1}`} />
            </button>)}
          </div><p className="text-xs text-gray-500 mt-3">Select a photo to view full size.</p></> : <div className="fleet-photo-empty">
          <TruckIcon className="h-12 w-12" />
          <p>No photos uploaded</p>
        </div>}
      </section>
      <section className="fleet-panel p-5 sm:p-6">
        <h2 className="mb-5">Vehicle Information</h2>
        <Facts entries={[
          ['Vehicle number', vehicle.vehicleNumber], ['Make / Model', [vehicle.make, vehicle.model].filter(Boolean).join(' ') || null], ['Year', vehicle.year], ['Vehicle type', vehicle.type], ['Fuel type', vehicle.fuelType], ['Condition', vehicle.condition], ['Department', vehicle.department], ['Assigned to', vehicle.assignedTo], ['Mileage', vehicle.mileage != null ? `${vehicle.mileage.toLocaleString()} km` : null], ['Monthly distance', vehicle.monthlyMileage != null ? `${vehicle.monthlyMileage.toLocaleString()} km` : null], ['Month start mileage', vehicle.monthStartMileage != null ? `${vehicle.monthStartMileage} km` : null], ['Month end mileage', vehicle.monthEndMileage != null ? `${vehicle.monthEndMileage} km` : null]
        ]} />
        {vehicle.notes && <div className="mt-6 pt-5 border-t">
          <h3 className="mb-2 font-medium">Additional Notes</h3>
          <p className="text-sm text-gray-600 whitespace-pre-wrap break-words">
            {vehicle.notes}
          </p>
        </div>}
      </section>
    </div>}
    {tab === 'documents' && <section className="fleet-panel p-5 sm:p-6">
      <h2>Documents & Expiry Dates</h2>
      <p className="text-sm text-gray-500 mt-1 mb-6">Keep registration and renewal information up to date.</p>
      <div className="fleet-document-grid">
        {dateFields.map(([label, field]) => <div className="fleet-document" key={field}>
          <h3>
            {label}
          </h3>
          <p>
            {formatDate(vehicle[field])}
          </p>
          <Expiry value={vehicle[field]} />
        </div>)}
      </div>
      {vehicle.insuranceDetails && <p className="text-sm text-gray-600 mt-5">Insurance details: {vehicle.insuranceDetails}</p>}
      <h3 className="mt-8 mb-3 font-semibold">Attached Documents</h3>
      {vehicle.documents?.length ? <ul className="divide-y">
        {vehicle.documents.map((doc, i) => <li className="py-3 flex justify-between gap-3" key={doc._id || i}>
          {doc.url && /^(https?:\/\/|\/)/i.test(doc.url) ? <a className="text-blue-700 underline" href={doc.url} target="_blank" rel="noreferrer">{doc.name || 'View document'} ↗</a> : <span>
            {doc.name || 'Document'}
          </span>}
          <span className="text-sm text-gray-500">
            {doc.type}
          </span>
        </li>)}
      </ul> : <p className="text-sm text-gray-500">No documents attached.</p>}
    </section>}
    {tab === 'service' && <><details className="fleet-panel mb-6"><summary className="p-5 sm:p-6 cursor-pointer font-semibold text-sm">Vehicle Schedule</summary><section className="p-5 sm:p-6 border-t">
      <div className="mb-6">
        <Status value={vehicle.status} />
      </div>
      <Facts entries={[
        ['Last service', formatDate(vehicle.serviceDate)], ['Next service due', formatDate(vehicle.nextServiceDue)], ['Last maintenance', formatDate(vehicle.lastMaintenanceDate)], ['Next maintenance', formatDate(vehicle.nextMaintenanceDate)], ['Tyre / battery history', vehicle.tyreBatteryHistory], ['Maintenance notes', vehicle.maintenanceNotes]
      ]} />
      <p className="text-sm text-gray-500 mt-6">Existing schedule details saved with this vehicle. Individual services and their next-service recommendations are recorded below.</p>
    </section></details><VehicleOperations key="service" vehicle={vehicle} kind="service" /></>}
    {tab === 'fuel' && <VehicleOperations key="fuel" vehicle={vehicle} kind="fuel" />}
    </div>
    {canEdit && !vehicle.archivedAt && <Link className="btn btn-primary fleet-mobile-add" to={`/vehicles/${id}/edit`}><PencilIcon className="h-5 w-5" />Edit Vehicle</Link>}
    {image !== null && <div ref={lightboxRef} role="dialog" aria-modal="true" aria-label="Vehicle photo viewer" className="fleet-lightbox" onClick={() => setImage(null)}>
      <div className="fleet-lightbox-content" onClick={e => e.stopPropagation()}>
        <button autoFocus className="fleet-lightbox-close" aria-label="Close photo viewer" onClick={() => setImage(null)}>
          <XMarkIcon className="h-6 w-6" />
        </button>
        <img src={images[image]} alt={`${vehicle.vehicleNumber} view ${image + 1}`} />
        <div className="fleet-lightbox-controls">
          <button className="btn btn-outline" disabled={images.length < 2} onClick={() => setImage((image - 1 + images.length) % images.length)}>Previous</button>
          <span>{image + 1} / {images.length}</span>
          <button className="btn btn-outline" disabled={images.length < 2} onClick={() => setImage((image + 1) % images.length)}>Next</button>
        </div>
      </div>
    </div>}
  </div>;
}
