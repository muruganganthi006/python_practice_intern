const API_URL = "/api"

async function getResponseData(response) {
  const text = await response.text()

  if (!text) {
    return {}
  }

  try {
    return JSON.parse(text)
  } catch {
    return {
      message: text
    }
  }
}

export async function searchTrips(from, to, date) {
  const params = new URLSearchParams()

  if (from) params.append("source", from)
  if (to) params.append("destination", to)
  if (date) params.append("date", date)

  const response = await fetch(`${API_URL}/trips/search?${params.toString()}`)
  const data = await getResponseData(response)

  if (!response.ok) {
    if (typeof data.detail === "string") {
      throw new Error(data.detail)
    }

    throw new Error("Failed to fetch bus trips")
  }

  return data
}

export async function getTripSeats(tripId) {
  const response = await fetch(`${API_URL}/trips/${tripId}/seats`)
  const data = await getResponseData(response)

  if (!response.ok) {
    if (typeof data.detail === "string") {
      throw new Error(data.detail)
    }

    throw new Error("Failed to fetch seat layout")
  }

  return data
}

export async function loginUser(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: email,
      password: password
    })
  })

  const data = await getResponseData(response)

  if (!response.ok) {
    if (typeof data.detail === "string") {
      throw new Error(data.detail)
    }

    if (Array.isArray(data.detail)) {
      const message = data.detail
        .map((item) => item.msg || "Invalid input")
        .join(", ")

      throw new Error(message)
    }

    if (data.message) {
      throw new Error(data.message)
    }

    throw new Error("Login failed. Please check your email and password.")
  }

  return data
}

export async function registerUser(name, email, password, phone) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name,
      email,
      password,
      phone
    })
  })

  const data = await getResponseData(response)

  if (!response.ok) {
    if (typeof data.detail === "string") {
      throw new Error(data.detail)
    }

    if (Array.isArray(data.detail)) {
      const message = data.detail
        .map((item) => item.msg || "Invalid input")
        .join(", ")

      throw new Error(message)
    }

    if (data.message) {
      throw new Error(data.message)
    }

    throw new Error("Registration failed. Please check your details.")
  }

  return data
}

export async function createBooking(tripId, seatNumbers) {
  const token = localStorage.getItem("access_token")

  const response = await fetch(`${API_URL}/bookings/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      trip_id: tripId,
      seat_numbers: seatNumbers
    })
  })

  const data = await getResponseData(response)

  if (!response.ok) {
    if (typeof data.detail === "string") {
      throw new Error(data.detail)
    }

    if (Array.isArray(data.detail)) {
      const message = data.detail
        .map((item) => item.msg || "Invalid input")
        .join(", ")

      throw new Error(message)
    }

    if (data.message) {
      throw new Error(data.message)
    }

    throw new Error("Booking failed.")
  }

  return data
}

export async function createPayment(bookingId, paymentMethod) {
  const token = localStorage.getItem("access_token")

  const response = await fetch(`${API_URL}/payments/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      booking_id: bookingId,
      payment_method: paymentMethod
    })
  })

  const data = await getResponseData(response)

  if (!response.ok) {
    if (typeof data.detail === "string") {
      throw new Error(data.detail)
    }

    if (Array.isArray(data.detail)) {
      const message = data.detail
        .map((item) => item.msg || "Invalid input")
        .join(", ")

      throw new Error(message)
    }

    throw new Error("Payment failed.")
  }

  return data
}

export async function getMyBookings() {
  const token = localStorage.getItem("access_token")

  const response = await fetch(`${API_URL}/bookings/`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })

  const data = await getResponseData(response)

  if (!response.ok) {
    if (typeof data.detail === "string") {
      throw new Error(data.detail)
    }

    if (Array.isArray(data.detail)) {
      const message = data.detail
        .map((item) => item.msg || "Invalid input")
        .join(", ")

      throw new Error(message)
    }

    throw new Error("Failed to fetch bookings.")
  }

  return data
}

export async function getAdminStats() {
  const token = localStorage.getItem("access_token")

  const response = await fetch(`${API_URL}/admin/stats`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })

  const data = await getResponseData(response)

  if (!response.ok) {
    if (typeof data.detail === "string") {
      throw new Error(data.detail)
    }

    throw new Error("Failed to fetch admin statistics.")
  }

  return data
}

export async function getAdminOccupancy() {
  const token = localStorage.getItem("access_token")

  const response = await fetch(`${API_URL}/admin/occupancy`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })

  const data = await getResponseData(response)

  if (!response.ok) {
    if (typeof data.detail === "string") {
      throw new Error(data.detail)
    }

    throw new Error("Failed to fetch occupancy report.")
  }

  return data
}

export async function getAdminRevenue() {
  const token = localStorage.getItem("access_token")

  const response = await fetch(`${API_URL}/admin/revenue`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })

  const data = await getResponseData(response)

  if (!response.ok) {
    if (typeof data.detail === "string") {
      throw new Error(data.detail)
    }

    throw new Error("Failed to fetch revenue report.")
  }

  return data
}