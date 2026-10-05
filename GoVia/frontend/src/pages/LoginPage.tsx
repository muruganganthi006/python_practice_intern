import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { AuthUser } from '../types/auth';

interface LoginResponse {
  access_token: string;
  user: AuthUser;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('user@govia.com');
  const [password, setPassword] = useState('User@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const returnTo = (location.state as { returnTo?: string; bookingState?: unknown } | null)?.returnTo;
  const bookingState = (location.state as { bookingState?: unknown } | null)?.bookingState;

  if (isAuthenticated) {
    return <Navigate to={returnTo ?? '/'} replace state={bookingState} />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.request<LoginResponse>('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      login(response.access_token, response.user);

      if (returnTo) {
        navigate(returnTo, { replace: true, state: bookingState });
        return;
      }

      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(255,107,53,0.18),_transparent_20%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.15),_transparent_28%),linear-gradient(135deg,_#eef6ff_0%,_#f8fafc_45%,_#fff7f3_100%)] px-4 py-12">
      <div className="glass-panel relative w-full max-w-md overflow-hidden rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-[0_30px_90px_rgba(15,23,42,0.18)] backdrop-blur-xl">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-orange-300/30 via-orange-500/10 to-sky-400/20" />

        <div className="relative z-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0b1f3a] via-[#112d4c] to-[#1d3253] text-2xl font-black text-white shadow-[0_16px_30px_rgba(11,31,58,0.25)]">G</div>
            <h1 className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-4xl font-black tracking-tight text-transparent">Welcome back</h1>
            <p className="mt-3 text-sm text-slate-600">Log in to access your bookings and profile.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-slate-800 outline-none transition duration-200 placeholder:text-slate-400 focus:border-orange focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,107,53,0.08)]"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 pr-11 text-slate-800 outline-none transition duration-200 placeholder:text-slate-400 focus:border-orange focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,107,53,0.08)]"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-500 transition hover:text-slate-700"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600 shadow-sm">{error}</div> : null}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange to-[#ef5d2a] px-4 py-3.5 text-base font-bold tracking-[0.12em] text-white shadow-[0_18px_30px_rgba(255,107,53,0.38)] transition duration-200 hover:scale-[1.01] hover:shadow-[0_22px_40px_rgba(255,107,53,0.42)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              {loading ? 'LOGGING IN...' : 'LOGIN'}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-bold text-orange transition hover:text-[#d9531e]">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
