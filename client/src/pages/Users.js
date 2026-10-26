import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ErrorState, PageHeader } from '../components/FleetUI';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'viewer' });
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      setUsers((await api.get('/users')).data.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const add = async e => {
    e.preventDefault();
    setBusy(true);
    setFormError('');
    try {
      const response = await api.post('/users', form);
      setUsers([response.data.user, ...users]);
      setForm({ name: '', email: '', password: '', role: 'viewer' });
      toast.success('User created');
    }
    catch (failure) {
      setFormError(failure.response?.data?.message || 'Unable to create user.');
    } finally {
      setBusy(false);
    }
  };
  const changeRole = async (account, role) => {
    if (!window.confirm(`Change ${account.name}'s role to ${role}? They will need to sign in again.`)) return;
    setBusy(true);
    try {
      const response = await api.patch(`/users/${account.id}`, { role });
      setUsers(previous => previous.map(item => item.id === account.id ? response.data.user : item));
      toast.success('Role updated');
    }
    catch (failure) {
      toast.error(failure.response?.data?.message || 'Unable to update role');
    } finally {
      setBusy(false);
    }
  };
  const remove = async account => {
    if (!window.confirm(`Delete the account for ${account.email}? Their access will end.`)) return;
    setBusy(true);
    try {
      await api.delete(`/users/${account.id}`);
      setUsers(previous => previous.filter(item => item.id !== account.id));
      toast.success('User deleted');
    }
    catch (failure) {
      toast.error(failure.response?.data?.message || 'Unable to delete user');
    } finally {
      setBusy(false);
    }
  };
  return <div className="fleet-page">
    <PageHeader eyebrow="ADMINISTRATION" title="Users & Permissions" description="Create accounts and control access to your fleet workspace." />
    <div className="fleet-user-layout">
      <section className="fleet-panel min-w-0">
        <div className="fleet-panel-header">
          <div>
            <h2>Team Members</h2>
            <p>Admin: full access · Editor: add/edit · Viewer: view only</p>
          </div>
        </div>
        {loading ? <div className="p-8">
          <LoadingSpinner />
        </div> : error ? <ErrorState retry={load} /> : <div className="divide-y">
          {users.map(account => <article className="fleet-user-row" key={account.id}>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm">
                {account.name}
                {account.id === user.id ? ' (you)' : ''}
              </h3>
              <p className="text-xs text-gray-500 mt-1 break-all">
                {account.email}
              </p>
            </div>
            <label className="sr-only" htmlFor={`role-${account.id}`}>Role for {account.name}</label>
            <select className="input w-auto capitalize" id={`role-${account.id}`} value={account.role} disabled={busy || account.id === user.id} onChange={e => changeRole(account, e.target.value)}>
              {['admin', 'editor', 'viewer'].map(role => <option key={role}>
                {role}
              </option>)}
            </select>
            {account.id !== user.id && <button className="btn btn-outline text-red-700" disabled={busy} onClick={() => remove(account)}>Delete</button>}
          </article>)}
        </div>}
      </section>
      <form onSubmit={add} className="fleet-panel p-6 space-y-5 self-start">
        <h2>Add User</h2>
        {[['name', 'Full name', 'text'], ['email', 'Email address', 'email'], ['password', 'Initial password', 'password']].map(([key, label, type]) => <div key={key}>
          <label className="label" htmlFor={`new-user-${key}`}>
            {label}
          </label>
          <input className="input" id={`new-user-${key}`} type={type} value={form[key]} autoComplete={key === 'password' ? 'new-password' : 'off'} required minLength={key === 'password' ? 5 : undefined} maxLength={key === 'password' ? 128 : 100} onChange={e => setForm({ ...form, [key]: e.target.value })} />
        </div>)}
        <div>
          <label className="label" htmlFor="new-user-role">Access role</label>
          <select id="new-user-role" className="input capitalize" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            {['viewer', 'editor', 'admin'].map(role => <option key={role}>
              {role}
            </option>)}
          </select>
        </div>
        {formError && <p role="alert" className="fleet-form-error">
          {formError}
        </p>}
        <button className="btn btn-primary w-full" disabled={busy}>
          {busy ? 'Saving…' : 'Create User'}
        </button>
      </form>
    </div>
  </div>;
}
