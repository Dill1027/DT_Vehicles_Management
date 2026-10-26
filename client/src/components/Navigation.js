import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { TruckIcon, HomeIcon, DocumentTextIcon, ArchiveBoxIcon, UsersIcon, ClipboardDocumentListIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import toast from 'react-hot-toast';

export default function Navigation() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const items = [
    ['/dashboard', 'Dashboard', HomeIcon], ['/vehicles', 'Vehicles', TruckIcon], ['/reports', 'Reports', DocumentTextIcon],
    ...(isAdmin ? [['/archive', 'Archive', ArchiveBoxIcon], ['/users', 'Users', UsersIcon], ['/activity', 'Activity', ClipboardDocumentListIcon]] : [])
  ];
  const signOut = async () => {
    setBusy(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    }
    catch {
      toast.error('Unable to sign out. Please try again.');
    }
    finally {
      setBusy(false);
    }
  };
  const links = items.map(([path, label, Icon]) => <NavLink key={path} to={path} onClick={() => setOpen(false)} className={({ isActive }) => `fleet-nav-link ${isActive ? 'active' : ''}`}>
    <Icon className="h-4 w-4" />
    {label}
  </NavLink>);
  return <nav className="fleet-navigation border-b sticky top-0 z-50" aria-label="Main navigation">
    <div className="fleet-nav-shell">
      <Link to="/dashboard" className="flex items-center gap-3 shrink-0">
        <span className="fleet-brand-mark h-10 w-10 rounded-lg flex items-center justify-center">
          <TruckIcon className="h-6 w-6 text-white" />
        </span>
        <span>
          <strong className="block text-base">Deep Tec</strong>
          <span className="block text-[10px] text-gray-500">Fleet Workspace</span>
        </span>
      </Link>
      <div className="fleet-desktop-nav">
        {links}
      </div>
      <div className="fleet-nav-account flex items-center gap-3">
        <ThemeToggle />
        <Link to="/profile" className="fleet-profile-link" aria-label="My profile">
          <span className="fleet-avatar small">
            {user.name.slice(0, 2).toUpperCase()}
          </span>
          <span className="hidden xl:block">
            <strong className="block text-xs max-w-[110px] truncate">
              {user.name}
            </strong>
            <span className="text-[10px] text-gray-500 capitalize">
              {user.role}
            </span>
          </span>
        </Link>
        <button type="button" className="fleet-signout" disabled={busy} onClick={signOut}>
          {busy ? '…' : 'Sign out'}
        </button>
        <button className="fleet-nav-toggle fleet-icon-button" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
        </button>
      </div>
    </div>
    {open && <div className="fleet-mobile-nav">
      {links}
      <NavLink to="/profile" className="fleet-nav-link" onClick={() => setOpen(false)}>My Profile</NavLink>
      <button className="fleet-mobile-signout fleet-nav-link" disabled={busy} onClick={signOut}>{busy ? 'Signing out…' : 'Sign out'}</button>
    </div>}
  </nav>;
}
