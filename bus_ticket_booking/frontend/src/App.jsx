import { useState } from "react"
import {
  createBooking,
  createPayment,
  getAdminOccupancy,
  getAdminRevenue,
  getAdminStats,
  getMyBookings,
  getTripSeats,
  loginUser,
  registerUser,
  searchTrips
} from "./api"

function formatTime(value) {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  })
}

function formatDate(value) {
  return new Date(value).toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric"
  })
}

function calculateDuration(departure, arrival) {
  const difference = new Date(arrival) - new Date(departure)
  const hours = Math.floor(difference / 3600000)
  const minutes = Math.floor((difference % 3600000) / 60000)

  return `${hours}h ${minutes}m`
}

function App() {
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [date, setDate] = useState("")
  const [trips, setTrips] = useState([])
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [seatData, setSeatData] = useState(null)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [loading, setLoading] = useState(false)
  const [seatLoading, setSeatLoading] = useState(false)
  const [error, setError] = useState("")

  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [showBookings, setShowBookings] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [registerName, setRegisterName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerPhone, setRegisterPhone] = useState("")

  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState("")

  const [registerLoading, setRegisterLoading] = useState(false)
  const [registerError, setRegisterError] = useState("")
  const [registerSuccess, setRegisterSuccess] = useState("")

  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState("")
  const [bookingSuccess, setBookingSuccess] = useState("")

  const [bookingId, setBookingId] = useState(null)
  const [showPayment, setShowPayment] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("UPI")
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentError, setPaymentError] = useState("")
  const [paymentSuccess, setPaymentSuccess] = useState("")

  const [myBookings, setMyBookings] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [bookingsError, setBookingsError] = useState("")

  const [adminStats, setAdminStats] = useState(null)
  const [adminStatsLoading, setAdminStatsLoading] = useState(false)
  const [adminStatsError, setAdminStatsError] = useState("")

  const [adminOccupancy, setAdminOccupancy] = useState(null)
  const [adminOccupancyLoading, setAdminOccupancyLoading] = useState(false)
  const [adminOccupancyError, setAdminOccupancyError] = useState("")

  const [adminRevenue, setAdminRevenue] = useState(null)
  const [adminRevenueLoading, setAdminRevenueLoading] = useState(false)
  const [adminRevenueError, setAdminRevenueError] = useState("")

  const [loggedIn, setLoggedIn] = useState(
    Boolean(localStorage.getItem("access_token"))
  )

  async function handleSearch() {
    if (!from || !to || !date) {
      setError("Please enter From, To and Date.")
      return
    }

    setLoading(true)
    setError("")
    setSelectedTrip(null)
    setSeatData(null)
    setSelectedSeats([])
    setShowPayment(false)
    setBookingId(null)
    setShowBookings(false)
    setShowAdmin(false)

    try {
      const data = await searchTrips(from, to, date)
      setTrips(data)
    } catch (err) {
      setError("Unable to search buses. Please check the backend.")
    } finally {
      setLoading(false)
    }
  }

  async function handleViewSeats(trip) {
    setSeatLoading(true)
    setError("")
    setSelectedSeats([])
    setBookingError("")
    setBookingSuccess("")
    setPaymentError("")
    setPaymentSuccess("")
    setShowPayment(false)
    setBookingId(null)
    setShowBookings(false)
    setShowAdmin(false)

    try {
      const data = await getTripSeats(trip.id)
      setSelectedTrip(trip)
      setSeatData(data)
    } catch (err) {
      setError("Unable to load seat layout.")
    } finally {
      setSeatLoading(false)
    }
  }

  function handleSeatClick(seat) {
    if (seat.status !== "available") {
      return
    }

    if (selectedSeats.includes(seat.seat_number)) {
      setSelectedSeats(
        selectedSeats.filter(
          (seatNumber) => seatNumber !== seat.seat_number
        )
      )
    } else {
      setSelectedSeats([...selectedSeats, seat.seat_number])
    }

    setBookingError("")
    setBookingSuccess("")
    setPaymentError("")
    setPaymentSuccess("")
  }

  function handleBackToResults() {
    setSelectedTrip(null)
    setSeatData(null)
    setSelectedSeats([])
    setBookingError("")
    setBookingSuccess("")
    setPaymentError("")
    setPaymentSuccess("")
    setShowPayment(false)
    setBookingId(null)
  }

  async function handleLogin(e) {
    e.preventDefault()

    setLoginError("")

    if (!email.trim() || !password) {
      setLoginError("Please enter your email and password.")
      return
    }

    setLoginLoading(true)

    try {
      const data = await loginUser(
        email.trim(),
        password
      )

      if (!data || !data.access_token) {
        throw new Error(
          "Login response did not contain an access token."
        )
      }

      localStorage.setItem(
        "access_token",
        data.access_token
      )

      setLoggedIn(true)
      setShowLogin(false)
      setLoginError("")
      setEmail("")
      setPassword("")
    } catch (err) {
      setLoginError(
        err.message || "Login failed. Please try again."
      )
    } finally {
      setLoginLoading(false)
    }
  }

  async function handleRegister(e) {
    e.preventDefault()

    if (
      !registerName ||
      !registerEmail ||
      !registerPassword ||
      !registerPhone
    ) {
      setRegisterError("Please fill in all fields.")
      return
    }

    setRegisterLoading(true)
    setRegisterError("")
    setRegisterSuccess("")

    try {
      await registerUser(
        registerName,
        registerEmail,
        registerPassword,
        registerPhone
      )

      setRegisterSuccess(
        "Registration successful. You can now login."
      )

      setRegisterName("")
      setRegisterEmail("")
      setRegisterPassword("")
      setRegisterPhone("")
    } catch (err) {
      setRegisterError(err.message)
    } finally {
      setRegisterLoading(false)
    }
  }

  async function handleAdminDashboard() {
    setShowAdmin(true)
    setShowBookings(false)
    setShowPayment(false)
    setSelectedTrip(null)
    setSeatData(null)
    setSelectedSeats([])

    setAdminStatsLoading(true)
    setAdminStatsError("")
    setAdminOccupancyLoading(true)
    setAdminOccupancyError("")
    setAdminRevenueLoading(true)
    setAdminRevenueError("")

    try {
      const data = await getAdminStats()
      setAdminStats(data)
    } catch (err) {
      setAdminStatsError(
        err.message || "Failed to load admin statistics."
      )
    } finally {
      setAdminStatsLoading(false)
    }

    try {
      const data = await getAdminOccupancy()
      setAdminOccupancy(data)
    } catch (err) {
      setAdminOccupancyError(
        err.message || "Failed to load occupancy report."
      )
    } finally {
      setAdminOccupancyLoading(false)
    }

    try {
      const data = await getAdminRevenue()
      setAdminRevenue(data)
    } catch (err) {
      setAdminRevenueError(
        err.message || "Failed to load revenue report."
      )
    } finally {
      setAdminRevenueLoading(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem("access_token")
    setLoggedIn(false)
    setSelectedTrip(null)
    setSeatData(null)
    setSelectedSeats([])
    setBookingError("")
    setBookingSuccess("")
    setPaymentError("")
    setPaymentSuccess("")
    setShowPayment(false)
    setBookingId(null)
    setShowBookings(false)
    setShowAdmin(false)
    setMyBookings([])
    setBookingsError("")
    setAdminStats(null)
    setAdminStatsError("")
    setAdminOccupancy(null)
    setAdminOccupancyError("")
    setAdminRevenue(null)
    setAdminRevenueError("")
  }

  async function handleMyBookings() {
    if (!loggedIn) {
      setShowLogin(true)
      setLoginError("Please login to view your bookings.")
      return
    }

    setBookingsLoading(true)
    setBookingsError("")
    setShowBookings(true)
    setShowPayment(false)
    setShowAdmin(false)
    setSelectedTrip(null)
    setSeatData(null)
    setSelectedSeats([])

    try {
      const data = await getMyBookings()
      setMyBookings(data)
    } catch (err) {
      setBookingsError(
        err.message || "Failed to load your bookings."
      )
    } finally {
      setBookingsLoading(false)
    }
  }

  async function handleBooking() {
    if (!loggedIn) {
      setShowLogin(true)
      setLoginError(
        "Please login before continuing with your booking."
      )
      return
    }

    if (!selectedTrip || selectedSeats.length === 0) {
      return
    }

    setBookingLoading(true)
    setBookingError("")
    setBookingSuccess("")
    setPaymentError("")
    setPaymentSuccess("")

    try {
      const data = await createBooking(
        selectedTrip.id,
        selectedSeats
      )

      setBookingId(data.id)

      setBookingSuccess(
        `Booking created successfully. Booking ID: ${data.id}`
      )

      setShowPayment(true)
    } catch (err) {
      setBookingError(
        err.message || "Booking failed."
      )
    } finally {
      setBookingLoading(false)
    }
  }

  async function handlePayment() {
    if (!bookingId) {
      setPaymentError("Booking information is missing.")
      return
    }

    setPaymentLoading(true)
    setPaymentError("")
    setPaymentSuccess("")

    try {
      const data = await createPayment(
        bookingId,
        paymentMethod
      )

      setPaymentSuccess(
        data.message ||
        "Payment successful. Your booking is confirmed."
      )
    } catch (err) {
      setPaymentError(
        err.message || "Payment failed. Please try again."
      )
    } finally {
      setPaymentLoading(false)
    }
  }

  return (
    <div>
      <nav>
        <h2>BusGo</h2>

        <div>
          {loggedIn ? (
            <>
              <button onClick={handleMyBookings}>
                My Bookings
              </button>

              <button onClick={handleAdminDashboard}>
                Admin Dashboard
              </button>

              <button onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setShowLogin(true)
                  setLoginError("")
                }}
              >
                Login
              </button>

              <button
                onClick={() => {
                  setShowRegister(true)
                  setRegisterError("")
                  setRegisterSuccess("")
                }}
              >
                Register
              </button>
            </>
          )}
        </div>
      </nav>

      <main>
        {!seatData && !showBookings && !showAdmin && (
          <section className="hero">
            <h1>Book Your Bus Journey</h1>

            <p>
              Find comfortable buses, choose your seat and travel with confidence.
            </p>

            <div className="search-box">
              <input
                type="text"
                placeholder="From"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />

              <input
                type="text"
                placeholder="To"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />

              <button onClick={handleSearch}>
                {loading ? "Searching..." : "Search Buses"}
              </button>
            </div>

            {error && <p>{error}</p>}
          </section>
        )}

        {trips.length > 0 && !seatData && !showBookings && !showAdmin && (
          <section className="results">
            <div className="results-header">
              <div>
                <h2>Available Buses</h2>

                <p>
                  {from} → {to} · {formatDate(date)}
                </p>
              </div>

              <span>
                {trips.length} bus{trips.length !== 1 ? "es" : ""}
              </span>
            </div>

            <div className="bus-list">
              {trips.map((trip) => (
                <div className="bus-card" key={trip.id}>
                  <div className="bus-info">
                    <div>
                      <span>DEPARTURE</span>

                      <strong>
                        {formatTime(trip.departure_time)}
                      </strong>
                    </div>

                    <div className="journey">
                      <small>
                        {calculateDuration(
                          trip.departure_time,
                          trip.arrival_time
                        )}
                      </small>

                      <div></div>
                    </div>

                    <div>
                      <span>ARRIVAL</span>

                      <strong>
                        {formatTime(trip.arrival_time)}
                      </strong>
                    </div>
                  </div>

                  <div className="bus-details">
                    <div>
                      <span>Trip ID</span>

                      <strong>#{trip.id}</strong>
                    </div>

                    <div>
                      <span>Available Seats</span>

                      <strong>
                        {trip.available_seats}
                      </strong>
                    </div>

                    <div>
                      <span>Fare</span>

                      <strong>₹{trip.fare}</strong>
                    </div>

                    <button
                      onClick={() =>
                        handleViewSeats(trip)
                      }
                    >
                      {seatLoading
                        ? "Loading..."
                        : "View Seats"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {showAdmin && (
          <section className="results">
            <div className="results-header">
              <div>
                <h2>Admin Dashboard</h2>

                <p>
                  Manage and monitor your BusGo booking system.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowAdmin(false)
                  setAdminStatsError("")
                  setAdminOccupancyError("")
                  setAdminRevenueError("")
                }}
              >
                ← Back
              </button>
            </div>

            <div className="feature-grid">
              <div className="feature-card">
                <h3>Buses</h3>

                <strong>
                  {adminStatsLoading
                    ? "..."
                    : adminStats?.total_buses ?? "—"}
                </strong>

                <p>
                  Total buses in the system.
                </p>
              </div>

              <div className="feature-card">
                <h3>Routes</h3>

                <strong>
                  {adminStatsLoading
                    ? "..."
                    : adminStats?.total_routes ?? "—"}
                </strong>

                <p>
                  Total routes available.
                </p>
              </div>

              <div className="feature-card">
                <h3>Trips</h3>

                <strong>
                  {adminStatsLoading
                    ? "..."
                    : adminStats?.total_trips ?? "—"}
                </strong>

                <p>
                  Total scheduled trips.
                </p>
              </div>

              <div className="feature-card">
                <h3>Bookings</h3>

                <strong>
                  {adminStatsLoading
                    ? "..."
                    : adminStats?.total_bookings ?? "—"}
                </strong>

                <p>
                  Total customer bookings.
                </p>
              </div>

              <div className="feature-card">
                <h3>Revenue</h3>

                <strong>
                  {adminStatsLoading
                    ? "..."
                    : `₹${adminStats?.total_revenue ?? 0}`}
                </strong>

                <p>
                  Total booking revenue.
                </p>
              </div>

              <div className="feature-card">
                <h3>Users</h3>

                <strong>
                  {adminStatsLoading
                    ? "..."
                    : adminStats?.total_users ?? "—"}
                </strong>

                <p>
                  Total registered users.
                </p>
              </div>
            </div>

            {adminStatsError && (
              <p className="login-error">
                {adminStatsError}
              </p>
            )}

            <div className="occupancy-section">
              <div className="results-header">
                <div>
                  <h2>Occupancy Report</h2>

                  <p>
                    Seat availability and booking occupancy for each trip.
                  </p>
                </div>
              </div>

              {adminOccupancyLoading && (
                <p>Loading occupancy report...</p>
              )}

              {adminOccupancyError && (
                <p className="login-error">
                  {adminOccupancyError}
                </p>
              )}

              {!adminOccupancyLoading &&
                !adminOccupancyError &&
                Array.isArray(adminOccupancy) &&
                adminOccupancy.length === 0 && (
                  <div className="route-card">
                    <h3>No Occupancy Data</h3>

                    <p>
                      There is currently no trip occupancy information available.
                    </p>
                  </div>
                )}

              {!adminOccupancyLoading &&
                !adminOccupancyError &&
                Array.isArray(adminOccupancy) &&
                adminOccupancy.length > 0 && (
                  <div className="occupancy-table-wrapper">
                    <table className="occupancy-table">
                      <thead>
                        <tr>
                          <th>Trip ID</th>
                          <th>Bus ID</th>
                          <th>Total Seats</th>
                          <th>Booked</th>
                          <th>Available</th>
                          <th>Occupancy</th>
                        </tr>
                      </thead>

                      <tbody>
                        {adminOccupancy.map((item) => (
                          <tr key={item.trip_id}>
                            <td>#{item.trip_id}</td>
                            <td>#{item.bus_id}</td>
                            <td>{item.total_seats}</td>
                            <td>{item.booked_seats}</td>
                            <td>{item.available_seats}</td>
                            <td>
                              <strong>
                                {item.occupancy_percentage}%
                              </strong>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>

            <div className="occupancy-section">
              <div className="results-header">
                <div>
                  <h2>Revenue Report</h2>

                  <p>
                    Confirmed bookings and total revenue generated.
                  </p>
                </div>
              </div>

              {adminRevenueLoading && (
                <p>Loading revenue report...</p>
              )}

              {adminRevenueError && (
                <p className="login-error">
                  {adminRevenueError}
                </p>
              )}

              {!adminRevenueLoading &&
                !adminRevenueError &&
                adminRevenue && (
                  <div className="feature-grid">
                    <div className="feature-card">
                      <h3>Confirmed Bookings</h3>

                      <strong>
                        {adminRevenue.total_confirmed_bookings}
                      </strong>

                      <p>
                        Total confirmed bookings.
                      </p>
                    </div>

                    <div className="feature-card">
                      <h3>Total Revenue</h3>

                      <strong>
                        ₹{adminRevenue.total_revenue}
                      </strong>

                      <p>
                        Revenue from confirmed bookings.
                      </p>
                    </div>
                  </div>
                )}
            </div>
          </section>
        )}

        {showBookings && (
          <section className="results">
            <div className="results-header">
              <div>
                <h2>My Bookings</h2>

                <p>
                  View your bus booking history and ticket details.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowBookings(false)
                  setBookingsError("")
                }}
              >
                ← Back
              </button>
            </div>

            {bookingsLoading && (
              <p>Loading your bookings...</p>
            )}

            {bookingsError && (
              <p className="login-error">
                {bookingsError}
              </p>
            )}

            {!bookingsLoading &&
              !bookingsError &&
              myBookings.length === 0 && (
                <div className="route-card">
                  <h3>No Bookings Found</h3>

                  <p>
                    You have not made any bus bookings yet.
                  </p>
                </div>
              )}

            {!bookingsLoading &&
              !bookingsError &&
              myBookings.length > 0 && (
                <div className="bus-list">
                  {myBookings.map((booking) => (
                    <div
                      className="bus-card"
                      key={booking.id}
                    >
                      <div className="bus-info">
                        <div>
                          <span>BOOKING ID</span>

                          <strong>
                            #{booking.id}
                          </strong>
                        </div>

                        <div className="journey">
                          <small>
                            Trip #{booking.trip_id}
                          </small>

                          <div></div>
                        </div>

                        <div>
                          <span>STATUS</span>

                          <strong>
                            {booking.status}
                          </strong>
                        </div>
                      </div>

                      <div className="bus-details">
                        <div>
                          <span>Seats</span>

                          <strong>
                            {booking.seat_numbers}
                          </strong>
                        </div>

                        <div>
                          <span>Number of Seats</span>

                          <strong>
                            {booking.num_seats}
                          </strong>
                        </div>

                        <div>
                          <span>Total Amount</span>

                          <strong>
                            ₹{booking.total_amount}
                          </strong>
                        </div>

                        <div>
                          <span>Booked At</span>

                          <strong>
                            {formatDate(
                              booking.booked_at
                            )}
                          </strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </section>
        )}

        {seatData && selectedTrip && !showPayment && (
          <section className="seat-section">
            <button
              className="back-button"
              onClick={handleBackToResults}
            >
              ← Back to Buses
            </button>

            <div className="seat-header">
              <div>
                <h2>Choose Your Seats</h2>

                <p>
                  {from} → {to} ·{" "}
                  {formatDate(
                    selectedTrip.departure_time
                  )}
                </p>
              </div>

              <div>
                <strong>
                  ₹{selectedTrip.fare}
                </strong>

                <span> per seat</span>
              </div>
            </div>

            <div className="seat-layout">
              <div className="driver">
                DRIVER
              </div>

              <div className="seat-grid">
                {seatData.seats.map((seat) => (
                  <button
                    key={seat.seat_number}
                    className={`seat ${
                      seat.status !== "available"
                        ? "occupied"
                        : selectedSeats.includes(
                            seat.seat_number
                          )
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      handleSeatClick(seat)
                    }
                    disabled={
                      seat.status !== "available"
                    }
                  >
                    {seat.seat_number}
                  </button>
                ))}
              </div>
            </div>

            <div className="seat-summary">
              <div>
                <span>Selected Seats</span>

                <strong>
                  {selectedSeats.length > 0
                    ? selectedSeats.join(", ")
                    : "None"}
                </strong>
              </div>

              <div>
                <span>Total</span>

                <strong>
                  ₹
                  {selectedSeats.length *
                    selectedTrip.fare}
                </strong>
              </div>

              <button
                onClick={handleBooking}
                disabled={
                  selectedSeats.length === 0 ||
                  bookingLoading
                }
              >
                {bookingLoading
                  ? "Booking..."
                  : "Continue Booking"}
              </button>

              {bookingError && (
                <p className="login-error">
                  {bookingError}
                </p>
              )}

              {bookingSuccess && (
                <p className="register-success">
                  {bookingSuccess}
                </p>
              )}
            </div>
          </section>
        )}

        {showPayment && selectedTrip && (
          <section className="seat-section">
            <button
              className="back-button"
              onClick={() => {
                setShowPayment(false)
                setPaymentError("")
                setPaymentSuccess("")
              }}
            >
              ← Back to Booking
            </button>

            <div className="seat-header">
              <div>
                <h2>Complete Your Payment</h2>

                <p>
                  {from} → {to} ·{" "}
                  {formatDate(
                    selectedTrip.departure_time
                  )}
                </p>
              </div>

              <div>
                <strong>
                  ₹
                  {selectedSeats.length *
                    selectedTrip.fare}
                </strong>

                <span> total</span>
              </div>
            </div>

            <div className="seat-summary">
              <div>
                <span>Booking ID</span>

                <strong>
                  #{bookingId}
                </strong>
              </div>

              <div>
                <span>Selected Seats</span>

                <strong>
                  {selectedSeats.join(", ")}
                </strong>
              </div>

              <div>
                <span>Payment Method</span>

                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value)
                  }
                  disabled={
                    paymentLoading ||
                    Boolean(paymentSuccess)
                  }
                >
                  <option value="UPI">
                    UPI
                  </option>

                  <option value="CARD">
                    Card
                  </option>

                  <option value="NET_BANKING">
                    Net Banking
                  </option>
                </select>
              </div>

              {!paymentSuccess && (
                <button
                  onClick={handlePayment}
                  disabled={paymentLoading}
                >
                  {paymentLoading
                    ? "Processing Payment..."
                    : "Pay Now"}
                </button>
              )}

              {paymentError && (
                <p className="login-error">
                  {paymentError}
                </p>
              )}

              {paymentSuccess && (
                <div>
                  <p className="register-success">
                    {paymentSuccess}
                  </p>

                  <h3>Booking Confirmed</h3>

                  <p>
                    Your bus ticket has been successfully booked.
                  </p>

                  <p>
                    <strong>Booking ID:</strong> #{bookingId}
                  </p>

                  <p>
                    <strong>Route:</strong> {from} → {to}
                  </p>

                  <p>
                    <strong>Date:</strong>{" "}
                    {formatDate(
                      selectedTrip.departure_time
                    )}
                  </p>

                  <p>
                    <strong>Departure:</strong>{" "}
                    {formatTime(
                      selectedTrip.departure_time
                    )}
                  </p>

                  <p>
                    <strong>Arrival:</strong>{" "}
                    {formatTime(
                      selectedTrip.arrival_time
                    )}
                  </p>

                  <p>
                    <strong>Seats:</strong>{" "}
                    {selectedSeats.join(", ")}
                  </p>

                  <p>
                    <strong>Total Paid:</strong> ₹
                    {selectedSeats.length *
                      selectedTrip.fare}
                  </p>

                  <p>
                    <strong>Payment Method:</strong>{" "}
                    {paymentMethod}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {trips.length === 0 &&
          !loading &&
          !error &&
          !seatData &&
          !showBookings &&
          !showAdmin && (
            <section className="routes">
              <h2>Popular Routes</h2>

              <div className="route-grid">
                <div className="route-card">
                  <h3>
                    Chennai → Coimbatore
                  </h3>

                  <p>
                    Comfortable overnight and daytime buses.
                  </p>
                </div>

                <div className="route-card">
                  <h3>
                    Chennai → Bangalore
                  </h3>

                  <p>
                    Multiple travel options available.
                  </p>
                </div>

                <div className="route-card">
                  <h3>
                    Chennai → Madurai
                  </h3>

                  <p>
                    Book your journey with easy seat selection.
                  </p>
                </div>
              </div>
            </section>
          )}

        <section className="features">
          <h2>Why Choose BusGo?</h2>

          <div className="feature-grid">
            <div className="feature-card">
              <h3>Easy Booking</h3>

              <p>
                Search buses and complete your booking in just a few steps.
              </p>
            </div>

            <div className="feature-card">
              <h3>Choose Your Seat</h3>

              <p>
                View the seat layout and select the seats you prefer.
              </p>
            </div>

            <div className="feature-card">
              <h3>Secure Payments</h3>

              <p>
                Complete your booking through a simple and secure payment flow.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <h3>BusGo</h3>

        <p>
          Simple and reliable bus ticket booking.
        </p>
      </footer>

      {showLogin && (
        <div className="login-overlay">
          <div className="login-card">
            <button
              className="login-close"
              onClick={() => {
                setShowLogin(false)
                setLoginError("")
              }}
            >
              ×
            </button>

            <h2>Welcome Back</h2>

            <p>
              Login to continue your BusGo journey.
            </p>

            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />

              {loginError && (
                <p className="login-error">
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                disabled={loginLoading}
              >
                {loginLoading
                  ? "Logging in..."
                  : "Login"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showRegister && (
        <div className="login-overlay">
          <div className="login-card">
            <button
              className="login-close"
              onClick={() => {
                setShowRegister(false)
                setRegisterError("")
                setRegisterSuccess("")
              }}
            >
              ×
            </button>

            <h2>Create Your Account</h2>

            <p>
              Register to start booking your bus journeys.
            </p>

            <form onSubmit={handleRegister}>
              <input
                type="text"
                placeholder="Full Name"
                value={registerName}
                onChange={(e) =>
                  setRegisterName(e.target.value)
                }
              />

              <input
                type="email"
                placeholder="Email"
                value={registerEmail}
                onChange={(e) =>
                  setRegisterEmail(e.target.value)
                }
              />

              <input
                type="tel"
                placeholder="Phone Number"
                value={registerPhone}
                onChange={(e) =>
                  setRegisterPhone(e.target.value)
                }
              />

              <input
                type="password"
                placeholder="Password"
                value={registerPassword}
                onChange={(e) =>
                  setRegisterPassword(e.target.value)
                }
              />

              {registerError && (
                <p className="login-error">
                  {registerError}
                </p>
              )}

              {registerSuccess && (
                <p className="register-success">
                  {registerSuccess}
                </p>
              )}

              <button
                type="submit"
                disabled={registerLoading}
              >
                {registerLoading
                  ? "Creating Account..."
                  : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App