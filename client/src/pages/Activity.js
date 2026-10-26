import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { ErrorState, PageHeader } from '../components/FleetUI';
import LoadingSpinner from '../components/LoadingSpinner';
const actions = ['vehicle.created', 'vehicle.updated', 'vehicle.archived', 'vehicle.restored', 'service.created', 'service.updated', 'service.voided', 'fuel.created', 'fuel.updated', 'fuel.voided', 'user.created', 'user.role_changed', 'user.deleted', 'profile.updated', 'profile.password_changed'];
const label = value => value.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[._]/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
const value = input => input == null || input === '' ? 'Not set' : typeof input === 'boolean' ? input ? 'Yes' : 'No' : String(input);

export default function Activity() {
  const [params, setParams] = useSearchParams();
  const [action, setAction] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const vehicle = params.get('vehicle') || '';
  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await api.get('/activity', { params: { action: action || undefined, from: from || undefined, to: to || undefined, vehicle: vehicle || undefined, page } });
      setData(response.data.data);
      setPagination(response.data.pagination);
    }
    catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [action, from, to, vehicle, page]);
  useEffect(() => {
    load();
  }, [load]);
  const filter = setter => event => {
    setter(event.target.value);
    setPage(1);
  };
  return <div className="fleet-page">
    <PageHeader eyebrow="ADMINISTRATION" title="Activity Log" description="See who changed fleet records, when they changed them and what changed." />
    <section className="fleet-panel fleet-activity-filters">
      <label className="fleet-filter-label">Action<select className="input" value={action} onChange={filter(setAction)}>
        <option value="">All actions</option>
        {actions.map(item => <option value={item} key={item}>
          {label(item)}
        </option>)}
      </select></label>
      <label className="fleet-filter-label">From<input className="input" type="date" value={from} max={to || undefined} onChange={filter(setFrom)} /></label>
      <label className="fleet-filter-label">To<input className="input" type="date" value={to} min={from || undefined} onChange={filter(setTo)} /></label>
      <button className="btn btn-outline" onClick={() => {
        setAction('');
        setFrom('');
        setTo('');
        setParams({});
        setPage(1);
      }}>Clear filters</button>
      {vehicle && <span className="fleet-badge info">Filtered to one vehicle</span>}
    </section>
    {loading ? <div className="py-16">
      <LoadingSpinner />
    </div> : error ? <ErrorState retry={load} /> : !data.length ? <div className="fleet-panel fleet-empty">
      <h2>No activity found</h2>
      <p>New changes appear here. Try clearing the filters to see more entries.</p>
    </div> : <section className="fleet-panel">
      <div className="fleet-panel-header">
        <h2>Recent Changes</h2>
        <span className="text-xs text-gray-500">{pagination.total} entries</span>
      </div>
      {data.map(entry => <article className="fleet-activity-row" key={entry._id}>
        <div className="fleet-activity-marker" aria-hidden="true">•</div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-sm">
              {label(entry.action)}
            </h3>
            <span className="fleet-badge neutral capitalize">
              {entry.actor.role}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2 break-words">
            {entry.vehicle ? <Link className="text-blue-700 hover:underline" to={`/vehicles/${entry.vehicle}`}>
              {entry.label}
            </Link> : entry.label}
          </p>
          <p className="text-xs text-gray-500 mt-2 break-words">{entry.actor.name} · {entry.actor.email}</p>
          {entry.changes.length > 0 && <details className="fleet-activity-changes">
            <summary>View {entry.changes.length} {entry.changes.length === 1 ? 'change' : 'changes'}</summary>
            <dl>
              {entry.changes.map(change => <div key={change.field}>
                <dt>
                  {label(change.field)}
                </dt>
                <dd>
                  <span className="text-gray-500">
                    {value(change.before)}
                  </span>
                  <span className="mx-2 text-gray-400" aria-label="changed to">→</span>
                  <span>
                    {value(change.after)}
                  </span>
                </dd>
              </div>)}
            </dl>
          </details>}
        </div>
        <time className="fleet-activity-time" dateTime={entry.createdAt}>
          {new Date(entry.createdAt).toLocaleString('en-GB', { timeZone: 'Asia/Colombo', dateStyle: 'medium', timeStyle: 'short' })}
        </time>
      </article>)}
    </section>}
    {!loading && pagination.pages > 1 && <div className="fleet-pagination">
      <p>{pagination.total} activity entries · Sri Lanka time</p>
      <div>
        <button className="btn btn-outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
        <span>Page {page} of {pagination.pages}</span>
        <button className="btn btn-outline" disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>}
  </div>;
}
