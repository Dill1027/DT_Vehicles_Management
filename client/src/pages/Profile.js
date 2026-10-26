import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/FleetUI';
import toast from 'react-hot-toast';
const descriptions = { admin: 'Full fleet access, archives and user management.', editor: 'View, add and edit vehicles. Archiving and user management are restricted.', viewer: 'View vehicles, documents and reports. Changes are restricted.' };

export default function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const save = async e => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('New passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      const response = await api.patch('/auth/profile', { name, currentPassword, password });
      setUser(response.data.user);
      setPassword('');
      setCurrentPassword('');
      setConfirm('');
      toast.success('Profile updated');
    }
    catch (failure) {
      setError(failure.response?.data?.message || 'Unable to save profile.');
    }
    finally {
      setBusy(false);
    }
  };
  return <div className="fleet-page">
    <PageHeader eyebrow="YOUR ACCOUNT" title="Profile" description="Manage your personal details and password." />
    <div className="fleet-account-grid">
      <aside className="fleet-panel p-6 self-start">
        <div className="fleet-avatar">
          {user.name.slice(0, 2).toUpperCase()}
        </div>
        <h2 className="mt-5">
          {user.name}
        </h2>
        <p className="text-sm text-gray-500 mt-2 break-all">
          {user.email}
        </p>
        <span className="fleet-badge info capitalize mt-4">
          {user.role}
        </span>
        <p className="text-sm text-gray-500 leading-relaxed mt-5">
          {descriptions[user.role]}
        </p>
      </aside>
      <form onSubmit={save} className="fleet-panel p-6 space-y-5">
        <h2>Account Details</h2>
        <div>
          <label className="label" htmlFor="profile-name">Full name</label>
          <input id="profile-name" className="input" value={name} maxLength={100} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label className="label" htmlFor="profile-email">Email address</label>
          <input id="profile-email" type="email" className="input bg-gray-50" value={user.email} disabled />
          <p className="text-xs text-gray-500 mt-2">Your email identifies your account.</p>
        </div>
        <div className="border-t pt-5">
          <h2>Change Password</h2>
          <p className="text-sm text-gray-500 mt-1">Leave these fields empty to keep your current password.</p>
        </div>
        <div>
          <label className="label" htmlFor="current-password">Current password</label>
          <input id="current-password" className="input" type="password" autoComplete="current-password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required={Boolean(password)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="label" htmlFor="new-password">New password</label>
            <input id="new-password" className="input" type="password" autoComplete="new-password" minLength={5} maxLength={128} value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="confirm-password">Confirm new password</label>
            <input id="confirm-password" className="input" type="password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} required={Boolean(password)} />
          </div>
        </div>
        {error && <p role="alert" className="fleet-form-error">
          {error}
        </p>}
        <div className="flex justify-end">
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  </div>;
}
