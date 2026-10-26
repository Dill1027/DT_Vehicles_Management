import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, TruckIcon, CheckCircleIcon, ArrowPathIcon, WrenchScrewdriverIcon, ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { vehicleService } from '../services/vehicleService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { ErrorState, Expiry, PageHeader, Status, expiryDays, vehicleArray, vehicleId } from '../components/FleetUI';

export default function Dashboard() {
  const { canEdit } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState('all');
  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      setVehicles(vehicleArray(await vehicleService.getAllVehicles()));
    }
    catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const count = values => vehicles.filter(v => values.includes((v.status || '').toLowerCase())).length;
  const stats = [
    { title: 'Total Vehicles', tone: 'blue', value: vehicles.length, icon: TruckIcon, filter: '' },
    { title: 'Available', tone: 'green', value: count(['active', 'available']), icon: CheckCircleIcon, filter: 'available' },
    { title: 'In Use', tone: 'violet', value: count(['in service', 'in-use', 'in use']), icon: ArrowPathIcon, filter: 'in-use' },
    { title: 'Maintenance', tone: 'amber', value: count(['under maintenance', 'in maintenance', 'maintenance']), icon: WrenchScrewdriverIcon, filter: 'maintenance' }
  ];
  const alerts = vehicles.flatMap(vehicle => ['insuranceExpiry', 'licenseExpiry'].map(field => ({ vehicle, field, days: expiryDays(vehicle[field]) }))).filter(a => a.days !== null && a.days <= 30).sort((a, b) => a.days - b.days);
  const displayedAlerts = alerts.filter(a => filter === 'all' || (filter === 'expired' ? a.days < 0 : a.days >= 0));
  const recent = [...vehicles].sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0)).slice(0, 5);
  return <div className="fleet-page">
    <PageHeader eyebrow="FLEET OVERVIEW" title="Dashboard" description="Your fleet at a glance. Stay ahead of what needs attention.">
      {canEdit && <Link to="/vehicles/add" className="btn btn-primary"><PlusIcon className="h-4 w-4 mr-2" />Add Vehicle</Link>}
    </PageHeader>
    {loading ? <div className="py-16">
      <LoadingSpinner />
    </div> : error ? <ErrorState retry={load} /> : <>
      <div className="fleet-stats">
        {stats.map(({ title, value, icon: Icon, filter: selected, tone }) => <Link key={title} className="fleet-stat" data-tone={tone} to={`/vehicles${selected ? `?status=${selected}` : ''}`}>
          <div className="flex justify-between items-center">
            <span>
              {title}
            </span>
            <span className="fleet-stat-icon"><Icon className="h-5 w-5" /></span>
          </div>
          <strong>
            {value}
          </strong>
          <span className="fleet-stat-caption">View vehicles <ArrowUpRightIcon className="h-3 w-3" /></span>
        </Link>)}
      </div>
      <div className="fleet-dashboard-grid">
        <section className="fleet-panel">
          <div className="fleet-panel-header">
            <div>
              <h2>Needs Attention <span className="fleet-badge warning">
                {alerts.length}
              </span></h2>
              <p>Insurance and licenses due within 30 days.</p>
            </div>
          </div>
          <div className="fleet-tabs compact" aria-label="Filter expiry alerts">
            {[['all', 'All'], ['expired', 'Expired'], ['upcoming', 'Upcoming']].map(([key, label]) => <button key={key} aria-pressed={filter === key} className={filter === key ? 'active' : ''} onClick={() => setFilter(key)}>
              {label}
              <span>
                {alerts.filter(a => key === 'all' || (key === 'expired' ? a.days < 0 : a.days >= 0)).length}
              </span>
            </button>)}
          </div>
          <div className="fleet-alert-list">
            {displayedAlerts.length ? displayedAlerts.map(({ vehicle, field, days }) => <Link key={`${vehicleId(vehicle)}-${field}`} className="fleet-alert-row" to={`/vehicles/${vehicleId(vehicle)}`}>
              <div className={`fleet-alert-marker ${days < 0 ? 'danger' : 'warning'}`}>
                {days < 0 ? '!' : '◷'}
              </div>
              <div className="flex-1 min-w-0">
                <strong>
                  {vehicle.vehicleNumber}
                </strong>
                <p>{field === 'insuranceExpiry' ? 'Insurance' : 'Vehicle license'} · {vehicle.department || 'Unassigned'}</p>
              </div>
              <Expiry value={vehicle[field]} />
              <ArrowUpRightIcon className="h-4 w-4 text-gray-400 shrink-0" />
            </Link>) : <div className="fleet-empty">
              <CheckCircleIcon className="h-9 w-9 text-green-600 mx-auto mb-3" />
              <h3>
                {filter === 'all' ? 'You’re all caught up' : 'No matching alerts'}
              </h3>
              <p>
                {filter === 'all' ? 'No recorded insurance or license dates are due within 30 days.' : 'There are no alerts in this category.'}
              </p>
            </div>}
          </div>
        </section>
        <section className="fleet-panel">
          <div className="fleet-panel-header">
            <div>
              <h2>Recent Vehicles</h2>
              <p>The latest additions to your fleet.</p>
            </div>
            <Link className="text-sm text-blue-700 font-medium" to="/vehicles">View all →</Link>
          </div>
          {recent.length ? recent.map(v => <Link key={vehicleId(v)} className="fleet-recent-row" to={`/vehicles/${vehicleId(v)}`}>
            <div className="fleet-recent-icon">
              <TruckIcon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <strong>
                {v.vehicleNumber}
              </strong>
              <p>
                {v.make}
                {v.model || v.type}
              </p>
            </div>
            <Status value={v.status} />
          </Link>) : <div className="fleet-empty">
            <h3>Your fleet starts here</h3>
            <p>Add a vehicle to see it on your dashboard.</p>
            {canEdit && <Link className="btn btn-primary" to="/vehicles/add">Add Vehicle</Link>}
          </div>}
        </section>
      </div>
      <section className="fleet-report-strip">
        <div>
          <h2>Fleet reports</h2>
          <p>Review your fleet summary and document expiry reports.</p>
        </div>
        <Link className="btn btn-outline" to="/reports">View Reports <ArrowUpRightIcon className="h-4 w-4 ml-2" /></Link>
      </section>
    </>}
  </div>;
}
