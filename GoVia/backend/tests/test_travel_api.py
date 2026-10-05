from fastapi.testclient import TestClient
from sqlalchemy import select

from app.database import SessionLocal, init_db
from app.main import app
from app.models.user import User
from app.routers.travel import build_trip_response
from app.utils.security import create_access_token

client = TestClient(app)


def test_build_trip_response_includes_trip_details():
    result = build_trip_response(
        from_city="Chennai",
        to_city="Bangalore",
        departure_time="06:30:00",
        arrival_time="13:10:00",
        operator_name="Skyline Travels",
        fare=699.0,
        duration_minutes=400,
        seats_left=24,
    )

    assert result["from"] == "Chennai"
    assert result["to"] == "Bangalore"
    assert result["operator"] == "Skyline Travels"
    assert result["price"] == 699.0
    assert result["duration"] == "6h 40m"
    assert result["seats_left"] == 24


def test_trip_seat_availability_and_selected_seat_booking():
    init_db()

    db = SessionLocal()
    try:
        user = db.scalar(select(User).where(User.email == "user@govia.com"))
        if user is None:
            raise AssertionError("Demo user is missing")
    finally:
        db.close()

    token = create_access_token(str(user.id), "USER")

    seat_response = client.get(
        "/api/trips/1/seats",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert seat_response.status_code == 200, seat_response.text
    seat_payload = seat_response.json()
    assert seat_payload["trip_id"] == 1
    assert seat_payload["total_seats"] > 0
    assert "booked_seats" in seat_payload
    assert "available_seats" in seat_payload
    assert seat_payload["available_seats"], "Trip should have at least one available seat"

    selected_seat = seat_payload["available_seats"][0]

    booking_response = client.post(
        "/api/bookings",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "trip_id": 1,
            "passenger_count": 1,
            "selected_seats": [selected_seat],
            "traveler_name": "Demo User",
            "traveler_phone": "9876543210",
            "traveler_email": "user@govia.com",
        },
    )
    assert booking_response.status_code == 201, booking_response.text
    booking_data = booking_response.json()
    assert booking_data["message"] == "Booking confirmed successfully."
    assert booking_data["booking"]["seats"] == [selected_seat]
    assert booking_data["booking"]["bus_number"]
    assert booking_data["booking"]["payment_status"] == "PAID"

    duplicate_response = client.post(
        "/api/bookings",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "trip_id": 1,
            "passenger_count": 1,
            "selected_seats": [selected_seat],
            "traveler_name": "Duplicate User",
            "traveler_phone": "9876543211",
            "traveler_email": "duplicate@example.com",
        },
    )
    assert duplicate_response.status_code == 409, duplicate_response.text

    cancel_response = client.patch(
        f"/api/bookings/{booking_data['booking']['id']}/cancel",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert cancel_response.status_code == 200, cancel_response.text
    assert cancel_response.json()["booking"]["status"] == "CANCELLED"

    refreshed_seats = client.get(
        "/api/trips/1/seats",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert refreshed_seats.status_code == 200, refreshed_seats.text
    assert selected_seat in refreshed_seats.json()["available_seats"]
