import React, { useEffect, useRef, useState } from 'react';
export const vehicleId = vehicle => vehicle._id || vehicle.id;
export const vehicleArray = response => Array.isArray(response.data) ? response.data : response.data?.vehicles || [];
export const formatDate = value => value && !Number.isNaN(new Date(value).getTime()) ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Colombo' }) : 'Not set';

export function expiryDays(value) {
  if (!value || Number.isNaN(new Date(value).getTime())) return null;
  const day = date => new Date(date).toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' });
  return Math.round((Date.parse(day(value)) - Date.parse(day(new Date()))) / 86400000);
}

export function Expiry({ value }) {
  const days = expiryDays(value);
  return <span className={`fleet-badge ${days === null ? 'neutral' : days < 0 ? 'danger' : days <= 30 ? 'warning' : 'success'}`}>
    {days === null ? 'Not set' : days < 0 ? `Expired · ${formatDate(value)}` : days === 0 ? 'Expires today' : days <= 30 ? `${days} days left` : formatDate(value)}
  </span>;
}

export function Status({ value }) {
  const status = (value || '').toLowerCase();
  const tone = ['active', 'available'].includes(status) ? 'success' : status.includes('maintenance') ? 'warning' : ['in service', 'in-use', 'in use'].includes(status) ? 'info' : 'neutral';
  return <span className={`fleet-badge ${tone}`}>
    <span aria-hidden="true">●</span>
    {value || 'Unknown'}
  </span>;
}

export function PageHeader({ eyebrow = 'FLEET MANAGEMENT', title, description, children }) {
  return <header className="fleet-page-header">
    <div>
      <p className="fleet-eyebrow">
        {eyebrow}
      </p>
      <h1>
        {title}
      </h1>
      <p className="fleet-description">
        {description}
      </p>
    </div>
    <div className="fleet-header-actions">
      {children}
    </div>
  </header>;
}

export function VehicleActions({ vehicle, onEdit, onDelete, onRestore }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = e => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    const escape = e => {
      if (e.key === 'Escape') {
        setOpen(false);
        ref.current?.querySelector('button')?.focus();
      }
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);
  if (!onEdit && !onDelete && !onRestore) return null;
  return <div className="fleet-actions" ref={ref} onClick={e => e.stopPropagation()}>
    <button type="button" className="fleet-icon-button" aria-label={`Actions for ${vehicle.vehicleNumber}`} aria-expanded={open} onClick={() => setOpen(!open)}>⋮</button>
    {open && <div className="fleet-action-menu">
      {onRestore && <button type="button" onClick={() => { setOpen(false); onRestore(vehicle); }}>Restore vehicle</button>}
      {onEdit && <button type="button" onClick={() => {
        setOpen(false);
        onEdit(vehicle);
      }}>Edit vehicle</button>}
      {onDelete && <button type="button" className="text-red-700" onClick={() => {
        setOpen(false);
        onDelete(vehicleId(vehicle));
      }}>Archive vehicle</button>}
    </div>}
  </div>;
}

export function ErrorState({ retry }) {
  return <div className="fleet-empty" role="alert">
    <h2>Unable to load fleet data</h2>
    <p>Check your connection and try again.</p>
    <button className="btn btn-outline" onClick={retry}>Try again</button>
  </div>;
}
// Keep keyboard focus inside an open drawer or photo viewer and restore it on close.

export function useDialogFocus(open, ref, onClose) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusable = () => Array.from(ref.current?.querySelectorAll('button:not([disabled]), a[href], input, select, textarea, [tabindex="0"]') || []);
    focusable()[0]?.focus();
    const keydown = event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeRef.current();
      }
      if (event.key !== 'Tab') return;
      const elements = focusable();
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!first) {
        event.preventDefault();
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
      else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', keydown);
    return () => {
      document.removeEventListener('keydown', keydown);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [open, ref]);
}
