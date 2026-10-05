import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowRightLeft,
  BarChart3,
  Bell,
  BusFront,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  CreditCard,
  DollarSign,
  Landmark,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  MapPinned,
  Menu,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  Smartphone,
  Ticket,
  TrendingUp,
  UserCog,
  Users,
  X,
} from 'lucide-react';
import {
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import { apiClient } from './api/client';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { RegisterPage } from './pages/RegisterPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';

const navItems = ['Home', 'Bus Tickets', 'My Bookings', 'Help'];

const popularRoutes = [
  'Chennai → Bangalore',
  'Chennai → Coimbatore',
  'Chennai → Madurai',
  'Bangalore → Chennai',
  'Coimbatore → Chennai',
  'Chennai → Pondicherry',
];

const operators = [
  'Skyline Travels',
  'GreenLine Express',
  'CityRide Travels',
  'MetroLink Travels',
];

const features = [
  {
    title: 'Easy Booking',
    description: 'Find and book your bus in a few simple steps.',
    icon: Ticket,
  },
  {
    title: 'Wide Choice',
    description: 'Compare buses and operators in one place.',
    icon: BusFront,
  },
  {
    title: 'Secure Payments',
    description: 'Your booking information is protected.',
    icon: ShieldCheck,
  },
  {
    title: 'Instant Confirmation',
    description: 'Get your booking details instantly.',
    icon: MapPinned,
  },
];

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/images/logo.png"
        alt="GoVia logo"
        className="h-16 w-auto object-contain drop-shadow-[0_8px_16px_rgba(11,31,58,0.12)] sm:h-20 md:h-24"
      />
    </div>
  );
}

