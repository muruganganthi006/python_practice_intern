import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';

interface RegisterResponse {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
  };
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }

    if (!form.email.trim()) {
      setError('Email is required.');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password) || !/\d/.test(form.password)) {
      setError('Password must include at least one uppercase letter, one lowercase letter, and one number.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.request<RegisterResponse>('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      });

      setSuccess('Registration successful. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.15),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(255,107,53,0.18),_transparent_28%),linear-gradient(135deg,_#eef6ff_0%,_#f8fafc_35%,_#fff7f1_100%)] px-4 py-12">
      <div className="glass-panel relative mx-auto w-full max-w-xl overflow-hidden rounded-[32px] border border-white/80 bg-white/85 p-8 shadow-[0_30px_90px_rgba(15,23,42,0.15)] backdrop-blur-xl">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-sky-300/25 via-cyan-200/20 to-orange-300/30" />

        <div className="relative z-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0b1f3a] via-[#122d4e] to-[#1d3253] text-2xl font-black text-white shadow-[0_16px_30px_rgba(11,31,58,0.25)]">G</div>
            <h1 className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-4xl font-black tracking-tight text-transparent">Create account</h1>
            <p className="mt-3 text-sm text-slate-600">Sign up to start planning your next trip.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Name</label>
              <input value={form.name} onChange={(event) => handleChange('name', event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-slate-800 outline-none transition duration-200 placeholder:text-slate-400 focus:border-orange focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,107,53,0.08)]" placeholder="Murugan" />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                <input type="email" value={form.email} onChange={(event) => handleChange('email', event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-slate-800 outline-none transition duration-200 placeholder:text-slate-400 focus:border-orange focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,107,53,0.08)]" placeholder="you@example.com" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Phone</label>
                <input value={form.phone} onChange={(event) => handleChange('phone', event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-slate-800 outline-none transition duration-200 placeholder:text-slate-400 focus:border-orange focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,107,53,0.08)]" placeholder="9876543210" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(event) => handleChange('password', event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 pr-11 text-slate-800 outline-none transition duration-200 placeholder:text-slate-400 focus:border-orange focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,107,53,0.08)]" placeholder="Create password" />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-3 flex items-center text-slate-500 transition hover:text-slate-700" aria-label="Toggle password visibility">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Confirm password</label>
              <div className="relative">
                <input type={showConfirmPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={(event) => handleChange('confirmPassword', event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 pr-11 text-slate-800 outline-none transition duration-200 placeholder:text-slate-400 focus:border-orange focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,107,53,0.08)]" placeholder="Confirm password" />
                <button type="button" onClick={() => setShowConfirmPassword((value) => !value)} className="absolute inset-y-0 right-3 flex items-center text-slate-500 transition hover:text-slate-700" aria-label="Toggle confirm password visibility">{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </div>

            {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600 shadow-sm">{error}</div> : null}
            {success ? <div className="rounded-2xl border border-green-200 bg-green-50 px-3 py-2.5 text-sm font-medium text-green-700 shadow-sm">{success}</div> : null}

            <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0b1f3a] via-[#14355c] to-[#1a3d67] px-4 py-3.5 text-base font-black tracking-[0.12em] text-white shadow-[0_18px_30px_rgba(11,31,58,0.32)] transition duration-200 hover:scale-[1.01] hover:shadow-[0_22px_40px_rgba(11,31,58,0.38)] disabled:cursor-not-allowed disabled:opacity-70">
              {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-600">Already have an account? <Link to="/login" className="font-bold text-orange transition hover:text-[#d9531e]">Login</Link></p>
        </div>
      </div>
    </div>
  );
}
