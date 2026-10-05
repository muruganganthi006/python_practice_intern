import { Link } from 'react-router-dom';

export function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="mx-auto max-w-lg rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange">Access denied</p>
        <h1 className="mt-3 text-3xl font-bold text-navy">Admin access required</h1>
        <p className="mt-4 text-slate-600">This area is reserved for administrator accounts only.</p>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-orange px-4 py-2 font-medium text-white">
          Back to home
        </Link>
      </div>
    </div>
  );
}
