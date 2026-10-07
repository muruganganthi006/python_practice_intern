import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';

type Section = 'operators' | 'routes' | 'seats' | 'payments' | 'users' | 'profile' | 'settings';
type Operator = { id: number; name: string; email: string | null; phone: string | null; address: string | null; status: 'ACTIVE' | 'INACTIVE'; bus_count: number; buses: Array<{ id: number; bus_number: string; status: string }> };
type RoutePoint = { id: number; point_type: 'BOARDING' | 'DROPPING'; name: string; address: string | null; point_time: string | null };
type RouteRecord = { id: number; origin: string; destination: string; distance_km: number | null; estimated_duration_minutes: number | null; status: 'ACTIVE' | 'INACTIVE'; boarding_points: RoutePoint[]; dropping_points: RoutePoint[]; trip_count: number };
type AdminTrip = { id: number; route: string; operator: string; bus_number: string; date: string; departure: string; arrival: string; fare: number; status: string; seats_left: number };
type Seat = { seat_number: number; seat_label: string; seat_type: 'SEATER' | 'SLEEPER'; row_index: number; column_index: number; status: 'AVAILABLE' | 'BOOKED' | 'RESERVED' | 'BLOCKED'; booking: { booking_id: number; passenger: string } | null };

export function AdminManagementSection({ section }: { section: Section }) {
  if (section === 'operators') return <OperatorsView />;
  if (section === 'routes') return <RoutesView />;
  if (section === 'seats') return <SeatsView />;
  if (section === 'payments') return <PaymentsView />;
  if (section === 'users') return <UsersView />;
  return <ProfileSettingsView section={section} />;
}

