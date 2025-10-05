"use client";
import { useState } from 'react';
import PasswordGenerator from '@/components/PasswordGenerator';
import VaultManager from '@/components/VaultManager';
import ThemeToggle from '@/components/ThemeToggle';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userPassword, setUserPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [pin, setPin] = useState('');
  const [awaitingPin, setAwaitingPin] = useState<null | 'login' | 'register'>(null);
  const [statusMsg, setStatusMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const response = await fetch(`/api/auth/${authMode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();

    if (response.ok) {
      setAwaitingPin(authMode);
      setStatusMsg('We sent a 6-digit PIN to your email. Enter it below.');
    } else {
      alert(data.error || 'Authentication failed');
    }
  } catch (error) {
    console.error('Auth error:', error);
    alert('Network error. Please try again.');
  }
};

  const verifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!awaitingPin) return;
    setStatusMsg('');
    try {
      if (awaitingPin === 'register') {
        const res = await fetch('/api/auth/register/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: credentials.email, pin })
        });
        const d = await res.json();
        if (res.ok) {
          setStatusMsg('Registration successful! Please login.');
          setAwaitingPin(null);
          setPin('');
          setAuthMode('login');
        } else {
          setStatusMsg(d?.error || 'Invalid PIN');
        }
      } else {
        const res = await fetch('/api/auth/login/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: credentials.email, pin })
        });
        const d = await res.json();
        if (res.ok) {
          localStorage.setItem('authToken', d.token);
          setUserPassword(credentials.password);
          setIsAuthenticated(true);
          setAwaitingPin(null);
          setPin('');
        } else {
          setStatusMsg(d?.error || 'Invalid PIN');
        }
      }
    } catch (err) {
      console.error('PIN verify error', err);
      setStatusMsg('Network error. Try again.');
    }
  };


  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="absolute top-4 right-4"><ThemeToggle /></div>
        <div className="max-w-md w-full p-8 rounded-xl shadow-lg bg-[var(--card)] border border-[var(--border)]">
          <h1 className="text-2xl font-semibold text-center mb-6">Password Vault</h1>
          
          <form onSubmit={handleAuth} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={credentials.email}
              onChange={(e) => setCredentials({...credentials, email: e.target.value})}
              className="w-full p-3 rounded-lg bg-[var(--card)] border border-[var(--border)] placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              className="w-full p-3 rounded-lg bg-[var(--card)] border border-[var(--border)] placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-500 transition-colors"
            >
              {authMode === 'login' ? 'Login' : 'Register'}
            </button>
          </form>
          
          <p className="text-center mt-4 text-[var(--muted)]">
            {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              className="text-indigo-600 hover:text-indigo-500 ml-1"
            >
              {authMode === 'login' ? 'Register' : 'Login'}
            </button>
          </p>

          {awaitingPin && (
            <div className="mt-6 p-4 rounded-lg bg-[var(--card)] border border-[var(--border)]">
              <h2 className="text-lg font-medium mb-2">Enter Email PIN</h2>
              <p className="text-sm text-[var(--muted)] mb-3">{statusMsg}</p>
              <form onSubmit={verifyPin} className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="6-digit PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="flex-1 p-2 rounded bg-[var(--card)] border border-[var(--border)] placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <button type="submit" className="px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500">Verify</button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-10 backdrop-blur p-4 bg-[var(--nav)] border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Password Vault</h1>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => {
                localStorage.removeItem('authToken');
                setIsAuthenticated(false);
              }}
              className="text-red-600 hover:text-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      
      <div className="p-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
          <PasswordGenerator />
          <div className="hidden md:block" />
        </div>
        <div className="max-w-6xl mx-auto mt-8">
          <VaultManager userPassword={userPassword} />
        </div>
      </div>
    </div>
  );
}
