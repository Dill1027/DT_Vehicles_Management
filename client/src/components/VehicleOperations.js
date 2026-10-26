import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PlusIcon, ArrowDownTrayIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ErrorState, formatDate } from './FleetUI';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';
const money = value => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 2 }).format(value || 0);
const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' });
const newRequestId = () => window.crypto?.randomUUID?.() || 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
  const random = Math.floor(Math.random() * 16);
  return (char === 'x' ? random : (random & 3) | 8).toString(16);
});
const empty = kind => ({ requestId: newRequestId(), date: today(), odometer: '', cost: '', notes: '', category: 'Service', description: '', provider: '', nextServiceDate: '', nextServiceMileage: '', liters: '', station: '', fullTank: false, receipt: null, removeReceipt: false });

export default function VehicleOperations({ vehicle, kind }) {
  const { canEdit, isAdmin } = useAuth();
  const writable = canEdit && !vehicle.archivedAt;
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [form, setForm] = useState(null);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [readingReceipt, setReadingReceipt] = useState(false);
  const receiptVersion = useRef(0);
  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await api.get(`/operations/${vehicle._id}`, { params: { kind, page } });
      setRecords(response.data.data);
      setSummary(response.data.summary);
      setPagination(response.data.pagination);
    }
    catch {
      setError(true);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [vehicle._id, kind, page]);
  useEffect(() => {
    load();
  }, [load]);
  const start = record => {
    receiptVersion.current++;
    setReadingReceipt(false);
    setEditing(record?._id || null);
    setForm({ ...empty(kind), ...record, nextServiceMileage: record?.nextServiceMileage ?? '', receipt: null, removeReceipt: false });
    setFormError('');
  };
  const set = (key, value) => setForm(previous => ({ ...previous, [key]: value }));
  const chooseReceipt = event => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024 || !['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setFormError('Choose a PDF, JPEG, PNG or WebP file no larger than 5MB.');
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    const version = ++receiptVersion.current;
    setReadingReceipt(true);
    reader.onload = () => {
      if (version !== receiptVersion.current) return;
      setReadingReceipt(false);
      setForm(previous => previous ? ({ ...previous, receipt: { name: file.name, data: reader.result }, removeReceipt: false }) : null);
      setFormError('');
    };
    reader.onerror = () => {
      if (version !== receiptVersion.current) return;
      setReadingReceipt(false);
      setFormError('Unable to read this receipt. Please choose the file again.');
    };
    reader.readAsDataURL(file);
  };
  const save = async event => {
    event.preventDefault();
    setBusy(true);
    setFormError('');
    try {
      const path = `/operations/${vehicle._id}/${kind}${editing ? `/${editing}` : ''}`;
      if (editing) await api.patch(path, form); else await api.post(path, form);
      setForm(null);
      setEditing(null);
      toast.success(kind === 'service' ? 'Service record saved' : 'Fuel record saved');
      if (page !== 1) setPage(1); else await load();
    } catch (failure) {
      setFormError(failure.response?.data?.message || 'Unable to save this record.');
    }
    finally {
      setBusy(false);
    }
  };
  const remove = async record => {
    if (!window.confirm('Remove this record from history totals? Its changes remain in the activity log.')) return;
    setBusy(true);
    try {
      await api.delete(`/operations/${vehicle._id}/${kind}/${record._id}`);
      toast.success('Record removed from totals');
      if (records.length === 1 && page > 1) setPage(page - 1); else await load();
    }
    catch (failure) {
      toast.error(failure.response?.data?.message || 'Unable to remove this record.');
    } finally {
      setBusy(false);
    }
  };
  const label = kind === 'service' ? 'Service' : 'Fuel';
  return <section className="fleet-operation-workspace">
    <div className="fleet-operation-heading">
      <div>
        <h2>
          {kind === 'service' ? 'Service & Maintenance History' : 'Fuel Tracking'}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {kind === 'service' ? 'Keep repairs, garages, odometer readings and bills together.' : 'Record fills and track fuel costs and full-tank efficiency.'}
        </p>
      </div>
      {writable && !form && <button className="btn btn-primary" onClick={() => start(null)}><PlusIcon className="h-4 w-4 mr-2" />Add {label} Record</button>}
    </div>
    {summary && <div className="fleet-stats fleet-operation-stats">
      {(kind === 'service' ? [['Service cost · all time', money(summary.service.totalCost)], ['Service cost · this month', money(summary.service.monthlyCost)], ['Service records', summary.service.count], ['Combined cost · this month', money(summary.service.monthlyCost + summary.fuel.monthlyCost)]] : [['Fuel cost · all time', money(summary.fuel.totalCost)], ['Fuel cost · this month', money(summary.fuel.monthlyCost)], ['Recorded fuel', `${summary.fuel.liters.toLocaleString('en-GB', { maximumFractionDigits: 3 })} L`], ['Full-tank efficiency', summary.fuel.averageKmPerLiter == null ? 'Not enough data' : `${summary.fuel.averageKmPerLiter.toFixed(2)} km/L`]]).map(([title, value], index) => <div className="fleet-stat" data-tone={['blue', 'teal', 'violet', 'green'][index]} key={title}>
        <span>
          {title}
        </span>
        <strong>
          {value}
        </strong>
      </div>)}
    </div>}
    {kind === 'fuel' && <p className="fleet-operation-help">Efficiency uses two full-tank readings and includes partial fills between them. Mark “Full tank” only when the tank was filled completely.</p>}
    {form && writable && <form className="fleet-panel fleet-record-form" onSubmit={save}>
      <div className="flex justify-between items-center gap-3 mb-5">
        <h2>{editing ? 'Edit' : 'Add'} {label} Record</h2>
        <button type="button" className="btn btn-outline" disabled={busy} onClick={() => {
          receiptVersion.current++;
          setReadingReceipt(false);
          setForm(null);
        }}>Cancel</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Field label="Date" id={`${kind}-date`}>
          <input id={`${kind}-date`} className="input" type="date" value={form.date} max={today()} onChange={e => set('date', e.target.value)} required />
        </Field>
        <Field label="Odometer (km)" id={`${kind}-odometer`}>
          <input id={`${kind}-odometer`} className="input" type="number" min="0" max="100000000" step="0.1" value={form.odometer} onChange={e => set('odometer', e.target.value)} required />
        </Field>
        <Field label="Total cost (LKR)" id={`${kind}-cost`}>
          <input id={`${kind}-cost`} className="input" type="number" min="0" max="100000000" step="0.01" value={form.cost} onChange={e => set('cost', e.target.value)} required />
        </Field>
        {kind === 'service' ? <>
          <Field label="Category" id="service-category">
            <select id="service-category" className="input" value={form.category} onChange={e => set('category', e.target.value)}>
              {['Service', 'Repair', 'Tyres', 'Battery', 'Other'].map(value => <option key={value}>
                {value}
              </option>)}
            </select>
          </Field>
          <Field label="Garage / provider" id="service-provider">
            <input id="service-provider" className="input" maxLength={150} value={form.provider} onChange={e => set('provider', e.target.value)} />
          </Field>
          <Field label="Next service date (optional)" id="service-next-date">
            <input id="service-next-date" className="input" type="date" min={form.date} value={form.nextServiceDate || ''} onChange={e => set('nextServiceDate', e.target.value)} />
          </Field>
          <Field label="Next service mileage (optional)" id="service-next-mileage">
            <input id="service-next-mileage" className="input" type="number" min={form.odometer || 0} step="0.1" value={form.nextServiceMileage} onChange={e => set('nextServiceMileage', e.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Work completed" id="service-description">
              <textarea id="service-description" className="input" maxLength={1000} rows={2} value={form.description} onChange={e => set('description', e.target.value)} required placeholder="Oil change, brake repairs, tyre replacement…" />
            </Field>
          </div>
        </> : <>
          <Field label="Fuel quantity (litres)" id="fuel-liters">
            <input id="fuel-liters" className="input" type="number" min="0.001" max="100000000" step="0.001" value={form.liters} onChange={e => set('liters', e.target.value)} required />
          </Field>
          <Field label="Fuel station" id="fuel-station">
            <input id="fuel-station" className="input" maxLength={150} value={form.station} onChange={e => set('station', e.target.value)} />
          </Field>
          <label className="flex items-center gap-3 text-sm sm:mt-6"><input type="checkbox" checked={form.fullTank} onChange={e => set('fullTank', e.target.checked)} />Full tank</label>
        </>}
        <div className="sm:col-span-2">
          <Field label="Notes (optional)" id={`${kind}-notes`}>
            <textarea id={`${kind}-notes`} className="input" rows={2} maxLength={2000} value={form.notes} onChange={e => set('notes', e.target.value)} />
          </Field>
        </div>
        <div>
          <Field label="Bill / receipt (optional)" id={`${kind}-receipt`}>
            <input id={`${kind}-receipt`} className="input" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={chooseReceipt} disabled={busy || readingReceipt} />
          </Field>
          <p className="text-xs text-gray-500 mt-2">PDF, JPEG, PNG or WebP · up to 5MB</p>
          {(form.receipt?.name || form.receiptName) && <p className="text-xs text-gray-600 mt-2 break-all">
            {form.receipt?.name || form.receiptName}
          </p>}
          {editing && form.receiptName && !form.receipt && <label className="text-xs flex gap-2 mt-2"><input type="checkbox" checked={form.removeReceipt} onChange={e => set('removeReceipt', e.target.checked)} />Remove existing receipt</label>}
        </div>
      </div>
      {formError && <p className="fleet-form-error mt-5" role="alert">
        {formError}
      </p>}
      <div className="flex justify-end mt-6">
        <button className="btn btn-primary" disabled={busy || readingReceipt}>
          {readingReceipt ? 'Reading receipt…' : busy ? 'Saving…' : `Save ${label} Record`}
        </button>
      </div>
    </form>}
    {loading ? <div className="py-12">
      <LoadingSpinner />
    </div> : error ? <ErrorState retry={load} /> : !records.length ? <div className="fleet-panel fleet-empty">
      <h3>No {kind} records yet</h3>
      <p>
        {writable ? `Add a ${kind} record to begin tracking this vehicle’s history.` : 'Recorded entries will appear here.'}
      </p>
    </div> : <div className="fleet-panel">
      <div className="fleet-panel-header">
        <h2>{label} Records</h2>
        <span className="text-xs text-gray-500">{pagination.total} entries</span>
      </div>
      <div className="fleet-record-list">
        {records.map(record => <article className="fleet-record-row" key={record._id}>
          <div className="fleet-record-main">
            <div className="flex flex-wrap gap-2 items-center">
              <h3>
                {kind === 'service' ? record.category : `${record.liters.toLocaleString()} L`}
              </h3>
              <span className="text-xs text-gray-500">
                {formatDate(record.date)}
              </span>
              {kind === 'fuel' && record.fullTank && <span className="fleet-badge info">Full tank</span>}
            </div>
            <p className="text-sm text-gray-600 mt-2 break-words">
              {kind === 'service' ? record.description : record.station || 'Fuel fill'}
            </p>
            <div className="fleet-record-meta">
              <span>{record.odometer.toLocaleString()} km</span>
              {record.provider && <span>
                {record.provider}
              </span>}
              {record.efficiency && <span className="text-green-700">{record.efficiency.kmPerLiter.toFixed(2)} km/L</span>}
              {kind === 'service' && record.nextServiceDate && <span>Next service: {formatDate(record.nextServiceDate)}</span>}
              {kind === 'service' && record.nextServiceMileage != null && <span>Next service: {record.nextServiceMileage.toLocaleString()} km</span>}
            </div>
            {record.notes && <p className="text-xs text-gray-500 mt-2 whitespace-pre-wrap break-words">
              {record.notes}
            </p>}
          </div>
          <div className="fleet-record-side">
            <strong>
              {money(record.cost)}
            </strong>
            <div className="flex gap-2 flex-wrap justify-end">
              {record.receiptName && <a className="btn btn-outline text-xs" href={`${api.defaults.baseURL.replace(/\/$/, '')}/operations/${vehicle._id}/${kind}/${record._id}/receipt`} target="_blank" rel="noreferrer"><ArrowDownTrayIcon className="h-4 w-4 mr-1" />Receipt</a>}
              {writable && <button className="btn btn-outline text-xs" disabled={busy} onClick={() => start(record)}><PencilSquareIcon className="h-4 w-4 mr-1" />Edit</button>}
              {isAdmin && !vehicle.archivedAt && <button className="btn btn-outline text-xs text-red-700" disabled={busy} onClick={() => remove(record)}>Remove</button>}
            </div>
          </div>
        </article>)}
      </div>
    </div>}
    {!loading && pagination.pages > 1 && <div className="fleet-pagination">
      <p>{pagination.total} {kind} records</p>
      <div>
        <button className="btn btn-outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
        <span>Page {pagination.page} of {pagination.pages}</span>
        <button className="btn btn-outline" disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>}
  </section>;
}
function Field({ id, label, children }) {
  return <div>
    <label className="label" htmlFor={id}>
      {label}
    </label>
    {children}
  </div>;
}
