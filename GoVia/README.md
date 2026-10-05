# GoVia

A modern bus ticket booking web application.

## 1. Project Overview

GoVia lets users search trips, inspect and select available seats, enter passenger details, complete a simulated payment, receive a booking confirmation, view their bookings, and cancel confirmed bookings. Administrators can view the dashboard, add and edit buses, view trips and bookings, and inspect reports and statistics.

Payment is simulated in the frontend. There is no real payment gateway, payment provider, or payment API.

The backend uses SQLite by default (`sqlite:///./govia.db`); `DATABASE_URL` can override the configured database. On startup the application creates tables and seeds demo accounts. Demo travel data is seeded only when the routes table is empty, and its trip dates are relative to the seed date.

## 2. Technology Stack

**Backend**
- Python
- FastAPI
- SQLAlchemy
- SQLite (default configuration)
- Pydantic
- JWT authentication

**Frontend**
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide React

**Testing**
- Pytest
- Playwright

## 3. Project Structure

```text
GoVia/
├── backend/
│   ├── app/
│   │   ├── dependencies/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   ├── utils/
│   │   ├── config.py
│   │   ├── database.py
│   │   └── main.py
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── e2e/
│   ├── images/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── App.tsx
│   ├── package.json
│   ├── playwright.config.ts
│   └── vite.config.ts
├── .gitignore
├── project_structure.txt
└── README.md
```

## 4. Main Features

### User Features
- Search scheduled trips by origin, destination, and travel date.
- View trip information and seat availability.
- Select seats and enter traveler details before payment.
- Review a booking confirmation and view bookings.
- Cancel a confirmed booking.

### Admin Features
- View dashboard statistics, fleet, trips, and bookings from admin endpoints.
- Add and edit buses in Fleet Management.
- View trips in the Trips dashboard section. The backend also exposes admin trip create/update endpoints, but the current Trips UI is view-only.
- View the Reports & Analytics section; some values and visualizations are static/demo data.

### Authentication
- Register and log in using the backend authentication API.
- JWT bearer tokens are stored in browser local storage and used on authenticated requests.
- The `/admin` page requires a user with the `ADMIN` role; the backend admin endpoints enforce the same role.

### Booking
- The booking API validates trip availability, passenger count, and selected seat numbers and persists bookings in SQLite.

### Seat Management
- The UI loads seat availability from the backend. The booking API rejects invalid, duplicate, or already-booked selections.
- Cancelling a booking removes its seat reservations so those seats become available again.

### Payment Simulation
- The payment screen offers UPI, card, and net banking as UI selections and simulates a short payment delay.
- No payment credentials are collected, and no real gateway or payment API is connected. The booking is created when the user submits the simulated payment.

### Cancellation
- Users can cancel their own confirmed bookings. The backend changes the booking status to `CANCELLED` and releases its seats.
- Refund processing is not implemented.

## 5. Application Architecture

```text
React frontend
	↓
FastAPI REST API
	↓
SQLAlchemy
	↓
SQLite database
```

The frontend sends REST requests to FastAPI. SQLAlchemy reads and writes the configured database. JWT bearer authentication protects user booking operations and admin-only operations.

## 6. Backend API

