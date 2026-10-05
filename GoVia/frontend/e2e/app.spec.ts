import { randomUUID } from 'node:crypto';
import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

type RouteRecord = {
  id: number;
  origin: string;
  destination: string;
};

type TripRecord = {
  id: number;
  route_id: number;
  travel_date: string;
  departure_time: string;
  status: string;
};

type BookingRecord = {
  id: number;
  booking_id: string;
  trip_id: number;
  traveler_name: string;
  status: string;
};

const apiUrl = process.env.PLAYWRIGHT_API_URL;
if (!apiUrl) throw new Error('PLAYWRIGHT_API_URL was not configured.');

function localDate(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

async function getJson<T>(request: APIRequestContext, path: string, headers?: Record<string, string>): Promise<T> {
  const response = await request.get(`${apiUrl}${path}`, { headers });
  expect(response.ok(), `${path} should return a successful response`).toBeTruthy();
  return response.json() as Promise<T>;
}

async function discoverAvailableChennaiBangaloreDate(request: APIRequestContext): Promise<string> {
  const routes = await getJson<RouteRecord[]>(request, '/api/routes/');
  const route = routes.find(
    (candidate) => candidate.origin === 'Chennai' && candidate.destination === 'Bangalore',
  );
  expect(route, 'The real backend should contain a Chennai to Bangalore route').toBeTruthy();

  const trips = await getJson<TripRecord[]>(request, '/api/trips/');
  const candidates = trips
    .filter(
      (trip) =>
        trip.route_id === route?.id &&
        trip.status.toUpperCase() === 'SCHEDULED' &&
        trip.travel_date >= localDate(),
    )
    .sort((left, right) =>
      left.travel_date.localeCompare(right.travel_date) ||
      left.departure_time.localeCompare(right.departure_time),
    );

  for (const trip of candidates) {
    const seats = await getJson<{ available_seats: number[] }>(
      request,
      `/api/trips/${trip.id}/seats`,
    );
    if (seats.available_seats.length > 0) return trip.travel_date;
  }

  throw new Error('No future Chennai to Bangalore trip with an available seat exists in the test database.');
}

async function cleanupBooking(
  request: APIRequestContext,
  authToken: string | null,
  bookingId: number | undefined,
  tripId: number | undefined,
  travelerName: string,
): Promise<void> {
  if (!authToken) return;

  const headers = { Authorization: `Bearer ${authToken}` };
  let targetId = bookingId;

  if (targetId === undefined && tripId !== undefined) {
    const payload = await getJson<{ bookings: BookingRecord[] }>(
      request,
      '/api/bookings/me',
      headers,
    );
    targetId = payload.bookings.find(
      (booking) => booking.trip_id === tripId && booking.traveler_name === travelerName,
    )?.id;
  }

  if (targetId === undefined) return;

  const payload = await getJson<{ bookings: BookingRecord[] }>(
    request,
    '/api/bookings/me',
    headers,
  );
  const booking = payload.bookings.find((item) => item.id === targetId);
  if (!booking || booking.status.toUpperCase() !== 'CONFIRMED') return;

  const response = await request.patch(`${apiUrl}/api/bookings/${targetId}/cancel`, { headers });
  expect(response.ok(), 'The E2E booking should be cancelled during cleanup').toBeTruthy();
}

test('user books, confirms, views, and cancels a real trip', async ({ page, request }) => {
  const travelDate = await discoverAvailableChennaiBangaloreDate(request);
  const travelerName = `GoVia E2E ${randomUUID()}`;
  const travelerEmail = `govia-e2e-${randomUUID()}@example.com`;
  const travelerPhone = '9876543210';
  let authToken: string | null = null;
  let bookingId: number | undefined;
  let selectedTripId: number | undefined;
  let selectedSeat: number | undefined;

  try {
    await page.goto('/');
    await page.getByRole('link', { name: 'Login' }).click();
    await page.locator('input[type="email"]').fill('user@govia.com');
    await page.locator('input[type="password"]').fill('User@123');
    await page.getByRole('button', { name: 'LOGIN' }).click();
    await expect(page).toHaveURL(/\/$/);
    authToken = await page.evaluate(() => localStorage.getItem('govia_access_token'));
    expect(authToken, 'Successful login should persist an auth token').toBeTruthy();

    await page.getByLabel('From city').fill('Chennai');
    await page.getByLabel('To city').fill('Bangalore');
    await page.getByLabel('Travel date').fill(travelDate);
    await page.getByRole('button', { name: /search buses/i }).click();

    await expect(page.getByRole('heading', { name: 'Chennai → Bangalore' }).first()).toBeVisible();
    const tripAction = page.getByRole('button', { name: /^(Selected|View Seats)$/ }).first();
    await expect(tripAction).toBeVisible();
    await tripAction.click();

    const seatsResponsePromise = page.waitForResponse((response) =>
      /^\/api\/trips\/\d+\/seats$/.test(new URL(response.url()).pathname),
    );
    await page.getByRole('button', { name: 'Continue booking' }).click();
    const seatsResponse = await seatsResponsePromise;
    expect(seatsResponse.ok(), 'Seat availability should load from the real backend').toBeTruthy();
    const seatPayload = await seatsResponse.json() as {
      trip_id: number;
      available_seats: number[];
    };
    selectedTripId = seatPayload.trip_id;
    expect(seatPayload.available_seats.length).toBeGreaterThan(0);
    selectedSeat = seatPayload.available_seats[0];
    await expect(page.getByRole('heading', { name: /Select seat/i })).toBeVisible();
    await page.getByRole('button', { name: String(selectedSeat), exact: true }).click();

    const travelerFields = page.getByRole('textbox');
    await travelerFields.nth(0).fill(travelerName);
    await travelerFields.nth(1).fill(travelerPhone);
    await travelerFields.nth(2).fill(travelerEmail);
    await page.getByRole('button', { name: 'Continue to payment' }).click();
    await expect(page.getByRole('heading', { name: 'Complete payment' })).toBeVisible();

    const bookingResponsePromise = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === '/api/bookings' &&
        response.request().method() === 'POST',
    );
    await page.getByRole('button', { name: /^Pay ₹/ }).click();
    const bookingResponse = await bookingResponsePromise;
    expect(bookingResponse.status()).toBe(201);
    const bookingPayload = await bookingResponse.json() as { booking: BookingRecord };
    bookingId = bookingPayload.booking.id;
    expect(bookingPayload.booking.status).toBe('CONFIRMED');

    await expect(page.getByRole('heading', { name: /Booking confirmed successfully/i })).toBeVisible();
    const bookingReference = page.getByText(/^Booking GV-\d{5}$/).first();
    await expect(bookingReference).toBeVisible();
    await expect(bookingReference).toHaveText(`Booking ${bookingPayload.booking.booking_id}`);

    await page.getByRole('link', { name: 'View My Bookings' }).click();
    await expect(page.getByRole('heading', { name: 'My Bookings' })).toBeVisible();
    const bookingCard = page.locator('article').filter({ hasText: bookingPayload.booking.booking_id });
    await expect(bookingCard).toHaveCount(1);
    await expect(bookingCard.getByText('CONFIRMED', { exact: true })).toBeVisible();
    await bookingCard.getByRole('button', { name: 'Cancel Booking' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Cancel Booking' }).click();
    await expect(bookingCard.getByText('CANCELLED', { exact: true })).toBeVisible();

    const refreshedSeats = await getJson<{ available_seats: number[] }>(
      request,
      `/api/trips/${selectedTripId}/seats`,
    );
    expect(refreshedSeats.available_seats).toContain(selectedSeat);
  } finally {
    await cleanupBooking(request, authToken, bookingId, selectedTripId, travelerName);
  }
});

test('admin dashboard loads real operations data and logs out', async ({ page, request }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto('/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.locator('input[type="email"]').fill('admin@govia.com');
  await page.locator('input[type="password"]').fill('Admin@123');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await expect(page).toHaveURL(/\/$/);
  const authToken = await page.evaluate(() => localStorage.getItem('govia_access_token'));
  expect(authToken, 'Admin login should persist an auth token').toBeTruthy();

  const headers = { Authorization: `Bearer ${authToken}` };
  const [busesPayload, tripsPayload] = await Promise.all([
    getJson<{ buses: unknown[] }>(request, '/api/admin/buses', headers),
    getJson<{ trips: unknown[] }>(request, '/api/admin/trips', headers),
  ]);
  expect(busesPayload.buses.length).toBeGreaterThan(0);
  expect(tripsPayload.trips.length).toBeGreaterThan(0);

  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('heading', { name: 'Operations Dashboard' })).toBeVisible();
  await expect(page.getByText('TOTAL BUSES', { exact: true }).locator('..').getByText(String(busesPayload.buses.length), { exact: true })).toBeVisible();
  await expect(page.getByText('TOTAL TRIPS', { exact: true }).locator('..').getByText(String(tripsPayload.trips.length), { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Fleet Management' }).click();
  await expect(page.getByRole('heading', { name: 'Bus & Fleet Management' })).toBeVisible();
  await expect(page.getByRole('table').locator('tbody tr')).toHaveCount(busesPayload.buses.length);

  await page.getByRole('button', { name: 'Trips', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Trip Management', level: 2 })).toBeVisible();
  await expect(page.getByRole('table').locator('tbody tr')).toHaveCount(tripsPayload.trips.length);

  await page.getByRole('button', { name: 'Booking & Tickets' }).click();
  await expect(page.getByRole('heading', { name: 'Booking & Ticket Monitoring' })).toBeVisible();
  await expect(page.getByText('No bookings found for the selected filters.').or(page.getByRole('table'))).toBeVisible();

  await page.getByRole('button', { name: 'Reports & Analytics' }).click();
  await expect(page.getByRole('heading', { name: 'Reports & Analytics', level: 2 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Occupancy Analytics' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Report Downloads' })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);

  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/unauthorized$/);
  await expect(page.getByRole('heading', { name: 'Operations Dashboard' })).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('govia_access_token'))).toBeNull();

  await page.goto('/admin');
  await expect(page).toHaveURL(/\/unauthorized$/);
  await expect(page.getByRole('heading', { name: 'Operations Dashboard' })).toHaveCount(0);
  expect(pageErrors).toEqual([]);
});
