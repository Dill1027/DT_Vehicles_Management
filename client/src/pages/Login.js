import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { TruckIcon, ShieldCheckIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Login() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (loading) return <div className="py-20">
    <LoadingSpinner />
  </div>;
  if (user) return <Navigate to="/dashboard" replace />;
  const submit = async event => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
      const target = location.state?.from;
      navigate(target?.startsWith('/') && !target.startsWith('//') ? target : '/dashboard', { replace: true });
    } catch (failure) {
      setError(failure.response?.data?.message || 'Unable to connect. Please try again.');
    }
    finally {
      setBusy(false);
    }
  };
  return <main className="fleet-login">
    <div className="fleet-login-theme"><ThemeToggle /></div>
    <section className="fleet-login-story">
      <div className="flex items-center gap-3 font-bold text-xl"><TruckIcon className="h-9 w-9" />Deep Tec</div>
      <div>
        <p className="fleet-eyebrow text-blue-200">VEHICLE MANAGEMENT</p>
        <h1>Your fleet.<br />One clear view.</h1>
        <p>Keep vehicles, documents and maintenance information together. Give your team the access they need.</p>
        <div className="fleet-login-note">
          <ShieldCheckIcon className="h-6 w-6" />
          <span>Access tailored to your role</span>
        </div>
      </div>
      <p className="text-xs text-blue-200">Deep Tec Engineering · Fleet workspace</p>
    </section>
    <section className="fleet-login-form">
      <div className="w-full max-w-sm">
        <p className="fleet-eyebrow">WELCOME BACK</p>
        <h2>Sign in to your workspace</h2>
        <p className="text-sm text-gray-500 mt-3 mb-8">Use the account provided by your administrator.</p>
        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="label" htmlFor="login-email">Email address</label>
            <input className="input" id="login-email" type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@company.com" />
          </div>
          <div>
            <label className="label" htmlFor="login-password">Password</label>
            <div className="relative">
              <input className="input pr-12" id="login-password" type={visible ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" className="absolute right-2 top-2 p-1 text-gray-500" aria-label={visible ? 'Hide password' : 'Show password'} onClick={() => setVisible(!visible)}>
                {visible ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>
          {error && <p className="fleet-form-error" role="alert">
            {error}
          </p>}
          <button className="btn btn-primary w-full py-3" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-6 leading-relaxed">Need an account? Contact your administrator.</p>
      </div>
    </section>
  </main>;
}
