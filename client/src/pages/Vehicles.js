import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon, XMarkIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { vehicleService } from '../services/vehicleService';
import VehicleCard from '../components/VehicleCard';
import { compareVehicleExpiry, earliestVehicleExpiry } from '../utils/vehicleExpiry';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { ErrorState, Expiry, PageHeader, Status, VehicleActions, useDialogFocus, formatDate, expiryDays, vehicleArray, vehicleId } from '../components/FleetUI';

export default function Vehicles({ archived = false }) {
  const { canEdit, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(params.get('status') || 'all');
  const [type, setType] = useState('all');
  const [view, setView] = useState('grid');
  const [expiry, setExpiry] = useState('all');
  const [density, setDensity] = useState('comfortable');
  const expiryOptions = [['all', 'All'], ['expired', 'Expired'], ['7', 'Next 7 days'], ['30', 'Next 30 days']];
  const matchesExpiry = (v, key) => {
    if (key === 'all') return true;
    const date = earliestVehicleExpiry(v);
    const days = Number.isFinite(date) ? expiryDays(date) : null;
    return days !== null && (key === 'expired' ? days < 0 : days >= 0 && days <= Number(key));
  };
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const drawerRef = useRef(null);
  useDialogFocus(filtersOpen, drawerRef, () => setFiltersOpen(false));
  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      setVehicles(vehicleArray(await vehicleService.getAllVehicles(archived ? { archived: true } : {})));
    }
    catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [archived]); // eslint-disable-line react-hooks/exhaustive-deps
  const matching = useMemo(() => vehicles.filter(v => {
    const query = search.trim().toLowerCase();
    const normalizedStatus = (v.status || '').toLowerCase();
    const matchesStatus = status === 'all' || (status === 'available' ? ['active', 'available'].includes(normalizedStatus) : status === 'in-use' ? ['in service', 'in-use', 'in use'].includes(normalizedStatus) : status === 'maintenance' ? /maintenance/i.test(normalizedStatus) : v.status === status);
    return matchesStatus && (type === 'all' || v.type === type) && [v.vehicleNumber, v.make, v.model, v.department].some(value => String(value || '').toLowerCase().includes(query));
  }).sort(compareVehicleExpiry), [vehicles, search, status, type]);
  const filtered = matching.filter(v => matchesExpiry(v, expiry));
  useEffect(() => {
    setPage(1);
  }, [search, status, type, expiry, density]);
  const pageSize = density === 'compact' ? 24 : 12;
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * pageSize, current * pageSize);
  const onView = v => navigate(`/vehicles/${vehicleId(v)}`);
  const onEdit = v => navigate(`/vehicles/${vehicleId(v)}/edit`);
  const onDelete = async id => {
    if (!window.confirm('Archive this vehicle? You can restore it from the Archive page.')) return;
    try {
      await vehicleService.archiveVehicle(id);
      setVehicles(previous => previous.filter(v => vehicleId(v) !== id));
      toast.success('Vehicle archived');
    }
    catch {
      toast.error('Unable to archive vehicle');
    }
  };
  const onRestore = async vehicle => {
    if (!window.confirm(`Restore ${vehicle.vehicleNumber} to the active fleet?`)) return;
    try { await vehicleService.restoreVehicle(vehicleId(vehicle)); setVehicles(previous => previous.filter(v => vehicleId(v) !== vehicleId(vehicle))); toast.success('Vehicle restored'); }
    catch { toast.error('Unable to restore vehicle'); }
  };
  const reset = () => {
    setExpiry('all');
    setSearch('');
    setStatus('all');
    setType('all');
  };
  const filters = <><label className="fleet-filter-label">Status<select className="input" value={status} onChange={e => setStatus(e.target.value)}>
    <option value="all">All statuses</option>
    <option value="available">Available / Active</option>
    <option value="in-use">In Use / In Service</option>
    <option value="maintenance">Under Maintenance</option>
    {['Inactive', 'Out of Service', 'Retired'].map(s => <option key={s}>
      {s}
    </option>)}
  </select></label><label className="fleet-filter-label">Vehicle type<select className="input" value={type} onChange={e => setType(e.target.value)}>
    <option value="all">All types</option>
    {[...new Set(vehicles.map(v => v.type).filter(Boolean))].sort().map(t => <option key={t}>
      {t}
    </option>)}
  </select></label><button className="btn btn-outline" onClick={reset}>Clear filters</button></>;
  return <div className="fleet-page">
    <PageHeader title={archived ? "Archived Vehicles" : "Vehicles"} description={archived ? "Restore vehicles while preserving their history and documents." : "Manage your fleet, documents and availability."}>
      {canEdit && !archived && <Link to="/vehicles/add" className="btn btn-primary"><PlusIcon className="h-4 w-4 mr-2" />Add Vehicle</Link>}
    </PageHeader>
    <section className="fleet-panel fleet-toolbar" aria-label="Search and filter vehicles">
      <label className="fleet-search">
        <MagnifyingGlassIcon className="h-5 w-5" />
        <span className="sr-only">Search vehicles</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vehicle number, model or department…" />
      </label>
      <button className="btn btn-outline md:hidden" onClick={() => setFiltersOpen(true)}><FunnelIcon className="h-4 w-4 mr-2" />Filters{status !== 'all' || type !== 'all' ? ' •' : ''}</button>
      <div className="hidden md:flex items-end gap-3">
        {filters}
      </div>
    </section>
    <div className="fleet-expiry-filters" aria-label="Filter by document expiry">
      {expiryOptions.map(([key, label]) => <button key={key} className={expiry === key ? 'active' : ''} aria-pressed={expiry === key} onClick={() => setExpiry(key)}>{label}<span>{loading ? '…' : matching.filter(v => matchesExpiry(v, key)).length}</span></button>)}
    </div>
    {(search || status !== 'all' || type !== 'all' || expiry !== 'all') && <div className="fleet-filter-chips" aria-label="Active filters">
      {[[search && `Search: ${search}`, () => setSearch('')], [status !== 'all' && `Status: ${status}`, () => setStatus('all')], [type !== 'all' && `Type: ${type}`, () => setType('all')], [expiry !== 'all' && expiryOptions.find(([key]) => key === expiry)?.[1], () => setExpiry('all')]].filter(([label]) => label).map(([label, clear]) => <button key={label} onClick={clear} aria-label={`Remove filter ${label}`}>{label}<XMarkIcon className="h-3 w-3" /></button>)}
      <button onClick={reset}>Clear all</button>
    </div>}
    {canEdit && !archived && <Link to="/vehicles/add" className="btn btn-primary fleet-mobile-add"><PlusIcon className="h-5 w-5" />Add Vehicle</Link>}
    {filtersOpen && <div className="fleet-drawer-backdrop" onClick={() => setFiltersOpen(false)}>
      <section ref={drawerRef} role="dialog" aria-modal="true" aria-label="Vehicle filters" className="fleet-drawer" onClick={e => e.stopPropagation()} onKeyDown={e => {
        if (e.key === 'Escape') setFiltersOpen(false);
      }}>
        <div className="flex justify-between items-center mb-6">
          <h2>Filter vehicles</h2>
          <button autoFocus className="fleet-icon-button" aria-label="Close filters" onClick={() => setFiltersOpen(false)}>
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        {filters}
        <button className="btn btn-primary mt-6 w-full" onClick={() => setFiltersOpen(false)}>Show results</button>
      </section>
    </div>}
    <div className="fleet-results-toolbar">
      <p className="text-sm text-gray-500" aria-live="polite">
        {loading ? 'Loading vehicles…' : `${filtered.length} vehicles found`}
      </p>
      <label className="fleet-density-control">Grid size<select className="input" value={density} onChange={e => setDensity(e.target.value)}><option value="comfortable">Comfortable</option><option value="compact">Compact</option></select></label>
      <div className="hidden md:flex fleet-view-toggle" aria-label="Vehicle layout">
        {[['table', ListBulletIcon, 'Table'], ['grid', Squares2X2Icon, 'Grid']].map(([key, Icon, label]) => <button key={key} aria-pressed={view === key} onClick={() => setView(key)}>
          <Icon className="h-4 w-4" />
          {label}
        </button>)}
      </div>
    </div>
    {loading ? <div className="py-16">
      <LoadingSpinner />
    </div> : error ? <ErrorState retry={load} /> : !filtered.length ? <div className="fleet-panel fleet-empty">
      <h2>No vehicles found</h2>
      <p>
        {vehicles.length ? 'Try another search or clear your filters.' : 'Add your first vehicle to start managing your fleet.'}
      </p>
      {vehicles.length ? <button className="btn btn-outline" onClick={reset}>Clear filters</button> : canEdit && !archived ? <Link className="btn btn-primary" to="/vehicles/add">Add Vehicle</Link> : null}
    </div> : <>
      <div className={view === 'grid' ? 'hidden' : 'hidden md:block fleet-panel'}>
        <table className="fleet-table">
          <thead>
            <tr>
              {['Vehicle', 'Department', 'Status', 'Insurance', 'License', ...(archived ? ['Archived'] : []), 'Actions'].map(h => <th key={h}>
                {h}
              </th>)}
            </tr>
          </thead>
          <tbody>
            {visible.map(v => <tr key={vehicleId(v)}>
              <td>
                <Link className="fleet-vehicle-link" to={`/vehicles/${vehicleId(v)}`}>
                  {v.vehicleNumber}
                </Link>
                <p className="text-xs text-gray-500 mt-1">{v.make} {v.model} · {v.type}</p>
              </td>
              <td>
                {v.department || 'Unassigned'}
              </td>
              <td>
                <Status value={v.status} />
              </td>
              <td>
                <Expiry value={v.insuranceExpiry} />
              </td>
              <td>
                <Expiry value={v.licenseExpiry} />
              </td>
              {archived && <td>{formatDate(v.archivedAt)}</td>}
              <td>
                <VehicleActions vehicle={v} onEdit={canEdit && !archived ? onEdit : undefined} onDelete={isAdmin && !archived ? onDelete : undefined} onRestore={isAdmin && archived ? onRestore : undefined} />
              </td>
            </tr>)}
          </tbody>
        </table>
      </div>
      <div className={`fleet-vehicle-grid fleet-grid-${density} ${view === 'table' ? 'md:hidden' : ''}`}>
        {visible.map(v => <VehicleCard key={vehicleId(v)} vehicle={v} onView={onView} onEdit={canEdit && !archived ? onEdit : undefined} onDelete={isAdmin && !archived ? onDelete : undefined} onRestore={isAdmin && archived ? onRestore : undefined} />)}
      </div>
      <div className="fleet-pagination">
        <p>Showing {(current - 1) * pageSize + 1}–{Math.min(current * pageSize, filtered.length)} of {filtered.length}</p>
        <div>
          <button className="btn btn-outline" disabled={current === 1} onClick={() => setPage(current - 1)}>Previous</button>
          <span>Page {current} of {pages}</span>
          <button className="btn btn-outline" disabled={current === pages} onClick={() => setPage(current + 1)}>Next</button>
        </div>
      </div></>}
  </div>;
}