function Page({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return <section><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff6736]">{eyebrow}</p><h2 className="mt-2 text-3xl font-black text-[#102746]">{title}</h2><p className="mt-2 text-sm text-slate-500">{description}</p><div className="mt-7">{children}</div></section>;
}

function Notice({ message, error = false }: { message: string; error?: boolean }) {
  return message ? <div role={error ? 'alert' : 'status'} className={`mb-4 rounded-xl border px-4 py-3 text-sm ${error ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>{message}</div> : null;
}

function TextField({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <label className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}<input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium normal-case tracking-normal text-slate-800 outline-none focus:border-[#ff6736]" /></label>;
}

function OperatorsView() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' });

  const load = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set('search', search);
      if (filter !== 'ALL') query.set('status', filter);
      const response = await apiClient.request<{ operators: Operator[] }>(`/api/admin/operators?${query}`);
      setOperators(response.operators);
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load operators.');
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [search, filter]);

  const openNew = () => {
    setEditingId(null);
    setForm({ name: '', email: '', phone: '', address: '', status: 'ACTIVE' });
    setNotice(''); setError(''); setShowForm(true);
  };

  const edit = (operator: Operator) => {
    setEditingId(operator.id);
    setForm({ name: operator.name, email: operator.email ?? '', phone: operator.phone ?? '', address: operator.address ?? '', status: operator.status });
    setNotice(''); setError(''); setShowForm(true);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setNotice('');
    try {
      const payload = { ...form, email: form.email || null, phone: form.phone || null, address: form.address || null };
      await apiClient.request(editingId ? `/api/admin/operators/${editingId}` : '/api/admin/operators', {
        method: editingId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      setShowForm(false); setNotice(editingId ? 'Operator updated.' : 'Operator created.'); await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to save operator.'); }
  };

  return <Page eyebrow="OPERATIONS" title="Operator Management" description="Manage transport operators and their assigned fleet.">
    <Notice message={notice} /><Notice message={error} error />
    <div className="mb-4 flex flex-col gap-3 sm:flex-row">
      <input aria-label="Search operators" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email or phone" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
      <select aria-label="Operator status filter" value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"><option value="ALL">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select>
      <button type="button" onClick={openNew} className="rounded-xl bg-[#ff6736] px-4 py-2.5 text-sm font-bold text-white">Add Operator</button>
    </div>
    {showForm ? <form onSubmit={save} className="mb-5 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
      <TextField label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} required />
      <TextField label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
      <TextField label="Phone" value={form.phone} onChange={(phone) => setForm({ ...form, phone })} />
      <TextField label="Address" value={form.address} onChange={(address) => setForm({ ...form, address })} />
      <label className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as 'ACTIVE' | 'INACTIVE' })} className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"><option>ACTIVE</option><option>INACTIVE</option></select></label>
      <div className="flex items-end justify-end gap-2"><button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold">Cancel</button><button className="rounded-xl bg-[#102f52] px-4 py-2.5 text-sm font-bold text-white">Save Operator</button></div>
    </form> : null}
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      {loading ? <p className="p-8 text-center text-sm text-slate-500">Loading operators...</p> : operators.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">No operators found.</p> : <table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500"><tr>{['Operator', 'Contact', 'Address', 'Buses', 'Status', 'Action'].map((heading) => <th key={heading} className="px-4 py-3">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{operators.map((operator) => <tr key={operator.id}><td className="px-4 py-4 font-bold text-[#102746]">{operator.name}</td><td className="px-4 py-4 text-slate-600">{operator.email || '-'}<br />{operator.phone || '-'}</td><td className="px-4 py-4 text-slate-600">{operator.address || '-'}</td><td className="px-4 py-4"><span className="font-bold">{operator.bus_count}</span>{operator.buses.length ? <p className="mt-1 text-xs text-slate-500">{operator.buses.map((bus) => bus.bus_number).join(', ')}</p> : null}</td><td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${operator.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{operator.status}</span></td><td className="px-4 py-4"><button type="button" onClick={() => edit(operator)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold">Edit</button></td></tr>)}</tbody></table>}
    </div>
  </Page>;
}

function RoutesView() {
  const [routes, setRoutes] = useState<RouteRecord[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pointRoute, setPointRoute] = useState<RouteRecord | null>(null);
  const [pointForm, setPointForm] = useState({ point_type: 'BOARDING' as 'BOARDING' | 'DROPPING', name: '', address: '', point_time: '' });
  const [form, setForm] = useState({ origin: '', destination: '', distance_km: '', estimated_duration_minutes: '', status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' });
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams(); if (search) query.set('search', search); if (filter !== 'ALL') query.set('status', filter);
      const response = await apiClient.request<{ routes: RouteRecord[] }>(`/api/admin/routes?${query}`);
      setRoutes(response.routes); setError('');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load routes.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [search, filter]);

  const edit = (route?: RouteRecord) => {
    setEditingId(route?.id ?? null);
    setForm(route ? { origin: route.origin, destination: route.destination, distance_km: String(route.distance_km ?? ''), estimated_duration_minutes: String(route.estimated_duration_minutes ?? ''), status: route.status } : { origin: '', destination: '', distance_km: '', estimated_duration_minutes: '', status: 'ACTIVE' });
    setShowForm(true); setNotice(''); setError('');
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setError('');
    const payload = { ...form, distance_km: form.distance_km ? Number(form.distance_km) : null, estimated_duration_minutes: form.estimated_duration_minutes ? Number(form.estimated_duration_minutes) : null };
    try {
      await apiClient.request(editingId ? `/api/admin/routes/${editingId}` : '/api/admin/routes', { method: editingId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      setShowForm(false); setNotice(editingId ? 'Route updated.' : 'Route created.'); await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to save route.'); }
  };

  const addPoint = async (event: React.FormEvent) => {
    event.preventDefault(); if (!pointRoute) return; setError('');
    try {
      await apiClient.request(`/api/admin/routes/${pointRoute.id}/points`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...pointForm, address: pointForm.address || null, point_time: pointForm.point_time || null }) });
      setPointRoute(null); setPointForm({ point_type: 'BOARDING', name: '', address: '', point_time: '' }); setNotice('Route point added.'); await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to add route point.'); }
  };
  const removePoint = async (point: RoutePoint) => {
    if (!window.confirm(`Remove ${point.name}?`)) return;
    try { await apiClient.request(`/api/admin/route-points/${point.id}`, { method: 'DELETE' }); setNotice('Route point removed.'); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to remove route point.'); }
  };

  return <Page eyebrow="OPERATIONS" title="Route Management" description="Manage route status, distance, duration, boarding and dropping points.">
    <Notice message={notice} /><Notice message={error} error />
    <div className="mb-4 flex flex-col gap-3 sm:flex-row"><input aria-label="Search routes" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search origin or destination" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm" /><select aria-label="Route status filter" value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"><option value="ALL">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select><button type="button" onClick={() => edit()} className="rounded-xl bg-[#ff6736] px-4 py-2.5 text-sm font-bold text-white">Add Route</button></div>
    {showForm ? <form onSubmit={save} className="mb-5 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2"><TextField label="Origin" value={form.origin} onChange={(origin) => setForm({ ...form, origin })} required /><TextField label="Destination" value={form.destination} onChange={(destination) => setForm({ ...form, destination })} required /><TextField label="Distance (km)" type="number" value={form.distance_km} onChange={(distance_km) => setForm({ ...form, distance_km })} /><TextField label="Estimated duration (minutes)" type="number" value={form.estimated_duration_minutes} onChange={(estimated_duration_minutes) => setForm({ ...form, estimated_duration_minutes })} /><label className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as 'ACTIVE' | 'INACTIVE' })} className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"><option>ACTIVE</option><option>INACTIVE</option></select></label><div className="flex items-end justify-end gap-2"><button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm">Cancel</button><button className="rounded-xl bg-[#102f52] px-4 py-2.5 text-sm font-bold text-white">Save Route</button></div></form> : null}
    {pointRoute ? <form onSubmit={addPoint} className="mb-5 grid gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 sm:grid-cols-2"><p className="sm:col-span-2 text-sm font-bold text-[#102746]">Add point for {pointRoute.origin} → {pointRoute.destination}</p><select aria-label="Point type" value={pointForm.point_type} onChange={(event) => setPointForm({ ...pointForm, point_type: event.target.value as 'BOARDING' | 'DROPPING' })} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"><option value="BOARDING">Boarding</option><option value="DROPPING">Dropping</option></select><TextField label="Point name" value={pointForm.name} onChange={(name) => setPointForm({ ...pointForm, name })} required /><TextField label="Address" value={pointForm.address} onChange={(address) => setPointForm({ ...pointForm, address })} /><TextField label="Time" type="time" value={pointForm.point_time} onChange={(point_time) => setPointForm({ ...pointForm, point_time })} /><div className="flex items-end justify-end gap-2"><button type="button" onClick={() => setPointRoute(null)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm">Cancel</button><button className="rounded-xl bg-[#102f52] px-4 py-2.5 text-sm font-bold text-white">Save Point</button></div></form> : null}
    <div className="space-y-3">{loading ? <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Loading routes...</p> : routes.length === 0 ? <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">No routes found.</p> : routes.map((route) => <article key={route.id} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><h3 className="text-lg font-black text-[#102746]">{route.origin} → {route.destination}</h3><p className="mt-1 text-sm text-slate-500">{route.distance_km ?? '—'} km · {route.estimated_duration_minutes ?? '—'} min · {route.trip_count} trips</p><span className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold">{route.status}</span></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => edit(route)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold">Edit</button><button type="button" onClick={() => { setPointRoute(route); setError(''); }} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold">Add stop</button></div></div><div className="mt-4 grid gap-3 sm:grid-cols-2">{([['Boarding', route.boarding_points], ['Dropping', route.dropping_points]] as const).map(([label, points]) => <div key={label} className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label} points</p>{points.length ? points.map((point) => <div key={point.id} className="mt-2 flex items-center justify-between gap-2 text-sm"><span>{point.name}{point.point_time ? ` · ${point.point_time.slice(0, 5)}` : ''}</span><button type="button" onClick={() => void removePoint(point)} aria-label={`Remove ${point.name}`} className="text-xs font-semibold text-red-600">Remove</button></div>) : <p className="mt-2 text-sm text-slate-400">No points</p>}</div>)}</div></article>)}</div>
  </Page>;
}

function SeatsView() {
  const [trips, setTrips] = useState<AdminTrip[]>([]);
  const [tripId, setTripId] = useState('');
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    apiClient.request<{ trips: AdminTrip[] }>('/api/admin/trips').then((response) => {
      setTrips(response.trips); if (response.trips[0]) setTripId(String(response.trips[0].id));
    }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to load trips.')).finally(() => setLoading(false));
  }, []);

  const loadSeats = async () => {
    if (!tripId) return;
    try { const response = await apiClient.request<{ seats: Seat[] }>(`/api/admin/seats?trip_id=${tripId}`); setSeats(response.seats); setError(''); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load trip seats.'); }
  };
  useEffect(() => { void loadSeats(); }, [tripId]);

  const setStatus = async (seat: Seat, status: 'AVAILABLE' | 'RESERVED' | 'BLOCKED') => {
    if (seat.status === 'BOOKED') return;
    try {
      await apiClient.request(`/api/admin/trips/${tripId}/seats/${seat.seat_number}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      setNotice(`${seat.seat_label} set to ${status.toLowerCase()}.`); await loadSeats();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to update seat.'); }
  };
  const chosenTrip = trips.find((trip) => String(trip.id) === tripId);

  return <Page eyebrow="OPERATIONS" title="Seat Management" description="Inspect a trip’s physical seat layout and manage unbooked seat states.">
    <Notice message={notice} /><Notice message={error} error />
    <label className="mb-5 block max-w-2xl text-xs font-bold uppercase tracking-wider text-slate-500">Trip<select aria-label="Select trip" value={tripId} onChange={(event) => setTripId(event.target.value)} className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium normal-case tracking-normal text-slate-800">{trips.map((trip) => <option key={trip.id} value={trip.id}>{trip.route} · {trip.date} · {trip.bus_number}</option>)}</select></label>
    {loading ? <p className="p-8 text-center text-sm text-slate-500">Loading trips...</p> : !chosenTrip ? <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">No trips available.</p> : <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm font-bold text-[#102746]">{chosenTrip.route} · {chosenTrip.bus_number} · {chosenTrip.date}</p><div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold"><span className="text-emerald-700">Available</span><span className="text-red-700">Booked</span><span className="text-amber-700">Reserved</span><span className="text-slate-700">Blocked</span></div><div className="mt-6 grid grid-cols-[repeat(5,minmax(52px,1fr))] gap-2 sm:max-w-2xl">{seats.map((seat) => <div key={seat.seat_number} style={{ gridColumnStart: seat.seat_type === 'SLEEPER' ? (seat.column_index < 3 ? 1 : 4) : seat.column_index + 1, gridRowStart: seat.row_index + 1 }} className={seat.seat_type === 'SLEEPER' ? 'col-span-2' : ''}><button type="button" disabled={seat.status === 'BOOKED'} onClick={() => void setStatus(seat, seat.status === 'AVAILABLE' ? 'BLOCKED' : 'AVAILABLE')} aria-label={`${seat.seat_label} ${seat.status}`} title={seat.booking ? `Booking ${seat.booking.booking_id}: ${seat.booking.passenger}` : `${seat.seat_label} · ${seat.seat_type}`} className={`flex min-h-14 w-full flex-col items-center justify-center border-2 px-2 py-2 text-xs font-black transition disabled:cursor-not-allowed ${seat.seat_type === 'SLEEPER' ? 'min-h-[76px] rounded-xl' : 'min-h-[52px] rounded-t-xl'} ${seat.status === 'AVAILABLE' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : seat.status === 'BOOKED' ? 'border-red-500 bg-red-50 text-red-800' : seat.status === 'RESERVED' ? 'border-amber-500 bg-amber-50 text-amber-800' : 'border-slate-700 bg-slate-800 text-white'}`}><span>{seat.seat_label}</span><span className="text-[9px] font-semibold">{seat.seat_type} · {seat.status}</span></button>{seat.status !== 'BOOKED' ? <select aria-label={`Set ${seat.seat_label} status`} value={seat.status} onChange={(event) => void setStatus(seat, event.target.value as 'AVAILABLE' | 'RESERVED' | 'BLOCKED')} className="mt-1 w-full rounded border border-slate-200 bg-white px-1 py-1 text-[10px]"><option value="AVAILABLE">Available</option><option value="RESERVED">Reserved</option><option value="BLOCKED">Blocked</option></select> : <p className="mt-1 truncate text-[10px] text-red-700">{seat.booking?.passenger}</p>}</div>)}</div><p className="mt-5 text-xs text-slate-500">Seat buttons toggle available/blocked. Use the status selector for temporary reservations. Booked seats cannot be changed.</p></div>}
  </Page>;
}

function PaymentsView() {
  const [payments, setPayments] = useState<Array<{ id: number; booking_id: string; user: string; amount: number; payment_method: string; transaction_id: string; payment_status: string; payment_date: string }>>([]);
  const [search, setSearch] = useState(''); const [filter, setFilter] = useState('ALL'); const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  useEffect(() => { setLoading(true); const query = new URLSearchParams(); if (search) query.set('search', search); if (filter !== 'ALL') query.set('payment_status', filter); apiClient.request<{ payments: typeof payments }>(`/api/admin/payments?${query}`).then((response) => setPayments(response.payments)).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to load payments.')).finally(() => setLoading(false)); }, [search, filter]);
  return <Page eyebrow="FINANCE" title="Payment Management" description="View real simulated payment transactions recorded for bookings."><Notice message={error} error /><div className="mb-4 flex flex-col gap-3 sm:flex-row"><input aria-label="Search payments" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search transaction or user" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm" /><select aria-label="Payment status filter" value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"><option value="ALL">All statuses</option><option value="SUCCESS">Success</option><option value="FAILED">Failed</option><option value="REFUNDED">Refunded</option></select></div><div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">{loading ? <p className="p-8 text-center text-sm text-slate-500">Loading payments...</p> : payments.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">No payment transactions found.</p> : <table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500"><tr>{['Booking', 'User', 'Amount', 'Method', 'Transaction', 'Status', 'Paid at'].map((heading) => <th key={heading} className="px-4 py-3">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{payments.map((payment) => <tr key={payment.id}><td className="px-4 py-4 font-bold">{payment.booking_id}</td><td className="px-4 py-4">{payment.user}</td><td className="px-4 py-4 font-bold">₹{payment.amount.toLocaleString('en-IN')}</td><td className="px-4 py-4">{payment.payment_method}</td><td className="px-4 py-4 font-mono text-xs">{payment.transaction_id}</td><td className="px-4 py-4">{payment.payment_status}</td><td className="px-4 py-4">{new Date(payment.payment_date).toLocaleString()}</td></tr>)}</tbody></table>}</div></Page>;
}

function UsersView() {
  const [users, setUsers] = useState<Array<{ id: number; name: string; email: string; phone: string; role: 'USER' | 'ADMIN'; is_active: boolean; booking_count: number; created_at: string }>>([]);
  const [search, setSearch] = useState(''); const [error, setError] = useState(''); const [notice, setNotice] = useState(''); const [loading, setLoading] = useState(true);
  const load = async () => { setLoading(true); try { const query = search ? `?search=${encodeURIComponent(search)}` : ''; const response = await apiClient.request<{ users: typeof users }>(`/api/admin/users${query}`); setUsers(response.users); setError(''); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load users.'); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, [search]);
  const update = async (user: typeof users[number], patch: { role?: 'USER' | 'ADMIN'; is_active?: boolean }) => { setError(''); try { await apiClient.request(`/api/admin/users/${user.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) }); setNotice(`${user.name} updated.`); await load(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to update user.'); } };
  return <Page eyebrow="ACCESS" title="User Management" description="Review user details and update account status or role with backend authorization."><Notice message={notice} /><Notice message={error} error /><input aria-label="Search users" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email or phone" className="mb-4 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm sm:max-w-md" /><div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">{loading ? <p className="p-8 text-center text-sm text-slate-500">Loading users...</p> : <table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500"><tr>{['Name', 'Email / Phone', 'Role', 'Bookings', 'Account', 'Created', 'Actions'].map((heading) => <th key={heading} className="px-4 py-3">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{users.map((item) => <tr key={item.id}><td className="px-4 py-4 font-bold">{item.name}</td><td className="px-4 py-4">{item.email}<br />{item.phone}</td><td className="px-4 py-4"><select aria-label={`Role for ${item.name}`} value={item.role} onChange={(event) => void update(item, { role: event.target.value as 'USER' | 'ADMIN' })} className="rounded-lg border border-slate-200 bg-white px-2 py-1"><option>USER</option><option>ADMIN</option></select></td><td className="px-4 py-4">{item.booking_count}</td><td className="px-4 py-4">{item.is_active ? 'ACTIVE' : 'INACTIVE'}</td><td className="px-4 py-4">{new Date(item.created_at).toLocaleDateString()}</td><td className="px-4 py-4"><button type="button" onClick={() => void update(item, { is_active: !item.is_active })} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold">{item.is_active ? 'Deactivate' : 'Activate'}</button></td></tr>)}</tbody></table>}</div></Page>;
}

function ProfileSettingsView({ section }: { section: 'profile' | 'settings' }) {
  const [profile, setProfile] = useState({ id: 0, name: '', email: '', phone: '', role: 'ADMIN' });
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [password, setPassword] = useState({ current_password: '', new_password: '' });
  const [notice, setNotice] = useState(''); const [error, setError] = useState('');
  useEffect(() => {
    if (section === 'profile') apiClient.request<typeof profile>('/api/admin/profile').then(setProfile).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to load profile.'));
    else apiClient.request<Record<string, string>>('/api/admin/settings').then(setSettings).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to load settings.'));
  }, [section]);
  const saveProfile = async (event: React.FormEvent) => { event.preventDefault(); setError(''); try { setProfile(await apiClient.request<typeof profile>('/api/admin/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) })); setNotice('Profile saved.'); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to save profile.'); } };
  const savePassword = async (event: React.FormEvent) => { event.preventDefault(); setError(''); try { await apiClient.request('/api/admin/profile/password', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(password) }); setPassword({ current_password: '', new_password: '' }); setNotice('Password changed.'); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to change password.'); } };
  return section === 'profile' ? <Page eyebrow="ACCOUNT" title="Admin Profile" description="Update administrator contact information and password."><Notice message={notice} /><Notice message={error} error /><form onSubmit={saveProfile} className="grid max-w-2xl gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2"><TextField label="Name" value={profile.name} onChange={(name) => setProfile({ ...profile, name })} required /><TextField label="Email" type="email" value={profile.email} onChange={(email) => setProfile({ ...profile, email })} required /><TextField label="Phone" value={profile.phone} onChange={(phone) => setProfile({ ...profile, phone })} required /><p className="self-end text-sm text-slate-500">Role: {profile.role}</p><div className="sm:col-span-2"><button className="rounded-xl bg-[#102f52] px-4 py-2.5 text-sm font-bold text-white">Save Profile</button></div></form><form onSubmit={savePassword} className="mt-5 grid max-w-2xl gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2"><TextField label="Current password" type="password" value={password.current_password} onChange={(current_password) => setPassword({ ...password, current_password })} required /><TextField label="New password" type="password" value={password.new_password} onChange={(new_password) => setPassword({ ...password, new_password })} required /><div className="sm:col-span-2"><button className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold">Change Password</button></div></form></Page> : <Page eyebrow="SYSTEM" title="System Settings" description="Current application configuration exposed by the backend."><Notice message={error} error /><dl className="grid max-w-2xl gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2">{Object.entries(settings).map(([key, value]) => <div key={key} className="border-b border-slate-100 pb-3"><dt className="text-xs font-bold uppercase tracking-wider text-slate-500">{key.split('_').join(' ')}</dt><dd className="mt-1 text-sm font-semibold text-[#102746]">{value}</dd></div>)}</dl></Page>;
}