Important implemented endpoints:

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/auth/register` | Register a user |
| `POST` | `/api/auth/login` | Authenticate and return a JWT |
| `GET` | `/api/auth/me` | Get the authenticated user |
| `GET` | `/api/trips/search?origin={origin}&destination={destination}&travel_date={date}` | Search trips by route and date |
| `GET` | `/api/trips/{trip_id}/seats` | Get booked and available seat numbers |
| `POST` | `/api/bookings` | Create a booking with passenger and selected-seat details |
| `GET` | `/api/bookings/me` | List the authenticated user's bookings |
| `PATCH` | `/api/bookings/{booking_id}/cancel` | Cancel an eligible booking |
| `GET` | `/api/admin/buses` | List buses (admin only) |
| `POST` | `/api/admin/buses` | Create a bus (admin only) |
| `PUT` | `/api/admin/buses/{bus_id}` | Update a bus (admin only) |
| `GET` | `/api/admin/trips` | List trips (admin only) |
| `POST` | `/api/admin/trips` | Create a trip (admin only) |
| `PUT` | `/api/admin/trips/{trip_id}` | Update a trip (admin only) |
| `GET` | `/api/admin/bookings` | List bookings (admin only) |
| `GET` | `/api/health` | Check API and database health |

There is no payment endpoint. The simulated payment UI submits the booking through `POST /api/bookings`.

## 7. Running the Project

Run the backend and frontend in separate Windows PowerShell terminals. The frontend's checked-in `frontend/.env` currently points to port `8000`; set `VITE_API_URL` in the frontend terminal to match the requested backend port `8001`.

**Backend**

```powershell
cd L:\GoVia\backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8001
```

**Frontend**

```powershell
cd L:\GoVia\frontend
$env:VITE_API_URL = "http://127.0.0.1:8001"
npm run dev
```

Frontend: <http://localhost:5173>

Backend: <http://127.0.0.1:8001>

## 8. Demo Credentials

These accounts are created by the backend startup seed when they do not already exist:

**User**
- Email: `user@govia.com`
- Password: `User@123`

**Admin**
- Email: `admin@govia.com`
- Password: `Admin@123`

## 9. Testing

The verified results are:
- Backend: 8 tests passed.
- Frontend: `npm run build` passed.
- E2E: `npm run test:e2e` passed, 2 tests and 0 failures.

The Playwright suite starts its own frontend and FastAPI servers and uses a per-run temporary SQLite database. It exercises the real UI and backend; it does not mock or intercept API responses. By default, its servers use ports `5176` and `8002`, separate from the development ports above. It uses the backend `.venv` Python executable by default; set `PLAYWRIGHT_PYTHON` if that path differs on another machine.

From `frontend`, install the Chromium browser once if needed and run the suite:

```powershell
cd L:\GoVia\frontend
npx playwright install chromium
npm run test:e2e
```

To run the backend tests without writing test bookings to the developer database, use a fresh temporary database and seed it first:

```powershell
cd L:\GoVia\backend
$testDb = Join-Path $env:TEMP "govia-pytest-$([guid]::NewGuid()).db"
$env:DATABASE_URL = "sqlite:///$($testDb.Replace('\', '/'))"
.\venv\Scripts\python.exe -c "from app.database import init_db; from app.utils.seed_demo_users import seed_demo_users; from app.utils.seed_demo_travel_data import seed_demo_travel_data; init_db(); seed_demo_users(); seed_demo_travel_data()"
.\venv\Scripts\python.exe -m pytest -q
```

## 10. E2E Test Coverage

The two Playwright tests cover:
- User login.
- Chennai-to-Bangalore search using a date discovered from real backend trip and seat data.
- Trip selection, available-seat selection, passenger details, and simulated payment.
- Booking confirmation and verification of the real booking reference in My Bookings.
- Cancellation and verification that the cancelled seat becomes available again.
- Admin login and dashboard data checks against real bus and trip endpoints.
- Fleet, Trips, Bookings, and Reports sections.
- Logout, cleared browser token, and blocked access to `/admin` after logout.

## 11. Known Limitations

- Payment is simulated; there is no real payment provider or refund processing.
- Reports combine some live totals with static/demo chart data and a fixed trip statistic. Report download buttons display an alert; they do not generate or export reports.
- The Users & Staff section displays hard-coded demo users, and its Manage buttons do not perform backend management actions.
- Admin trip create/update endpoints exist, but the current admin Trips page only displays trips.
- Demo travel data is seeded only when the routes table is empty; an existing database may not receive refreshed demo trips.

## 12. Future Enhancements

- Integrate a real payment gateway.
- Generate and export reports.
- Deploy with PostgreSQL in production.
- Send booking notifications by email or SMS.
- Prepare and deploy a production environment.

## 13. Project Verification

| Verification | Result |
|---|---|
| Backend tests | 8 passed |
| Frontend build | Passed |
| User E2E | Passed |
| Admin E2E | Passed |
| E2E failures | 0 |