function Header() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 shadow-[0_8px_25px_rgba(15,23,42,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" aria-label="GoVia home" className="transition hover:opacity-95">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item}
              to={
                item === 'Home'
                  ? '/'
                  : item === 'Bus Tickets'
                    ? '/search'
                    : item === 'My Bookings'
                      ? '/my-bookings'
                      : '/help'
              }
              className="text-sm font-medium text-slate-600 transition hover:text-navy"
            >
              <span className="inline-block rounded-full px-2 py-1 transition hover:bg-slate-100 hover:text-navy">
                {item}
              </span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 md:inline-flex"
              >
                {user?.name || 'Profile'}
              </Link>

              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-navy to-[#1b3a63] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(11,31,58,0.2)] transition hover:translate-y-[-1px]"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 md:inline-flex"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="inline-flex items-center rounded-full bg-gradient-to-r from-orange to-[#ef5d2a] px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(255,107,53,0.28)] transition hover:translate-y-[-1px]"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const navigate = useNavigate();
  const [from, setFrom] = useState('Chennai');
  const [to, setTo] = useState('Bangalore');
  const [travelDate, setTravelDate] = useState('2026-10-10');
  const [passengers, setPassengers] = useState('1');

  const handleSearch = () => {
    const cleanFrom = from.trim();
    const cleanTo = to.trim();

    if (!cleanFrom || !cleanTo) {
      window.alert('Please enter both origin and destination.');
      return;
    }

    if (!travelDate) {
      window.alert('Please select a travel date.');
      return;
    }

    if (cleanFrom.toLowerCase() === cleanTo.toLowerCase()) {
      window.alert('Origin and destination must be different.');
      return;
    }

    navigate(
      `/search?origin=${encodeURIComponent(cleanFrom)}&destination=${encodeURIComponent(cleanTo)}&travel_date=${encodeURIComponent(travelDate)}`,
    );
  };

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,107,53,0.26),_transparent_20%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),_transparent_22%),linear-gradient(135deg,_#f7fbff_0%,_#edf6ff_38%,_#fff7f4_100%)]">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.02)_1px,transparent_1px)] bg-[size:28px_28px]" />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-20">
        <div className="flex flex-col justify-center">
          <span className="mb-5 inline-flex w-fit items-center rounded-full border border-orange/30 bg-orange/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-orange">
            GoVia travel
          </span>

          <h1 className="max-w-xl text-4xl font-black tracking-[-0.04em] text-navy sm:text-5xl lg:text-6xl">
            Travel Better. <span className="text-orange">Go Further.</span>
          </h1>

          <p className="mt-5 max-w-xl text-lg text-slate-600">
            Search, compare and book bus tickets from trusted operators across India.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-600">
            <div className="rounded-full border border-slate-200 bg-white/80 px-3 py-2 shadow-sm">
              2,400+ routes
            </div>
            <div className="rounded-full border border-slate-200 bg-white/80 px-3 py-2 shadow-sm">
              4.8/5 traveler rating
            </div>
            <div className="rounded-full border border-slate-200 bg-white/80 px-3 py-2 shadow-sm">
              24/7 support
            </div>
          </div>

          <div className="mt-8 rounded-[28px] border border-slate-200 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-end">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                  From
                </label>

                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 shadow-inner">
                  <MapPinned className="h-4 w-4 text-orange" />
                  <input
                    aria-label="From city"
                    className="w-full bg-transparent text-sm text-slate-700 outline-none"
                    value={from}
                    onChange={(event) => setFrom(event.target.value)}
                  />
                </div>
              </div>

              <button
                type="button"
                aria-label="Swap from and to"
                onClick={() => {
                  const currentFrom = from;
                  setFrom(to);
                  setTo(currentFrom);
                }}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-700 transition hover:bg-slate-200"
              >
                <ArrowRightLeft className="h-5 w-5" />
              </button>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                  To
                </label>

                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 shadow-inner">
                  <MapPinned className="h-4 w-4 text-orange" />
                  <input
                    aria-label="To city"
                    className="w-full bg-transparent text-sm text-slate-700 outline-none"
                    value={to}
                    onChange={(event) => setTo(event.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto]">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                  Date of Journey
                </label>

                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 shadow-inner">
                  <CalendarDays className="h-4 w-4 text-orange" />
                  <input
                    aria-label="Travel date"
                    type="date"
                    className="w-full bg-transparent text-sm text-slate-700 outline-none"
                    value={travelDate}
                    onChange={(event) => setTravelDate(event.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                  Passengers
                </label>

                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 shadow-inner">
                  <Users className="h-4 w-4 text-orange" />

                  <select
                    aria-label="Passengers"
                    value={passengers}
                    onChange={(event) => setPassengers(event.target.value)}
                    className="w-full bg-transparent text-sm text-slate-700 outline-none"
                  >
                    <option value="1">1 Passenger</option>
                    <option value="2">2 Passengers</option>
                    <option value="3">3 Passengers</option>
                  </select>
                </div>
              </div>

              <div />

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleSearch}
                  className="w-full rounded-2xl bg-gradient-to-r from-navy to-[#183867] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(11,31,58,0.18)] transition hover:translate-y-[-1px]"
                >
                  SEARCH BUSES
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-4 top-10 h-24 w-24 rounded-full bg-orange/20 blur-2xl" />
          <div className="absolute -right-4 bottom-6 h-24 w-24 rounded-full bg-sky-300/25 blur-2xl" />

          <div className="relative rounded-[30px] bg-gradient-to-br from-[#0b1f3a] via-[#112d4c] to-[#1b3d66] p-8 text-white shadow-[0_30px_80px_rgba(11,31,58,0.25)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                  India routes
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  Popular journeys
                </h2>
              </div>

              <span className="rounded-full bg-orange/20 px-3 py-1 text-xs font-medium text-orange">
                Live
              </span>
            </div>

            <div className="mt-8 space-y-4">
              {popularRoutes.slice(0, 4).map((route, index) => (
                <div
                  key={route}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
                >
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-300">
                      Route {index + 1}
                    </p>
                    <p className="mt-1 text-base font-semibold">{route}</p>
                  </div>

                  <ChevronRight className="h-5 w-5 text-orange" />
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-orange/20 bg-orange/10 p-4">
              <div className="flex items-center justify-between text-sm text-orange-100">
                <span>Average trip time</span>
                <span className="font-semibold">6h 40m</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyGoVia() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange">
          Why GoVia?
        </p>

        <h2 className="mt-3 text-3xl font-bold text-navy">
          Everything you need for a smooth journey
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {features.map(({ title, description, icon: Icon }) => (
          <div
            key={title}
            className="group rounded-[26px] border border-slate-200 bg-white p-6 shadow-soft transition duration-200 hover:-translate-y-1 hover:border-orange/30 hover:shadow-[0_20px_45px_rgba(255,107,53,0.12)]"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange/15 via-orange/5 to-sky-100 text-orange shadow-inner">
              <Icon className="h-6 w-6" />
            </div>

            <h3 className="text-xl font-bold text-navy">{title}</h3>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PopularRoutes() {
  return (
    <section className="bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fbff_100%)] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange">
              Popular routes
            </p>

            <h2 className="mt-2 text-3xl font-bold text-navy">
              Travel on the routes people love
            </h2>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {popularRoutes.map((route) => (
            <div
              key={route}
              className="group rounded-[26px] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 transition duration-200 hover:-translate-y-1 hover:border-orange/30 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
            >
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-navy">{route}</p>

                <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-success">
                  Popular
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                <span>Comfort rides</span>
                <span className="font-semibold text-navy">From ₹699</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Operators() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange">
          Trusted operators
        </p>

        <h2 className="mt-2 text-3xl font-bold text-navy">
          Popular bus operators
        </h2>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {operators.map((operator) => (
          <div
            key={operator}
            className="rounded-[26px] border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-5 text-center shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)]"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-navy via-[#163a67] to-[#1d4d88] text-lg font-bold text-white shadow-[0_12px_25px_rgba(11,31,58,0.25)]">
              {operator.slice(0, 2).toUpperCase()}
            </div>

            <h3 className="text-lg font-bold text-navy">{operator}</h3>

            <p className="mt-2 text-sm text-slate-500">
              Comfort + reliability
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#0b1f3a] to-[#081a2e] text-slate-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-slate-300">
            Your Route. Your Journey.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
            Company
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li><Link to="/" className="transition hover:text-white">Home</Link></li>
            <li><Link to="/search" className="transition hover:text-white">Bus Tickets</Link></li>
            <li><Link to="/my-bookings" className="transition hover:text-white">My Bookings</Link></li>
            <li><Link to="/help" className="transition hover:text-white">Help</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
            Support
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li><Link to="/help" className="transition hover:text-white">Help Center</Link></li>
            <li><Link to="/help" className="transition hover:text-white">Cancellation Policy</Link></li>
            <li><Link to="/help" className="transition hover:text-white">Terms</Link></li>
            <li><Link to="/help" className="transition hover:text-white">Privacy</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
            Travel Safe
          </h3>
          <p className="mt-4 text-sm text-slate-300">
            Professional booking experience for dependable regional bus journeys.
          </p>
        </div>
      </div>
    </footer>
  );
}

function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <WhyGoVia />
      <PopularRoutes />
      <Operators />
      <Footer />
    </>
  );
}

type BookingRecord = {
  id: number;
  booking_id: string;
  trip_id: number;
  route: string;
  from: string;
  to: string;
  date: string;
  departure: string;
  arrival: string;
  operator: string;
  bus_number: string;
  traveler_name: string;
  seats: number[];
  passenger_count: number;
  status: string;
  payment_status: string;
  amount: number;
};

type BookingFlowState = {
  from: string;
  to: string;
  travelDate: string;
  passengers: string;
  selectedBus: SearchResult;
  selectedSeats: number[];
  travelerName: string;
  travelerPhone: string;
  travelerEmail: string;
};

function formatTripTime(value: string) {
  const [hoursValue, minutes = '00'] = value.split(':');
  const hours = Number(hoursValue);
  if (!Number.isFinite(hours)) return value;
  const suffix = hours >= 12 ? 'PM' : 'AM';
  return `${((hours + 11) % 12) + 1}:${minutes} ${suffix}`;
}

function formatTripDate(value: string) {
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
}

type SearchResult = {
  id: number;
  operator: string;
  busNumber: string;
  busType: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  seats: string;
  rating: number;
  amenities: string[];
  availableSeats: number;
  travelDate: string;
  route: string;
};

type SeatAvailability = {
  trip_id: number;
  total_seats: number;
  booked_seats: number[];
  available_seats: number[];
};

const fallbackSearchResults: SearchResult[] = [
  {
    id: 1,
    operator: 'Skyline Travels',
    busNumber: 'TN 05 AB 2024',
    busType: 'AC Sleeper',
    origin: 'Chennai',
    destination: 'Bangalore',
    departure: '6:30 AM',
    arrival: '1:10 PM',
    duration: '6h 40m',
    price: 699,
    seats: '24 seats left',
    rating: 4.8,
    amenities: ['AC', 'Wi-Fi', 'Charging'],
    availableSeats: 24,
    travelDate: '2026-10-10',
    route: 'Chennai → Bangalore',
  },
  {
    id: 2,
    operator: 'GreenLine Express',
    busNumber: 'TN 12 CD 1890',
    busType: 'AC Seater',
    origin: 'Chennai',
    destination: 'Bangalore',
    departure: '7:45 AM',
    arrival: '2:25 PM',
    duration: '6h 40m',
    price: 799,
    seats: '12 seats left',
    rating: 4.7,
    amenities: ['Sleeper', 'Water', 'USB'],
    availableSeats: 12,
    travelDate: '2026-10-10',
    route: 'Chennai → Bangalore',
  },
  {
    id: 3,
    operator: 'CityRide Travels',
    busNumber: 'TN 22 EF 3011',
    busType: 'Non-AC',
    origin: 'Chennai',
    destination: 'Bangalore',
    departure: '9:00 AM',
    arrival: '3:40 PM',
    duration: '6h 40m',
    price: 899,
    seats: '8 seats left',
    rating: 4.9,
    amenities: ['AC', 'TV', 'Charging'],
    availableSeats: 8,
    travelDate: '2026-10-10',
    route: 'Chennai → Bangalore',
  },
];

const myBookings = [
  {
    id: 'GV-2048',
    route: 'Chennai → Bangalore',
    date: '2026-09-30',
    seats: '2 seats',
    status: 'Confirmed',
    amount: '₹1,398',
  },
  {
    id: 'GV-2014',
    route: 'Chennai → Coimbatore',
    date: '2026-10-02',
    seats: '1 seat',
    status: 'Pending',
    amount: '₹699',
  },
  {
    id: 'GV-1989',
    route: 'Bangalore → Chennai',
    date: '2026-10-05',
    seats: '2 seats',
    status: 'Completed',
    amount: '₹1,398',
  },
];

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [from, setFrom] = useState(searchParams.get('origin') ?? 'Chennai');
  const [to, setTo] = useState(searchParams.get('destination') ?? 'Bangalore');
  const [travelDate, setTravelDate] = useState(
    searchParams.get('travel_date') ?? '2026-10-10',
  );
  const [passengers, setPassengers] = useState('1');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busTypeFilter, setBusTypeFilter] = useState('All');
  const [priceFilter, setPriceFilter] = useState('All');
  const [departureFilter, setDepartureFilter] = useState('Any time');
  const [sortBy, setSortBy] = useState('Recommended');

  const selectedBus =
    searchResults.find((item) => item.id === selectedResult) ?? null;

  const formatTime = (timeValue: string) => {
    const [hours, minutes] = timeValue.split(':').map(Number);
    const safeHours = Number.isFinite(hours) ? hours : 0;
    const safeMinutes = Number.isFinite(minutes) ? minutes : 0;
    const suffix = safeHours >= 12 ? 'PM' : 'AM';
    const normalizedHour = ((safeHours + 11) % 12) + 1;

    return `${normalizedHour}:${String(safeMinutes).padStart(2, '0')} ${suffix}`;
  };

  const formatDuration = (departureTime: string, arrivalTime: string) => {
    const toMinutes = (value: string) => {
      const [hours, minutes] = value.split(':').map(Number);
      return (Number.isFinite(hours) ? hours : 0) * 60 + (Number.isFinite(minutes) ? minutes : 0);
    };

    let diff = toMinutes(arrivalTime) - toMinutes(departureTime);

    if (diff < 0) {
      diff += 24 * 60;
    }

    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;

    return `${hours}h ${minutes}m`;
  };

  const buildAmenities = (busType: string) => {
    const normalized = busType.toLowerCase();

    if (normalized.includes('sleeper')) {
      return ['Sleeper', 'Wi-Fi', 'Water'];
    }

    if (normalized.includes('ac')) {
      return ['AC', 'Wi-Fi', 'USB'];
    }

    return ['Wi-Fi', 'Charging', 'Water'];
  };

  const formatDateLabel = (dateValue: string) => {
    if (!dateValue) {
      return '';
    }

    const parsed = new Date(`${dateValue}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) {
      return dateValue;
    }

    return parsed.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleSearch = () => {
    const cleanFrom = from.trim();
    const cleanTo = to.trim();

    if (!cleanFrom || !cleanTo) {
      setError('Please enter both origin and destination.');
      setSearchResults([]);
      setSelectedResult(null);
      return;
    }

    if (!travelDate) {
      setError('Please select a travel date.');
      setSearchResults([]);
      setSelectedResult(null);
      return;
    }

    if (cleanFrom.toLowerCase() === cleanTo.toLowerCase()) {
      setError('Origin and destination must be different.');
      setSearchResults([]);
      setSelectedResult(null);
      return;
    }

    setSearchParams({
      origin: cleanFrom,
      destination: cleanTo,
      travel_date: travelDate,
    });
  };

  useEffect(() => {
    const nextOrigin = searchParams.get('origin') ?? 'Chennai';
    const nextDestination = searchParams.get('destination') ?? 'Bangalore';
    const nextTravelDate = searchParams.get('travel_date') ?? '2026-10-10';

    setFrom(nextOrigin);
    setTo(nextDestination);
    setTravelDate(nextTravelDate);

    const cleanFrom = nextOrigin.trim();
    const cleanTo = nextDestination.trim();

    if (!cleanFrom || !cleanTo || !nextTravelDate) {
      setSearchResults([]);
      setSelectedResult(null);
      setError('Please enter a valid route and date.');
      return;
    }

    if (cleanFrom.toLowerCase() === cleanTo.toLowerCase()) {
      setSearchResults([]);
      setSelectedResult(null);
      setError('Origin and destination must be different.');
      return;
    }

    const loadTrips = async () => {
      setLoading(true);
      setError(null);

      try {
        const payload = await apiClient.request<Array<{
          id: number;
          origin: string;
          destination: string;
          travel_date: string;
          departure_time: string;
          arrival_time: string;
          operator: string;
          bus_number: string;
          bus_type: string;
          fare: number;
          total_seats: number;
          status: string;
        }>>(
          `/api/trips/search?origin=${encodeURIComponent(cleanFrom)}&destination=${encodeURIComponent(cleanTo)}&travel_date=${encodeURIComponent(nextTravelDate)}`,
        );

        const mappedResults: SearchResult[] = payload.map((trip) => ({
          id: trip.id,
          operator: trip.operator,
          busNumber: trip.bus_number,
          busType: trip.bus_type,
          origin: trip.origin,
          destination: trip.destination,
          departure: formatTime(trip.departure_time),
          arrival: formatTime(trip.arrival_time),
          duration: formatDuration(trip.departure_time, trip.arrival_time),
          price: Number(trip.fare),
          seats: `${trip.total_seats} seats left`,
          rating: 4.8,
          amenities: buildAmenities(trip.bus_type),
          availableSeats: trip.total_seats,
          travelDate: trip.travel_date,
          route: `${trip.origin} → ${trip.destination}`,
        }));

        setSearchResults(mappedResults);
        setSelectedResult(mappedResults[0]?.id ?? null);
      } catch (loadError) {
        setSearchResults([]);
        setSelectedResult(null);
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load buses. Please check your connection and try again.',
        );
      } finally {
        setLoading(false);
      }
    };

    void loadTrips();
  }, [searchParams]);

  const filteredResults = useMemo(() => {
    const items = [...searchResults];
    return items
      .filter((result) => {
        const matchesBusType =
          busTypeFilter === 'All' || result.busType === busTypeFilter;
        const matchesPrice =
          priceFilter === 'All' ||
          (priceFilter === 'Under ₹700' && result.price < 700) ||
          (priceFilter === '₹700–₹1000' && result.price >= 700 && result.price <= 1000) ||
          (priceFilter === 'Above ₹1000' && result.price > 1000);
        const departureHour = Number(result.departure.split(':')[0].replace(/\D/g, ''));
        const matchesDeparture =
          departureFilter === 'Any time' ||
          (departureFilter === 'Morning' && departureHour >= 5 && departureHour < 12) ||
          (departureFilter === 'Afternoon' && departureHour >= 12 && departureHour < 17) ||
          (departureFilter === 'Evening' && departureHour >= 17 && departureHour < 21) ||
          (departureFilter === 'Night' && (departureHour >= 21 || departureHour < 5));

        return matchesBusType && matchesPrice && matchesDeparture;
      })
      .sort((left, right) => {
        if (sortBy === 'Lowest Price' || sortBy === 'Recommended') {
          return left.price - right.price;
        }
        if (sortBy === 'Earliest Departure') {
          return Number(left.departure.split(':')[0].replace(/\D/g, '')) -
            Number(right.departure.split(':')[0].replace(/\D/g, ''));
        }
        return 0;
      });
  }, [busTypeFilter, departureFilter, priceFilter, searchResults, sortBy]);

  const handleContinueBooking = () => {
    if (!selectedBus) return;
    const bookingState = { from, to, travelDate, passengers, selectedBus };

    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          returnTo: `/checkout?trip_id=${selectedBus.id}`,
          bookingState,
        },
      });
      return;
    }

    navigate(`/checkout?trip_id=${selectedBus.id}`, { state: bookingState });
  };

  const searchableTitle = `${from || 'Chennai'} → ${to || 'Bangalore'}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_20px_55px_rgba(15,23,42,0.06)] md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                From
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                <MapPinned className="h-4 w-4 text-orange" />
                <input
                  value={from}
                  onChange={(event) => setFrom(event.target.value)}
                  className="w-full bg-transparent text-sm text-slate-700 outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              aria-label="Swap route"
              onClick={() => {
                const currentFrom = from;
                setFrom(to);
                setTo(currentFrom);
              }}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <ArrowRightLeft className="h-5 w-5" />
            </button>

            <div className="flex-1">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                To
              </label>

              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                <MapPinned className="h-4 w-4 text-orange" />

                <input
                  value={to}
                  onChange={(event) => setTo(event.target.value)}
                  className="w-full bg-transparent text-sm text-slate-700 outline-none"
                />
              </div>
            </div>

            <div className="flex-1">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Date
              </label>

              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                <CalendarDays className="h-4 w-4 text-orange" />

                <input
                  type="date"
                  value={travelDate}
                  onChange={(event) => setTravelDate(event.target.value)}
                  className="w-full bg-transparent text-sm text-slate-700 outline-none"
                />
              </div>
            </div>

            <div className="w-full md:w-48">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Passengers
              </label>

              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                <Users className="h-4 w-4 text-orange" />

                <select
                  value={passengers}
                  onChange={(event) => setPassengers(event.target.value)}
                  className="w-full bg-transparent text-sm text-slate-700 outline-none"
                >
                  <option value="1">1 Passenger</option>
                  <option value="2">2 Passengers</option>
                  <option value="3">3 Passengers</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSearch}
              className="rounded-full bg-gradient-to-r from-navy to-[#1b3a63] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(11,31,58,0.15)]"
            >
              Search buses
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange">
              Available buses
            </p>

            <h1 className="mt-2 text-3xl font-bold text-navy">
              {searchableTitle}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {travelDate ? formatDateLabel(travelDate) : 'Select a date'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={busTypeFilter}
              onChange={(event) => setBusTypeFilter(event.target.value)}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
            >
              <option value="All">All bus types</option>
              <option value="AC Seater">AC Seater</option>
              <option value="AC Sleeper">AC Sleeper</option>
              <option value="Non-AC">Non-AC</option>
            </select>

            <select
              value={priceFilter}
              onChange={(event) => setPriceFilter(event.target.value)}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
            >
              <option value="All">All prices</option>
              <option value="Under ₹700">Under ₹700</option>
              <option value="₹700–₹1000">₹700–₹1000</option>
              <option value="Above ₹1000">Above ₹1000</option>
            </select>

            <select
              value={departureFilter}
              onChange={(event) => setDepartureFilter(event.target.value)}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
            >
              <option value="Any time">Any time</option>
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening</option>
              <option value="Night">Night</option>
            </select>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
            >
              <option value="Recommended">Recommended</option>
              <option value="Lowest Price">Lowest Price</option>
              <option value="Earliest Departure">Earliest Departure</option>
            </select>
          </div>
        </div>

        <div className="mt-8 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            {loading && (
              <div className="space-y-5">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="animate-pulse rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_22px_40px_rgba(15,23,42,0.04)]">
                    <div className="h-5 w-48 rounded bg-slate-200" />
                    <div className="mt-4 h-4 w-32 rounded bg-slate-200" />
                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                      <div className="h-16 rounded bg-slate-200" />
                      <div className="h-16 rounded bg-slate-200" />
                      <div className="h-16 rounded bg-slate-200" />
                    </div>
                    <div className="mt-6 h-10 w-40 rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            )}

            {!loading && !error && filteredResults.length === 0 && searchResults.length === 0 && (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-[0_22px_40px_rgba(15,23,42,0.04)]">
                <h2 className="text-2xl font-bold text-navy">No buses found</h2>
                <p className="mt-3 text-slate-600">
                  We couldn't find buses for:<br />
                  <span className="font-semibold text-slate-800">{searchableTitle}</span>
                  <br />
                  {formatDateLabel(travelDate)}
                </p>
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="mt-6 rounded-full bg-gradient-to-r from-orange to-[#ef5d2a] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(255,107,53,0.25)]"
                >
                  Modify Search
                </button>
              </div>
            )}

            {!loading && error && (
              <div className="rounded-[28px] border border-red-200 bg-red-50 p-8 text-center shadow-[0_22px_40px_rgba(15,23,42,0.04)]">
                <h2 className="text-2xl font-bold text-red-700">Unable to load buses</h2>
                <p className="mt-3 text-red-600">{error}</p>
                <button
                  type="button"
                  onClick={handleSearch}
                  className="mt-6 rounded-full bg-gradient-to-r from-navy to-[#1b3a63] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(11,31,58,0.15)]"
                >
                  Try Again
                </button>
              </div>
            )}

            {!loading && !error && filteredResults.map((bus) => (
              <div
                key={bus.id}
                className={`rounded-[28px] border p-5 shadow-[0_22px_40px_rgba(15,23,42,0.04)] transition ${
                  selectedResult === bus.id ? 'border-orange/40 bg-orange/[0.02]' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-navy to-[#183867] text-sm font-bold text-white">
                        {bus.operator.slice(0, 2).toUpperCase()}
                      </div>

                      <div>
                        <h2 className="text-xl font-bold text-navy">{bus.operator}</h2>
                        <p className="text-sm text-slate-500">
                          {bus.busNumber} · {bus.busType}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
                    <span>★</span>
                    {bus.rating}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_1fr]">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Departure
                    </p>
                    <p className="mt-2 text-2xl font-bold text-navy">{bus.departure}</p>
                    <p className="mt-1 text-sm text-slate-500">{bus.origin}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Duration
                    </p>
                    <p className="mt-2 text-2xl font-bold text-navy">{bus.duration}</p>
                    <p className="mt-1 text-sm text-slate-500">{bus.destination}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Arrival
                    </p>
                    <p className="mt-2 text-2xl font-bold text-navy">{bus.arrival}</p>
                    <p className="mt-1 text-sm text-slate-500">{bus.destination}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {bus.amenities.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Fare
                    </p>
                    <p className="mt-1 text-3xl font-black text-navy">₹{bus.price}</p>
                    <p className="mt-1 text-sm text-slate-500">{bus.seats}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedResult(bus.id)}
                    className="rounded-full bg-gradient-to-r from-orange to-[#ef5d2a] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(255,107,53,0.25)]"
                  >
                    {selectedResult === bus.id ? 'Selected' : 'View Seats'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <aside className="rounded-[30px] border border-slate-200 bg-gradient-to-br from-[#0b1f3a] via-[#122d4b] to-[#183867] p-6 text-white shadow-[0_28px_70px_rgba(11,31,58,0.14)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              Trip summary
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              {searchableTitle}
            </h2>

            <div className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between text-sm text-slate-200">
                <span>Departure</span>
                <span>{travelDate ? formatDateLabel(travelDate) : 'Select date'}</span>
              </div>

              <div className="flex items-center justify-between text-sm text-slate-200">
                <span>Passengers</span>
                <span>{passengers} adult(s)</span>
              </div>

              <div className="flex items-center justify-between text-sm text-slate-200">
                <span>Selected bus</span>
                <span>
                  {selectedBus ? selectedBus.operator : 'Choose a bus'}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm text-slate-200">
                <span>Fare</span>
                <span>
                  {selectedBus ? `₹${selectedBus.price}` : '—'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleContinueBooking}
              disabled={!selectedBus}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-orange to-[#ef5d2a] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(255,107,53,0.25)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Continue booking
            </button>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function TicketCard({ booking, onView, onCancel, showActions = true }: { booking: BookingRecord; onView: () => void; onCancel: () => void; showActions?: boolean }) {
  return (
    <article className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-slate-300 bg-slate-50 px-5 py-4">
        <div className="flex items-center gap-3">
          <img src="/images/logo.png" alt="GoVia" className="h-10 w-auto" />
          <div>
            <p className="font-black text-navy">GoVia bus ticket</p>
            <p className="text-xs text-slate-500">Booking {booking.booking_id}</p>
          </div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${booking.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
          {booking.status}
        </span>
      </header>

      <div className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Route</p>
            <h2 className="mt-1 text-xl font-black text-navy">{booking.route}</h2>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Amount</p>
            <p className="mt-1 text-xl font-black text-navy">₹{new Intl.NumberFormat('en-IN').format(booking.amount)}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 border-t border-dashed border-slate-300 pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <div><p className="text-xs uppercase text-slate-500">Operator / Bus</p><p className="mt-1 font-semibold text-navy">{booking.operator}</p><p className="text-sm text-slate-600">{booking.bus_number}</p></div>
          <div><p className="text-xs uppercase text-slate-500">Travel date</p><p className="mt-1 font-semibold text-navy">{formatTripDate(booking.date)}</p></div>
          <div><p className="text-xs uppercase text-slate-500">Departure / Arrival</p><p className="mt-1 font-semibold text-navy">{formatTripTime(booking.departure)} - {formatTripTime(booking.arrival)}</p></div>
          <div><p className="text-xs uppercase text-slate-500">Seats</p><p className="mt-1 font-semibold text-navy">{booking.seats.length ? booking.seats.join(', ') : 'Not assigned'}</p></div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="text-sm text-slate-600">
            Passenger: <span className="font-semibold text-navy">{booking.traveler_name}</span>
            <span className="mx-2 text-slate-300">|</span>
            Payment: <span className="font-semibold text-emerald-700">{booking.payment_status === 'PAID' ? 'Paid' : booking.payment_status}</span>
          </div>
          {showActions ? <div className="flex gap-2">
            <button type="button" onClick={onView} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-navy hover:bg-slate-50">
              <Ticket size={16} /> View Ticket
            </button>
            {booking.status === 'CONFIRMED' ? (
              <button type="button" onClick={onCancel} className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
                Cancel Booking
              </button>
            ) : null}
          </div> : null}
        </div>
      </div>
    </article>
  );
}

function MyBookingsPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState('');
  const [ticketBooking, setTicketBooking] = useState<BookingRecord | null>(null);
  const [cancelTarget, setCancelTarget] = useState<BookingRecord | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const loadBookings = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const payload = await apiClient.request<{ bookings: BookingRecord[] }>(
        '/api/bookings/me',
      );
      setBookings(payload.bookings);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : 'Unable to load your bookings.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBookings();
  }, []);

  const confirmCancellation = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    setLoadError('');
    try {
      await apiClient.request(`/api/bookings/${cancelTarget.id}/cancel`, {
        method: 'PATCH',
      });
      setCancelTarget(null);
      setNotice('Booking cancelled successfully.');
      await loadBookings();
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : 'Unable to cancel this booking.',
      );
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.06)] md:p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange">
                Your trips
              </p>

              <h1 className="mt-2 text-3xl font-bold text-navy">
                My Bookings
              </h1>
            </div>

            <Link
              to="/search"
              className="rounded-full bg-gradient-to-r from-orange to-[#ef5d2a] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(255,107,53,0.25)]"
            >
              Book another trip
            </Link>
          </div>

          {notice ? (
            <div role="status" className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              {notice}
            </div>
          ) : null}

          {loadError ? (
            <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {loadError}
            </div>
          ) : null}

          {loading ? (
            <div className="mt-8 text-sm text-slate-500">
              Loading your bookings...
            </div>
          ) : bookings.length === 0 ? (
            <div className="mt-8 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <h2 className="text-2xl font-bold text-navy">No bookings yet</h2>
              <p className="mt-3 text-slate-600">
                Your confirmed trips will appear here once you book.
              </p>

              <Link
                to="/search"
                className="mt-6 inline-flex rounded-full bg-gradient-to-r from-orange to-[#ef5d2a] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(255,107,53,0.25)]"
              >
                Search trips
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {bookings.map((booking) => (
                <TicketCard
                  key={booking.id}
                  booking={booking}
                  onView={() => setTicketBooking(booking)}
                  onCancel={() => setCancelTarget(booking)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {ticketBooking ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#071b35]/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Booking ticket">
          <div className="w-full max-w-2xl">
            <div className="mb-3 flex justify-end">
              <button type="button" onClick={() => setTicketBooking(null)} aria-label="Close ticket" className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow">
                <X size={18} />
              </button>
            </div>
            <TicketCard booking={ticketBooking} onView={() => undefined} onCancel={() => undefined} showActions={false} />
          </div>
        </div>
      ) : null}

      {cancelTarget ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#071b35]/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="cancel-booking-title">
          <div className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl">
            <h2 id="cancel-booking-title" className="text-xl font-black text-navy">Cancel this booking?</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">This action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" disabled={cancelling} onClick={() => setCancelTarget(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-60">Keep Booking</button>
              <button type="button" disabled={cancelling} onClick={() => void confirmCancellation()} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                {cancelling ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <Footer />
    </div>
  );
}

function BookingConfirmationPage() {
  const location = useLocation();
  const state = location.state as {
    message?: string;
    booking?: BookingRecord;
    payment_method?: string;
  } | null;

  const booking = state?.booking;
  const message = booking
    ? state?.message ?? 'Booking confirmed successfully.'
    : 'Booking details are unavailable. Check My Bookings for the latest status.';

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[30px] border border-emerald-200 bg-white p-8 shadow-[0_22px_55px_rgba(15,23,42,0.06)]">
          <div className={`flex items-center gap-3 ${booking ? 'text-emerald-600' : 'text-amber-700'}`}>
            <CheckCircle2 className="h-8 w-8" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em]">
              {booking ? 'Booking confirmed' : 'Confirmation unavailable'}
            </p>
          </div>

          <h1 className="mt-4 text-3xl font-black text-navy">
            {message}
          </h1>

          {booking ? (
            <div className="mt-8">
              <TicketCard booking={booking} onView={() => undefined} onCancel={() => undefined} showActions={false} />
              <p className="mt-3 text-sm text-slate-500">Payment status: <span className="font-semibold text-emerald-700">{booking.payment_status}</span>{state?.payment_method ? ` · ${state.payment_method.replace('_', ' ')}` : ''}</p>
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/my-bookings"
              className="rounded-full bg-gradient-to-r from-orange to-[#ef5d2a] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(255,107,53,0.25)]"
            >
              View My Bookings
            </Link>

            <Link
              to="/search"
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const trip = location.state as {
    from?: string;
    to?: string;
    travelDate?: string;
    passengers?: string;
    selectedBus?: SearchResult;
    selectedSeats?: number[];
    travelerName?: string;
    travelerPhone?: string;
    travelerEmail?: string;
  } | null;

  const from = trip?.from ?? '';
  const to = trip?.to ?? '';
  const travelDate = trip?.travelDate ?? '';
  const passengers = Number(trip?.passengers ?? '1');
  const selectedBus = trip?.selectedBus;
  const total = (selectedBus?.price ?? 0) * passengers;

  const [travelerName, setTravelerName] = useState(
    trip?.travelerName ?? user?.name ?? '',
  );

  const [travelerPhone, setTravelerPhone] = useState(
    trip?.travelerPhone ?? user?.phone ?? '',
  );

  const [travelerEmail, setTravelerEmail] = useState(
    trip?.travelerEmail ?? user?.email ?? '',
  );

  const [seatAvailability, setSeatAvailability] =
    useState<SeatAvailability | null>(null);

  const [selectedSeats, setSelectedSeats] = useState<number[]>(trip?.selectedSeats ?? []);
  const [loadingSeats, setLoadingSeats] = useState(true);
  const [seatMessage, setSeatMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedBus?.id) {
      setSeatAvailability(null);
      setSelectedSeats([]);
      setSeatMessage('Trip details are missing. Return to search and select a real bus.');
      setLoadingSeats(false);
      return;
    }

    const loadSeatAvailability = async () => {
      setLoadingSeats(true);
      try {
        setSeatMessage(null);
        const payload = await apiClient.request<SeatAvailability>(
          `/api/trips/${selectedBus.id}/seats`,
        );

        setSeatAvailability(payload);
        setSelectedSeats(trip?.selectedSeats ?? []);
      } catch (error) {
        setSeatAvailability(null);
        setSeatMessage(
          error instanceof Error
            ? error.message
            : 'Unable to load seat availability for this trip.',
        );
      } finally {
        setLoadingSeats(false);
      }
    };

    void loadSeatAvailability();
  }, [selectedBus?.id]);

  const toggleSeat = (seatNumber: number) => {
    if (
      !seatAvailability ||
      !seatAvailability.available_seats.includes(seatNumber)
    ) {
      return;
    }

    if (selectedSeats.includes(seatNumber)) {
      setSeatMessage(null);
      setSelectedSeats((current) =>
        current.filter((seat) => seat !== seatNumber),
      );
      return;
    }

    if (selectedSeats.length >= passengers) {
      window.alert(
        `You can select up to ${passengers} seat${passengers === 1 ? '' : 's'} for this trip.`,
      );
      return;
    }

    setSelectedSeats((current) =>
      [...current, seatNumber].sort((a, b) => a - b),
    );
    setSeatMessage(null);
  };

  const handleContinueToPayment = () => {
    if (!selectedBus?.id) {
      setSeatMessage('Trip details are missing. Return to search and select a real bus.');
      return;
    }

    if (!seatAvailability) {
      setSeatMessage('Seat availability could not be verified. Reload the trip before continuing.');
      return;
    }

    if (selectedSeats.length !== passengers) {
      setSeatMessage(`Select exactly ${passengers} seat${passengers === 1 ? '' : 's'} to continue.`);
      return;
    }

    if (!travelerName.trim() || !travelerPhone.trim() || !travelerEmail.trim()) {
      setSeatMessage('Enter the traveler name, phone, and email to continue.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(travelerEmail.trim())) {
      setSeatMessage('Enter a valid traveler email address.');
      return;
    }

    const bookingState: BookingFlowState = {
      from,
      to,
      travelDate,
      passengers: String(passengers),
      selectedBus,
      selectedSeats,
      travelerName: travelerName.trim(),
      travelerPhone: travelerPhone.trim(),
      travelerEmail: travelerEmail.trim(),
    };

    navigate('/payment', { state: { booking: bookingState } });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_22px_55px_rgba(15,23,42,0.06)] md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange">
                Booking summary
              </p>

              <h1 className="mt-2 text-3xl font-bold text-navy">
                Review your trip
              </h1>
            </div>

            <Link
              to="/search"
              className="text-sm font-semibold text-slate-600 transition hover:text-navy"
            >
              Back to search
            </Link>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-bold text-navy">
                    Select seat{passengers > 1 ? 's' : ''}
                  </h2>

                  <span className="rounded-full bg-orange/10 px-3 py-1 text-xs font-semibold text-orange">
                    {selectedSeats.length}/{passengers} chosen
                  </span>
                </div>

                {loadingSeats ? (
                  <div className="mt-4 text-sm text-slate-500">
                    Loading seat availability...
                  </div>
                ) : seatMessage ? (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    {seatMessage}
                  </div>
                ) : (
                  <div className="mt-5 grid grid-cols-4 gap-3 sm:grid-cols-6">
                    {Array.from(
                      { length: seatAvailability?.total_seats ?? 0 },
                      (_, index) => index + 1,
                    ).map((seat) => {
                      const isBooked =
                        seatAvailability?.booked_seats.includes(seat) ??
                        false;

                      const isSelected = selectedSeats.includes(seat);

                      return (
                        <button
                          key={seat}
                          type="button"
                          onClick={() => toggleSeat(seat)}
                          disabled={isBooked}
                          className={`flex h-12 items-center justify-center rounded-2xl text-sm font-semibold transition ${
                            isBooked
                              ? 'cursor-not-allowed bg-slate-200 text-slate-500 line-through'
                              : isSelected
                                ? 'bg-orange text-white shadow-[0_12px_24px_rgba(255,107,53,0.25)]'
                                : 'border border-slate-200 bg-white text-slate-700 hover:border-orange/40 hover:text-orange'
                          }`}
                        >
                          {seat}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
                <h2 className="text-xl font-bold text-navy">
                  Traveler details
                </h2>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Full name
                    </label>

                    <input
                      value={travelerName}
                      onChange={(e) => { setTravelerName(e.target.value); setSeatMessage(null); }}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Phone
                    </label>

                    <input
                      value={travelerPhone}
                      onChange={(e) => { setTravelerPhone(e.target.value); setSeatMessage(null); }}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Email
                    </label>

                    <input
                      value={travelerEmail}
                      onChange={(e) => { setTravelerEmail(e.target.value); setSeatMessage(null); }}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none"
                    />
                  </div>
                </div>
              </div>

            </div>

            <aside className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-[#0b1f3a] to-[#173867] p-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                Trip summary
              </p>

              <h2 className="mt-3 text-2xl font-bold">
                {from} → {to}
              </h2>

              <div className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                <div className="flex items-center justify-between">
                  <span>Bus</span>
                  <span>{selectedBus?.operator ?? 'Trip unavailable'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Departure</span>
                  <span>{travelDate ? formatTripDate(travelDate) : '—'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Passengers</span>
                  <span>{passengers}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Seats</span>
                  <span>
                    {selectedSeats.length > 0
                      ? selectedSeats.join(', ')
                      : 'Not selected'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Duration</span>
                  <span>{selectedBus?.duration ?? '—'}</span>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-orange/20 bg-orange/10 p-4">
                <div className="flex items-center justify-between text-sm text-orange-100">
                  <span>Total</span>
                  <span className="text-2xl font-black text-white">
                    ₹{total}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleContinueToPayment}
                disabled={loadingSeats || !selectedBus?.id}
                className="mt-6 w-full rounded-2xl bg-white px-4 py-3 text-sm font-bold text-navy shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Continue to payment
              </button>
            </aside>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const flow = (location.state as { booking?: BookingFlowState } | null)?.booking;
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NET_BANKING'>('UPI');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const total = flow
    ? flow.selectedBus.price * Number(flow.passengers)
    : 0;

  const handlePay = async () => {
    if (!flow || !flow.selectedBus.id) {
      setError('Payment details are missing. Return to search and start again.');
      return;
    }
    if (flow.selectedSeats.length !== Number(flow.passengers)) {
      setError('The selected seats do not match the passenger count. Return to the summary and update your seats.');
      return;
    }
    if (!flow.travelerName.trim() || !flow.travelerPhone.trim() || !flow.travelerEmail.trim()) {
      setError('Traveler details are incomplete. Return to the booking summary.');
      return;
    }

    setProcessing(true);
    setError('');
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 900));
      const response = await apiClient.request<{
        message: string;
        booking: BookingRecord;
      }>('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trip_id: flow.selectedBus.id,
          passenger_count: Number(flow.passengers),
          selected_seats: flow.selectedSeats,
          traveler_name: flow.travelerName,
          traveler_phone: flow.travelerPhone,
          traveler_email: flow.travelerEmail,
        }),
      });

      navigate('/booking-confirmation', {
        replace: true,
        state: {
          message: response.message,
          booking: response.booking,
          payment_method: paymentMethod,
        },
      });
    } catch (paymentError) {
      const detail = paymentError instanceof Error
        ? paymentError.message
        : 'The booking could not be confirmed.';
      setError(`Payment could not be completed: ${detail}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_22px_55px_rgba(15,23,42,0.06)] md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange">GoVia Payment</p>
              <h1 className="mt-2 text-3xl font-black text-navy">Complete payment</h1>
            </div>
            <Link to="/checkout" state={flow ? { ...flow, selectedSeats: flow.selectedSeats } : null} className="text-sm font-semibold text-slate-600 hover:text-navy">Back to summary</Link>
          </div>

          {!flow ? (
            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
              Payment details expired. Return to trip search and select a bus again.
              <div><Link to="/search" className="mt-3 inline-flex font-bold underline">Search buses</Link></div>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
              <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <h2 className="text-lg font-bold text-navy">Trip details</h2>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-4"><span className="text-slate-500">Route</span><span className="text-right font-semibold text-navy">{flow.from} → {flow.to}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-slate-500">Operator / Bus</span><span className="text-right font-semibold text-navy">{flow.selectedBus.operator} / {flow.selectedBus.busNumber}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-slate-500">Travel date</span><span className="font-semibold text-navy">{formatTripDate(flow.travelDate)}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-slate-500">Seats</span><span className="font-semibold text-navy">{flow.selectedSeats.join(', ')}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-slate-500">Number of seats</span><span className="font-semibold text-navy">{flow.selectedSeats.length}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-slate-500">Fare per seat</span><span className="font-semibold text-navy">₹{flow.selectedBus.price}</span></div>
                  <div className="flex justify-between gap-4 border-t border-slate-200 pt-3"><span className="font-bold text-navy">Total amount</span><span className="text-xl font-black text-navy">₹{new Intl.NumberFormat('en-IN').format(total)}</span></div>
                </div>
              </section>

              <section className="rounded-[24px] border border-slate-200 p-5">
                <h2 className="text-lg font-bold text-navy">Payment method</h2>
                <div className="mt-4 space-y-3">
                  {([
                    ['UPI', 'UPI', Smartphone],
                    ['CARD', 'Credit / Debit Card', CreditCard],
                    ['NET_BANKING', 'Net Banking', Landmark],
                  ] as const).map(([value, label, Icon]) => (
                    <label key={value} className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${paymentMethod === value ? 'border-orange bg-orange/5' : 'border-slate-200 hover:border-slate-300'}`}>
                      <input type="radio" name="payment-method" value={value} checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} className="accent-orange" />
                      <Icon size={19} className="text-orange" />
                      <span className="text-sm font-semibold text-navy">{label}</span>
                    </label>
                  ))}
                </div>
                <p className="mt-4 text-xs leading-5 text-slate-500">Demo payment simulation only. No real payment provider is connected and no card or bank details are collected.</p>
                {processing ? <div role="status" className="mt-4 flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800"><LoaderCircle size={17} className="animate-spin" />Processing payment...</div> : null}
                {error ? <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><p className="font-semibold">Payment failed</p><p className="mt-1">{error}</p></div> : null}
                <button type="button" onClick={() => void handlePay()} disabled={processing || !flow.selectedBus.id} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange to-[#ef5d2a] px-5 py-3.5 text-sm font-bold text-white shadow-[0_16px_30px_rgba(255,107,53,0.25)] disabled:cursor-not-allowed disabled:opacity-60">
                  {processing ? <LoaderCircle size={17} className="animate-spin" /> : null}
                  {processing ? 'Processing payment...' : `Pay ₹${new Intl.NumberFormat('en-IN').format(total)}`}
                </button>
                {error ? <button type="button" onClick={() => void handlePay()} disabled={processing} className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-navy disabled:opacity-50">Retry Payment</button> : null}
              </section>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

type AdminTrip = {
  id: number;
  route: string;
  operator: string;
  bus_number: string;
  date: string;
  departure: string;
  arrival: string;
  fare: number;
  status: string;
  seats_left: number;
};

type AdminBus = {
  id: number;
  operatorId: number;
  busNumber: string;
  operator: string;
  busType: string;
  seats: number;
  registration: string;
  amenities: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
};

type AdminBooking = {
  id: string;
  passenger: string;
  email: string;
  route: string;
  bus: string;
  date: string;
  seats: string;
  amount: number;
  status: 'CONFIRMED' | 'CANCELLED' | 'PENDING';
};

type AdminSection =
  | 'dashboard'
  | 'fleet'
  | 'trips'
  | 'bookings'
  | 'cancellations'
  | 'revenue'
  | 'users'
  | 'reports'
  | 'security';

function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] =
    useState<AdminSection>('dashboard');

  const [trips, setTrips] = useState<AdminTrip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);

  const [adminBookings, setAdminBookings] = useState<AdminBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const [buses, setBuses] = useState<AdminBus[]>([]);
  const [loadingBuses, setLoadingBuses] = useState(true);

  const [operatorOptions, setOperatorOptions] = useState<Array<{ id: number; name: string }>>([]);

  const [showBusModal, setShowBusModal] = useState(false);
  const [editingBus, setEditingBus] = useState<AdminBus | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [bookingFilter, setBookingFilter] = useState('ALL');

  const [busForm, setBusForm] = useState({
    busNumber: '',
    operator: 'Skyline Travels',
    busType: 'AC Seater',
    seats: '24',
    registration: '',
    amenities: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE',
  });

  const loadTrips = async () => {
    setLoadingTrips(true);

    try {
      const payload = await apiClient.request<{ trips: AdminTrip[] }>(
        '/api/admin/trips',
      );

      setTrips(payload.trips);
    } catch {
      setTrips([]);
    } finally {
      setLoadingTrips(false);
    }
  };

  const loadBuses = async () => {
    setLoadingBuses(true);

    try {
      const payload = await apiClient.request<{
        buses: Array<{
          id: number;
          operator_id: number;
          operator: string;
          bus_number: string;
          registration_number: string | null;
          bus_type: string;
          total_seats: number;
          amenities: string | null;
          status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
        }>;
      }>('/api/admin/buses');

      const mappedBuses: AdminBus[] = payload.buses.map((bus) => ({
        id: bus.id,
        operatorId: bus.operator_id,
        busNumber: bus.bus_number,
        operator: bus.operator,
        busType: bus.bus_type,
        seats: bus.total_seats,
        registration: bus.registration_number ?? '',
        amenities: bus.amenities ?? '',
        status: bus.status,
      }));

      setBuses(mappedBuses);
    } catch (error) {
      console.error('Failed to load buses:', error);
      setBuses([]);
    } finally {
      setLoadingBuses(false);
    }
  };

  const loadOperators = async () => {
    try {
      const payload = await apiClient.request<Array<{ id: number; name: string }>>('/api/operators/');
      setOperatorOptions(payload);
    } catch (error) {
      console.error('Failed to load operators:', error);
      setOperatorOptions([]);
    }
  };

  const loadBookings = async () => {
    setLoadingBookings(true);

    try {
      const payload = await apiClient.request<{
        bookings: Array<{
          id: number;
          user: string;
          email: string;
          route: string;
          bus: string;
          date: string;
          seats: string;
          amount: number;
          status: string;
        }>;
      }>('/api/admin/bookings');

      const mappedBookings: AdminBooking[] = payload.bookings.map((booking) => ({
        id: `GV-${String(booking.id).padStart(5, '0')}`,
        passenger: booking.user,
        email: booking.email,
        route: booking.route,
        bus: booking.bus,
        date: booking.date,
        seats: booking.seats,
        amount: Number(booking.amount ?? 0),
        status: (booking.status as AdminBooking['status']) || 'CONFIRMED',
      }));

      setAdminBookings(mappedBookings);
    } catch (error) {
      console.error('Failed to load admin bookings:', error);
      setAdminBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    void loadTrips();
    void loadBuses();
    void loadOperators();
    void loadBookings();
  }, []);

  const totalRevenue = useMemo(
    () =>
      adminBookings
        .filter((booking) => booking.status === 'CONFIRMED')
        .reduce((sum, booking) => sum + booking.amount, 0),
    [],
  );

  const confirmedBookings = adminBookings.filter(
    (booking) => booking.status === 'CONFIRMED',
  ).length;

  const cancelledBookings = adminBookings.filter(
    (booking) => booking.status === 'CANCELLED',
  ).length;

  const availableSeats = trips.reduce(
    (sum, trip) => sum + trip.seats_left,
    0,
  );

  const totalSeats = buses.reduce((sum, bus) => sum + bus.seats, 0);

  const occupancy =
    totalSeats > 0
      ? Math.round(
          ((totalSeats - availableSeats) / totalSeats) * 100,
        )
      : 18;

  const filteredBookings = adminBookings.filter((booking) => {
    const matchesFilter =
      bookingFilter === 'ALL' || booking.status === bookingFilter;

    const search = searchTerm.toLowerCase();
    const matchesSearch =
      booking.id.toLowerCase().includes(search) ||
      booking.passenger.toLowerCase().includes(search) ||
      booking.route.toLowerCase().includes(search) ||
      booking.email.toLowerCase().includes(search);

    return matchesFilter && matchesSearch;
  });

  const openAddBus = () => {
    setEditingBus(null);
    setBusForm({
      busNumber: '',
      operator: 'Skyline Travels',
      busType: 'AC Seater',
      seats: '24',
      registration: '',
      amenities: '',
      status: 'ACTIVE',
    });
    setShowBusModal(true);
  };

  const openEditBus = (bus: AdminBus) => {
    setEditingBus(bus);
    setBusForm({
      busNumber: bus.busNumber,
      operator: bus.operator,
      busType: bus.busType,
      seats: String(bus.seats),
      registration: bus.registration,
      amenities: bus.amenities,
      status: bus.status,
    });
    setShowBusModal(true);
  };

  const saveBus = async () => {
    const selectedOperator = operatorOptions.find((operator) => operator.name === busForm.operator);

    if (!selectedOperator) {
      window.alert('Please select a valid operator before saving the bus.');
      return;
    }

    const payload = {
      operator_id: selectedOperator.id,
      bus_number: busForm.busNumber.trim(),
      bus_type: busForm.busType,
      total_seats: Number(busForm.seats),
      registration_number: busForm.registration.trim() || null,
      amenities: busForm.amenities.trim() || null,
      status: busForm.status,
    };

    try {
      if (editingBus) {
        await apiClient.request(`/api/admin/buses/${editingBus.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        window.alert('Bus updated successfully.');
      } else {
        await apiClient.request('/api/admin/buses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        window.alert('Bus added successfully.');
      }

      setShowBusModal(false);
      setEditingBus(null);
      await loadBuses();
    } catch (error) {
      console.error('Failed to save bus:', error);
      window.alert(
        error instanceof Error ? error.message : 'Failed to save bus.',
      );
    }
  };

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        {
          id: 'dashboard' as AdminSection,
          label: 'Dashboard',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        {
          id: 'fleet' as AdminSection,
          label: 'Fleet Management',
          icon: BusFront,
        },
        {
          id: 'trips' as AdminSection,
          label: 'Trips',
          icon: CalendarDays,
        },
        {
          id: 'bookings' as AdminSection,
          label: 'Booking & Tickets',
          icon: ClipboardList,
        },
        {
          id: 'cancellations' as AdminSection,
          label: 'Cancellations & Refunds',
          icon: RotateCcw,
        },
      ],
    },
    {
      title: 'BUSINESS',
      items: [
        {
          id: 'revenue' as AdminSection,
          label: 'Revenue',
          icon: DollarSign,
        },
        {
          id: 'users' as AdminSection,
          label: 'Users & Staff',
          icon: UserCog,
        },
        {
          id: 'reports' as AdminSection,
          label: 'Reports & Analytics',
          icon: BarChart3,
        },
      ],
    },
    {
      title: 'SECURITY',
      items: [
        {
          id: 'security' as AdminSection,
          label: 'Security',
          icon: ShieldCheck,
        },
      ],
    },
  ];

  const sectionTitle: Record<AdminSection, string> = {
    dashboard: 'Operations Dashboard',
    fleet: 'Fleet Management',
    trips: 'Trip Management',
    bookings: 'Booking & Tickets',
    cancellations: 'Cancellations & Refunds',
    revenue: 'Revenue Overview',
    users: 'Users & Staff',
    reports: 'Reports & Analytics',
    security: 'Security Center',
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <aside className="fixed inset-y-0 left-0 z-50 hidden w-[300px] bg-[#071b35] text-white shadow-[10px_0_40px_rgba(7,27,53,0.12)] lg:flex lg:flex-col">
          <div className="flex h-[106px] items-center border-b border-white/10 px-6">
            <div className="flex h-[72px] w-[90px] items-center justify-center rounded-2xl bg-white shadow-lg">
              <img
                src="/images/logo.png"
                alt="GoVia"
                className="max-h-[62px] max-w-[80px] object-contain"
              />
            </div>
          </div>

          <div className="border-b border-white/10 p-5">
            <div className="flex items-center gap-3 rounded-2xl bg-white/[0.07] p-4">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ff7043] text-lg font-black text-white">
                {(user?.name || 'Demo Admin')
                  .slice(0, 2)
                  .toUpperCase()}

                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#122945] bg-emerald-400" />
              </div>

              <div className="min-w-0">
                <p className="truncate font-bold">
                  {user?.name || 'Demo Admin'}
                </p>

                <p className="text-xs text-slate-400">
                  Super Administrator
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-6">
            {navSections.map((section) => (
              <div key={section.title} className="mb-7">
                <p className="mb-3 px-4 text-[11px] font-bold tracking-[0.18em] text-slate-500">
                  {section.title}
                </p>

                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = activeSection === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveSection(item.id)}
                        className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-sm font-semibold transition ${
                          active
                            ? 'bg-[#ff6736] text-white shadow-[0_12px_28px_rgba(255,103,54,0.28)]'
                            : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                        }`}
                      >
                        <Icon
                          size={19}
                          className={
                            active
                              ? 'text-white'
                              : 'text-slate-400 group-hover:text-white'
                          }
                        />

                        <span className="flex-1">{item.label}</span>

                        {active && <ChevronRight size={17} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 p-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              <ArrowRight size={19} />
              Back to GoVia
            </button>

            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              <LogOut size={19} />
              Logout
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="min-h-screen flex-1 lg:ml-[300px]">
          {/* TOP BAR */}
          <header className="sticky top-0 z-40 flex h-[84px] items-center justify-between border-b border-slate-200 bg-white/95 px-5 shadow-sm backdrop-blur-xl sm:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#ff6736]">
                GOVIA ADMINISTRATION
              </p>

              <h1 className="mt-1 text-2xl font-black text-[#102746]">
                {sectionTitle[activeSection]}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm"
              >
                <Bell size={19} />

                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#ff6736]" />
              </button>

              <div className="hidden h-9 w-px bg-slate-200 sm:block" />

              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold text-[#102746]">
                  {user?.name || 'Demo Admin'}
                </p>

                <p className="text-xs text-slate-500">Administrator</p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#102746] text-sm font-bold text-white">
                DA
              </div>
            </div>
          </header>

          <div className="p-5 sm:p-8">
            {/* DASHBOARD */}
            {activeSection === 'dashboard' && (
              <>
                <div className="mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-end">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff6736]">
                      OVERVIEW
                    </p>

                    <h2 className="mt-2 text-3xl font-black tracking-tight text-[#102746] sm:text-4xl">
                      Good morning, Admin
                    </h2>

                    <p className="mt-2 text-sm text-slate-500 sm:text-base">
                      Monitor your GoVia operations from one secure workspace.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => void loadTrips()}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#102746] shadow-sm transition hover:bg-slate-50"
                    >
                      <RefreshCw
                        size={17}
                        className={loadingTrips ? 'animate-spin' : ''}
                      />
                      Refresh
                    </button>

                    <button
                      type="button"
                      onClick={openAddBus}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#ff6736] px-5 py-3 text-sm font-bold text-white shadow-[0_15px_30px_rgba(255,103,54,0.25)] transition hover:bg-[#f35b2b]"
                    >
                      <Plus size={18} />
                      Add New Bus
                    </button>
                  </div>
                </div>

                {/* STAT CARDS */}
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  <AdminStatCard
                    label="TOTAL BUSES"
                    value={String(buses.length)}
                    description={`${buses.filter((bus) => bus.status === 'ACTIVE').length} active fleet`}
                    icon={<BusFront size={21} />}
                    iconClass="bg-blue-50 text-blue-600"
                  />

                  <AdminStatCard
                    label="TOTAL TRIPS"
                    value={String(trips.length || 5)}
                    description="Scheduled trips"
                    icon={<CalendarDays size={21} />}
                    iconClass="bg-violet-50 text-violet-600"
                  />

                  <AdminStatCard
                    label="TOTAL BOOKINGS"
                    value={String(adminBookings.length)}
                    description={`${confirmedBookings} confirmed`}
                    icon={<Ticket size={21} />}
                    iconClass="bg-orange-50 text-[#ff6736]"
                  />

                  <AdminStatCard
                    label="TOTAL REVENUE"
                    value={`₹${totalRevenue.toLocaleString('en-IN')}`}
                    description="Confirmed booking value"
                    icon={<DollarSign size={21} />}
                    iconClass="bg-emerald-50 text-emerald-600"
                  />
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-3">
                  <MiniMetric
                    icon={<Users size={20} />}
                    label="Available seats"
                    value={String(availableSeats || 98)}
                  />

                  <MiniMetric
                    icon={<TrendingUp size={20} />}
                    label="Occupancy"
                    value={`${occupancy || 18}%`}
                  />

                  <MiniMetric
                    icon={<RotateCcw size={20} />}
                    label="Cancelled"
                    value={String(cancelledBookings)}
                  />
                </div>

                {/* DASHBOARD CONTENT */}
                <div className="mt-7 grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
                  <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                      <div>
                        <h3 className="text-lg font-black text-[#102746]">
                          Scheduled Trips
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          Live schedule from the GoVia backend
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveSection('bookings')}
                        className="text-sm font-bold text-[#ff6736] hover:underline"
                      >
                        View all
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-[760px] w-full text-left">
                        <thead className="bg-slate-50">
                          <tr>
                            {[
                              'ROUTE',
                              'BUS',
                              'DATE',
                              'SCHEDULE',
                              'FARE',
                              'STATUS',
                            ].map((heading) => (
                              <th
                                key={heading}
                                className="px-5 py-3 text-[11px] font-bold tracking-[0.15em] text-slate-500"
                              >
                                {heading}
                              </th>
                            ))}
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                          {loadingTrips ? (
                            <tr>
                              <td
                                colSpan={6}
                                className="px-5 py-10 text-center text-sm text-slate-500"
                              >
                                Loading trip data...
                              </td>
                            </tr>
                          ) : trips.length === 0 ? (
                            <tr>
                              <td
                                colSpan={6}
                                className="px-5 py-10 text-center text-sm text-slate-500"
                              >
                                No scheduled trips found.
                              </td>
                            </tr>
                          ) : (
                            trips.slice(0, 5).map((trip) => (
                              <tr
                                key={trip.id}
                                className="transition hover:bg-slate-50/70"
                              >
                                <td className="px-5 py-4">
                                  <p className="font-bold text-[#102746]">
                                    {trip.route}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-400">
                                    {trip.operator}
                                  </p>
                                </td>

                                <td className="px-5 py-4 text-sm font-medium text-slate-600">
                                  {trip.bus_number}
                                </td>

                                <td className="px-5 py-4 text-sm text-slate-600">
                                  {trip.date}
                                </td>

                                <td className="px-5 py-4 text-sm text-slate-600">
                                  {trip.departure} → {trip.arrival}
                                </td>

                                <td className="px-5 py-4 font-bold text-[#102746]">
                                  ₹{trip.fare}
                                </td>

                                <td className="px-5 py-4">
                                  <StatusBadge status={trip.status} />
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="rounded-[28px] bg-[#102f52] p-6 text-white shadow-[0_22px_50px_rgba(16,47,82,0.18)]">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold tracking-[0.16em] text-slate-300">
                          REVENUE OVERVIEW
                        </p>

                        <p className="mt-4 text-4xl font-black">
                          ₹{totalRevenue.toLocaleString('en-IN')}
                        </p>

                        <p className="mt-2 text-sm text-slate-300">
                          Current confirmed booking value
                        </p>
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff6736]/20 text-[#ff7043]">
                        <TrendingUp size={22} />
                      </div>
                    </div>

                    <div className="mt-10 space-y-6">
                      <RevenueBar
                        route="Chennai → Bangalore"
                        percentage={48}
                      />

                      <RevenueBar
                        route="Chennai → Coimbatore"
                        percentage={29}
                      />

                      <RevenueBar
                        route="Bangalore → Chennai"
                        percentage={23}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveSection('revenue')}
                      className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold transition hover:bg-white/15"
                    >
                      Open revenue details
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>

                {/* RECENT BOOKINGS */}
                <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-[#102746]">
                        Recent Bookings
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Latest ticket activity
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveSection('bookings')}
                      className="text-sm font-bold text-[#ff6736]"
                    >
                      View bookings
                    </button>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {adminBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-bold text-[#102746]">
                              {booking.id}
                            </p>

                            <p className="mt-1 text-sm text-slate-600">
                              {booking.passenger}
                            </p>
                          </div>

                          <StatusBadge status={booking.status} />
                        </div>

                        <p className="mt-4 text-xs text-slate-500">
                          {booking.route}
                        </p>

                        <p className="mt-2 text-lg font-black text-[#102746]">
                          ₹{booking.amount.toLocaleString('en-IN')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* FLEET */}
            {activeSection === 'fleet' && (
              <AdminFleetSection
                buses={buses}
                loading={loadingBuses}
                onAdd={openAddBus}
                onEdit={openEditBus}
              />
            )}

            {/* TRIPS */}
            {activeSection === 'trips' && (
              <AdminTripsSection trips={trips} loading={loadingTrips} />
            )}

            {/* BOOKINGS */}
            {activeSection === 'bookings' && (
              <AdminBookingsSection
                bookings={filteredBookings}
                loading={loadingBookings}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                bookingFilter={bookingFilter}
                setBookingFilter={setBookingFilter}
              />
            )}

            {/* CANCELLATIONS */}
            {activeSection === 'cancellations' && (
              <AdminCancellationsSection
                bookings={adminBookings.filter(
                  (booking) => booking.status === 'CANCELLED',
                )}
              />
            )}

            {/* REVENUE */}
            {activeSection === 'revenue' && (
              <AdminRevenueSection
                totalRevenue={totalRevenue}
                confirmedBookings={confirmedBookings}
              />
            )}

            {/* USERS */}
            {activeSection === 'users' && <AdminUsersSection />}

            {/* REPORTS */}
            {activeSection === 'reports' && (
              <AdminReportsSection
                occupancy={occupancy || 18}
                totalRevenue={totalRevenue}
              />
            )}

            {/* SECURITY */}
            {activeSection === 'security' && (
              <AdminSecuritySection userName={user?.name || 'Demo Admin'} />
            )}
          </div>
        </main>
      </div>

      {/* ADD / EDIT BUS MODAL */}
      {showBusModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#071b35]/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-[28px] bg-white shadow-[0_30px_100px_rgba(7,27,53,0.3)]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ff6736]">
                  Fleet Management
                </p>

                <h2 className="mt-1 text-2xl font-black text-[#102746]">
                  {editingBus ? 'Edit Bus' : 'Add New Bus'}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowBusModal(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                <X size={19} />
              </button>
            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2">
              <AdminInput
                label="Bus Number"
                value={busForm.busNumber}
                onChange={(value) =>
                  setBusForm((current) => ({
                    ...current,
                    busNumber: value,
                  }))
                }
                placeholder="TN-01-1003"
              />

              <AdminInput
                label="Registration Number"
                value={busForm.registration}
                onChange={(value) =>
                  setBusForm((current) => ({
                    ...current,
                    registration: value,
                  }))
                }
                placeholder="TN01AB1003"
              />

              <AdminSelect
                label="Operator"
                value={busForm.operator}
                onChange={(value) =>
                  setBusForm((current) => ({
                    ...current,
                    operator: value,
                  }))
                }
                options={operators}
              />

              <AdminSelect
                label="Bus Type"
                value={busForm.busType}
                onChange={(value) =>
                  setBusForm((current) => ({
                    ...current,
                    busType: value,
                  }))
                }
                options={[
                  'AC Seater',
                  'AC Sleeper',
                  'Volvo AC',
                  'Non AC',
                  'Semi Sleeper',
                ]}
              />

              <AdminInput
                label="Total Seats"
                value={busForm.seats}
                onChange={(value) =>
                  setBusForm((current) => ({
                    ...current,
                    seats: value,
                  }))
                }
                placeholder="24"
                type="number"
              />

              <AdminInput
                label="Amenities"
                value={busForm.amenities}
                onChange={(value) =>
                  setBusForm((current) => ({
                    ...current,
                    amenities: value,
                  }))
                }
                placeholder="WiFi, USB Charging, Water Bottle"
              />

              <AdminSelect
                label="Status"
                value={busForm.status}
                onChange={(value) =>
                  setBusForm((current) => ({
                    ...current,
                    status: value as
                      | 'ACTIVE'
                      | 'INACTIVE'
                      | 'MAINTENANCE',
                  }))
                }
                options={['ACTIVE', 'INACTIVE', 'MAINTENANCE']}
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowBusModal(false)}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveBus}
                className="rounded-2xl bg-[#ff6736] px-6 py-3 text-sm font-bold text-white shadow-[0_12px_25px_rgba(255,103,54,0.22)]"
              >
                {editingBus ? 'Save Changes' : 'Add Bus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   ADMIN COMPONENTS
========================================================= */

function AdminStatCard({
  label,
  value,
  description,
  icon,
  iconClass,
}: {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-slate-500">
            {label}
          </p>

          <p className="mt-4 text-3xl font-black text-[#102746]">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">{description}</p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function MiniMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-[#102746]">
        {icon}
      </div>

      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-black text-[#102746]">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === 'SCHEDULED' || status === 'CONFIRMED' || status === 'ACTIVE'
      ? 'bg-emerald-50 text-emerald-700'
      : status === 'CANCELLED' || status === 'INACTIVE'
        ? 'bg-red-50 text-red-600'
        : 'bg-amber-50 text-amber-700';

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${styles}`}
    >
      {status}
    </span>
  );
}

function RevenueBar({
  route,
  percentage,
}: {
  route: string;
  percentage: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm font-semibold">
        <span>{route}</span>
        <span>{percentage}%</span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#ff6736]"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function AdminFleetSection({
  buses,
  loading,
  onAdd,
  onEdit,
}: {
  buses: AdminBus[];
  loading: boolean;
  onAdd: () => void;
  onEdit: (bus: AdminBus) => void;
}) {
  const [search, setSearch] = useState('');

  const filtered = buses.filter(
    (bus) =>
      bus.busNumber.toLowerCase().includes(search.toLowerCase()) ||
      bus.operator.toLowerCase().includes(search.toLowerCase()) ||
      bus.registration.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff6736]">
            FLEET
          </p>

          <h2 className="mt-2 text-3xl font-black text-[#102746]">
            Bus & Fleet Management
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Add, edit and monitor every bus in your GoVia fleet.
          </p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#ff6736] px-5 py-3 text-sm font-bold text-white shadow-[0_14px_28px_rgba(255,103,54,0.22)]"
        >
          <Plus size={18} />
          Add New Bus
        </button>
      </div>

      <div className="mt-7 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 md:max-w-md">
          <Search size={18} className="text-slate-400" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bus, operator or registration..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        <div className="mt-6 overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Loading fleet...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <BusFront size={32} className="mx-auto text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-500">
                No buses found.
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Add a new bus to your GoVia fleet.
              </p>
            </div>
          ) : (
            <table className="min-w-[950px] w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    'BUS',
                    'OPERATOR',
                    'TYPE',
                    'SEATS',
                    'REGISTRATION',
                    'STATUS',
                    'ACTION',
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-[11px] font-bold tracking-[0.15em] text-slate-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map((bus) => (
                  <tr key={bus.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-4 font-bold text-[#102746]">
                      {bus.busNumber}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {bus.operator}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {bus.busType}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                      {bus.seats}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {bus.registration || '-'}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={bus.status} />
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => onEdit(bus)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#102746] hover:bg-slate-50"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminTripsSection({
  trips,
  loading,
}: {
  trips: AdminTrip[];
  loading: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff6736]">
        OPERATIONS
      </p>

      <h2 className="mt-2 text-3xl font-black text-[#102746]">
        Trip Management
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Manage every scheduled trip, route timing and bus assignment.
      </p>

      <div className="mt-7 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mt-6 overflow-x-auto">
          {loading ? (
            <div className="py-10 text-center text-sm text-slate-500">
              Loading trips...
            </div>
          ) : trips.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500">
              No trips scheduled right now.
            </div>
          ) : (
            <table className="min-w-[1000px] w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    'TRIP',
                    'ROUTE',
                    'OPERATOR',
                    'BUS',
                    'DATE',
                    'TIMINGS',
                    'FARE',
                    'SEATS',
                    'STATUS',
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-[11px] font-bold tracking-[0.15em] text-slate-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {trips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-4 font-bold text-[#102746]">
                      GV-{String(trip.id).padStart(4, '0')}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-600">
                      {trip.route}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-600">
                      {trip.operator}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-600">
                      {trip.bus_number}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-600">
                      {trip.date}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-600">
                      {trip.departure} → {trip.arrival}
                    </td>

                    <td className="px-4 py-4 font-bold text-[#102746]">
                      ₹{trip.fare.toLocaleString('en-IN')}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-600">
                      {trip.seats_left}
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge status={trip.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminBookingsSection({
  bookings,
  loading,
  searchTerm,
  setSearchTerm,
  bookingFilter,
  setBookingFilter,
}: {
  bookings: AdminBooking[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  bookingFilter: string;
  setBookingFilter: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff6736]">
        OPERATIONS
      </p>

      <h2 className="mt-2 text-3xl font-black text-[#102746]">
        Booking & Ticket Monitoring
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Monitor passenger bookings, ticket status and booking values.
      </p>

      <div className="mt-7 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search size={18} className="text-slate-400" />

            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search booking, passenger or route..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <select
            value={bookingFilter}
            onChange={(e) => setBookingFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none"
          >
            <option value="ALL">All bookings</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PENDING">Pending</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="mt-6 overflow-x-auto">
          {loading ? (
            <div className="py-10 text-center text-sm text-slate-500">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500">No bookings found for the selected filters.</div>
          ) : (
            <table className="min-w-[1050px] w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    'BOOKING',
                    'PASSENGER',
                    'ROUTE',
                    'BUS',
                    'DATE',
                    'SEATS',
                    'AMOUNT',
                    'STATUS',
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-[11px] font-bold tracking-[0.15em] text-slate-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-4 font-bold text-[#102746]">
                      {booking.id}
                    </td>

                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-[#102746]">
                        {booking.passenger}
                      </p>

                      <p className="text-xs text-slate-400">
                        {booking.email}
                      </p>
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-600">
                      {booking.route}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-600">
                      {booking.bus}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-600">
                      {booking.date}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-600">
                      {booking.seats}
                    </td>

                    <td className="px-4 py-4 font-bold text-[#102746]">
                      ₹{booking.amount.toLocaleString('en-IN')}
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge status={booking.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminCancellationsSection({
  bookings,
}: {
  bookings: AdminBooking[];
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff6736]">
        OPERATIONS
      </p>

      <h2 className="mt-2 text-3xl font-black text-[#102746]">
        Cancellations & Refunds
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Review cancelled bookings and manage refund processing.
      </p>

      <div className="mt-7 grid gap-5 md:grid-cols-3">
        <AdminStatCard
          label="CANCELLED"
          value={String(bookings.length)}
          description="Cancelled bookings"
          icon={<RotateCcw size={20} />}
          iconClass="bg-red-50 text-red-600"
        />

        <AdminStatCard
          label="REFUND VALUE"
          value={`₹${bookings
            .reduce((sum, booking) => sum + booking.amount, 0)
            .toLocaleString('en-IN')}`}
          description="Potential refund value"
          icon={<DollarSign size={20} />}
          iconClass="bg-amber-50 text-amber-600"
        />

        <AdminStatCard
          label="REFUND STATUS"
          value="1"
          description="Needs review"
          icon={<ClipboardList size={20} />}
          iconClass="bg-blue-50 text-blue-600"
        />
      </div>

      <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                {[
                  'BOOKING',
                  'PASSENGER',
                  'ROUTE',
                  'AMOUNT',
                  'STATUS',
                  'ACTION',
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-[11px] font-bold tracking-[0.15em] text-slate-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-4 py-4 font-bold text-[#102746]">
                    {booking.id}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-600">
                    {booking.passenger}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-600">
                    {booking.route}
                  </td>

                  <td className="px-4 py-4 font-bold text-[#102746]">
                    ₹{booking.amount.toLocaleString('en-IN')}
                  </td>

                  <td className="px-4 py-4">
                    <StatusBadge status={booking.status} />
                  </td>

                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() =>
                        window.alert(
                          `Refund review opened for ${booking.id}.`,
                        )
                      }
                      className="rounded-xl bg-[#102f52] px-3 py-2 text-xs font-bold text-white"
                    >
                      Review Refund
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminRevenueSection({
  totalRevenue,
  confirmedBookings,
}: {
  totalRevenue: number;
  confirmedBookings: number;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff6736]">
        BUSINESS
      </p>

      <h2 className="mt-2 text-3xl font-black text-[#102746]">
        Revenue Overview
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Track confirmed booking revenue across GoVia routes.
      </p>

      <div className="mt-7 grid gap-5 md:grid-cols-3">
        <AdminStatCard
          label="TODAY"
          value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          description="Current confirmed value"
          icon={<DollarSign size={21} />}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <AdminStatCard
          label="CONFIRMED"
          value={String(confirmedBookings)}
          description="Confirmed bookings"
          icon={<CheckCircle2 size={21} />}
          iconClass="bg-blue-50 text-blue-600"
        />

        <AdminStatCard
          label="AVERAGE"
          value={`₹${Math.round(
            totalRevenue / Math.max(confirmedBookings, 1),
          ).toLocaleString('en-IN')}`}
          description="Average booking value"
          icon={<TrendingUp size={21} />}
          iconClass="bg-violet-50 text-violet-600"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] bg-[#102f52] p-7 text-white">
          <p className="text-xs font-bold tracking-[0.18em] text-slate-300">
            ROUTE REVENUE
          </p>

          <div className="mt-7 space-y-7">
            <RevenueBar route="Chennai → Bangalore" percentage={48} />
            <RevenueBar route="Chennai → Coimbatore" percentage={29} />
            <RevenueBar route="Bangalore → Chennai" percentage={23} />
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
          <p className="text-xs font-bold tracking-[0.18em] text-slate-500">
            PAYMENT STATUS
          </p>

          <div className="mt-7 space-y-5">
            <PaymentRow
              label="Confirmed payments"
              value={`₹${totalRevenue.toLocaleString('en-IN')}`}
              percentage="72%"
            />

            <PaymentRow
              label="Pending payments"
              value="₹799"
              percentage="18%"
            />

            <PaymentRow
              label="Refunds"
              value="₹1,798"
              percentage="10%"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentRow({
  label,
  value,
  percentage,
}: {
  label: string;
  value: string;
  percentage: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[#102746]">
          {label}
        </span>

        <span className="text-sm font-bold text-[#102746]">{value}</span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-[#ff6736]"
          style={{ width: percentage }}
        />
      </div>
    </div>
  );
}

function AdminUsersSection() {
  const users = [
    {
      name: 'Murugan',
      email: 'user@govia.com',
      role: 'USER',
      status: 'ACTIVE',
    },
    {
      name: 'Demo Admin',
      email: 'admin@govia.com',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
    {
      name: 'Arun Kumar',
      email: 'arun@example.com',
      role: 'USER',
      status: 'ACTIVE',
    },
    {
      name: 'Priya',
      email: 'priya@example.com',
      role: 'STAFF',
      status: 'ACTIVE',
    },
  ];

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff6736]">
        BUSINESS
      </p>

      <h2 className="mt-2 text-3xl font-black text-[#102746]">
        Users & Staff Management
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Manage customer accounts, administrators and staff access.
      </p>

      <div className="mt-7 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[700px] w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                {['USER', 'EMAIL', 'ROLE', 'STATUS', 'ACTION'].map(
                  (heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-[11px] font-bold tracking-[0.15em] text-slate-500"
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {users.map((item) => (
                <tr key={item.email}>
                  <td className="px-4 py-4 font-bold text-[#102746]">
                    {item.name}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-600">
                    {item.email}
                  </td>

                  <td className="px-4 py-4">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                      {item.role}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <StatusBadge status={item.status} />
                  </td>

                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() =>
                        window.alert(`Managing ${item.name}.`)
                      }
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-[#102746]"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminReportsSection({
  occupancy,
  totalRevenue,
}: {
  occupancy: number;
  totalRevenue: number;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff6736]">
        BUSINESS
      </p>

      <h2 className="mt-2 text-3xl font-black text-[#102746]">
        Reports & Analytics
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Review operational performance, revenue and occupancy.
      </p>

      <div className="mt-7 grid gap-5 md:grid-cols-3">
        <AdminStatCard
          label="REVENUE"
          value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          description="Confirmed value"
          icon={<DollarSign size={21} />}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <AdminStatCard
          label="OCCUPANCY"
          value={`${occupancy}%`}
          description="Current fleet occupancy"
          icon={<TrendingUp size={21} />}
          iconClass="bg-violet-50 text-violet-600"
        />

        <AdminStatCard
          label="TRIPS"
          value="5"
          description="Scheduled trips"
          icon={<CalendarDays size={21} />}
          iconClass="bg-blue-50 text-blue-600"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
          <h3 className="text-lg font-black text-[#102746]">
            Occupancy Analytics
          </h3>

          <div className="mt-8 flex items-end gap-4">
            {[42, 55, 38, 68, 82, 64, occupancy].map((value, index) => (
              <div
                key={`${value}-${index}`}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <div className="flex h-48 w-full items-end rounded-xl bg-slate-50">
                  <div
                    className="w-full rounded-xl bg-[#ff6736]"
                    style={{
                      height: `${Math.max(value, 8)}%`,
                    }}
                  />
                </div>

                <span className="text-xs text-slate-400">
                  D{index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
          <h3 className="text-lg font-black text-[#102746]">
            Report Downloads
          </h3>

          <div className="mt-5 space-y-3">
            {[
              'Daily Booking Report',
              'Monthly Revenue Report',
              'Fleet Occupancy Report',
              'Cancellation Report',
            ].map((report) => (
              <button
                key={report}
                type="button"
                onClick={() =>
                  window.alert(`${report} generation started.`)
                }
                className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:bg-white hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 size={18} className="text-[#ff6736]" />
                  <span className="text-sm font-semibold text-[#102746]">
                    {report}
                  </span>
                </div>

                <ArrowRight size={17} className="text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminSecuritySection({
  userName,
}: {
  userName: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff6736]">
        SECURITY
      </p>

      <h2 className="mt-2 text-3xl font-black text-[#102746]">
        Security Center
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Monitor administrator access and authentication security.
      </p>

      <div className="mt-7 grid gap-5 lg:grid-cols-2">
        <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <ShieldCheck size={25} />
            </div>

            <div>
              <h3 className="text-lg font-black text-[#102746]">
                Authentication Status
              </h3>

              <p className="text-sm text-emerald-600">
                Secure session active
              </p>
            </div>
          </div>

          <div className="mt-7 space-y-4">
            <SecurityRow label="Administrator" value={userName} />
            <SecurityRow label="Role" value="ADMIN" />
            <SecurityRow label="Authentication" value="JWT Bearer" />
            <SecurityRow label="Session" value="Active" />
            <SecurityRow label="Access level" value="Full admin" />
          </div>
        </div>

        <div className="rounded-[28px] bg-[#102f52] p-7 text-white">
          <p className="text-xs font-bold tracking-[0.18em] text-slate-300">
            ADMIN ACCESS CONTROL
          </p>

          <h3 className="mt-3 text-2xl font-black">
            Protected workspace
          </h3>

          <p className="mt-3 text-sm leading-6 text-slate-300">
            Only authenticated users with the ADMIN role should be allowed
            to access the GoVia administration area.
          </p>

          <div className="mt-7 space-y-3">
            <SecurityCheck label="JWT authentication" />
            <SecurityCheck label="Admin role validation" />
            <SecurityCheck label="Protected admin route" />
            <SecurityCheck label="Session restore validation" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SecurityRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-bold text-[#102746]">{value}</span>
    </div>
  );
}

function SecurityCheck({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3">
      <CheckCircle2 size={18} className="text-emerald-400" />
      <span className="text-sm font-semibold">{label}</span>
    </div>
  );
}

function AdminInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-[#102746] outline-none transition focus:border-[#ff6736] focus:bg-white focus:ring-4 focus:ring-orange-100"
      />
    </div>
  );
}

function AdminSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-[#102746] outline-none transition focus:border-[#ff6736] focus:bg-white"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

/* =========================================================
   PLACEHOLDER
========================================================= */

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-soft">
        <h1 className="text-3xl font-bold text-navy">{title}</h1>

        <p className="mt-4 text-slate-600">
          This page is a placeholder during Phase 1 of GoVia development.
        </p>

        <Link
          to="/"
          className="mt-6 inline-flex rounded-full bg-orange px-4 py-2 font-medium text-white"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

/* =========================================================
   ROUTES
========================================================= */

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/search" element={<SearchPage />} />

      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/payment"
        element={
          <ProtectedRoute>
            <PaymentPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/booking-confirmation"
        element={
          <ProtectedRoute>
            <BookingConfirmationPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/booking-confirmed"
        element={
          <ProtectedRoute>
            <BookingConfirmationPage />
          </ProtectedRoute>
        }
      />

      <Route path="/login" element={<LoginPage />} />

      <Route path="/register" element={<RegisterPage />} />

      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute>
            <MyBookingsPage />
          </ProtectedRoute>
        }
      />

      {/* ADMIN ONLY */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        }
      />

      <Route
        path="/help"
        element={<PlaceholderPage title="Help" />}
      />
    </Routes>
  );
}

export default function App() {
  return <AppRoutes />;
}