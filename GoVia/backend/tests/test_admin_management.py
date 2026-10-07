from datetime import date
from uuid import uuid4

from fastapi.testclient import TestClient
from sqlalchemy import select

from app.database import SessionLocal, init_db
from app.main import app
from app.models.routes import Route
from app.models.trips import Trip
from app.models.user import User
from app.utils.seed_demo_travel_data import seed_demo_travel_data
from app.utils.seed_demo_users import seed_demo_users
from app.utils.security import create_access_token


client = TestClient(app)


def prepare_data() -> tuple[dict[str, str], dict[str, str], Trip]:
    init_db()
    seed_demo_users()
    seed_demo_travel_data()
    db = SessionLocal()
    try:
        admin = db.scalar(select(User).where(User.email == "admin@govia.com"))
        user = db.scalar(select(User).where(User.email == "user@govia.com"))
        route = db.scalar(
            select(Route).where(
                Route.origin == "Chennai",
                Route.destination == "Bangalore",
            )
        )
        trip = db.scalar(
            select(Trip)
            .where(Trip.route_id == route.id, Trip.travel_date >= date.today())
            .order_by(Trip.travel_date)
        )
        assert admin is not None and user is not None and route is not None and trip is not None
        return (
            {"Authorization": f"Bearer {create_access_token(str(admin.id), admin.role.value)}"},
            {"Authorization": f"Bearer {create_access_token(str(user.id), user.role.value)}"},
            trip,
        )
    finally:
        db.close()


def test_admin_operator_route_crud_and_user_authorization():
    admin_headers, user_headers, _ = prepare_data()
    suffix = uuid4().hex[:8]

    assert client.get("/api/admin/operators", headers=user_headers).status_code == 403

    created_operator = client.post(
        "/api/admin/operators",
        headers=admin_headers,
        json={
            "name": f"E2E Operator {suffix}",
            "email": f"operator-{suffix}@example.com",
            "phone": "9876543210",
            "address": "Test depot",
            "status": "ACTIVE",
        },
    )
    assert created_operator.status_code == 201, created_operator.text
    operator_id = created_operator.json()["operator"]["id"]
    assert created_operator.json()["operator"]["bus_count"] == 0

    updated_operator = client.put(
        f"/api/admin/operators/{operator_id}",
        headers=admin_headers,
        json={
            "name": f"E2E Operator {suffix}",
            "email": f"operator-{suffix}@example.com",
            "phone": "9876543210",
            "address": "Updated depot",
            "status": "INACTIVE",
        },
    )
    assert updated_operator.status_code == 200
    assert updated_operator.json()["operator"]["status"] == "INACTIVE"

    created_route = client.post(
        "/api/admin/routes",
        headers=admin_headers,
        json={
            "origin": f"Origin {suffix}",
            "destination": f"Destination {suffix}",
            "distance_km": 120,
            "estimated_duration_minutes": 180,
            "status": "ACTIVE",
        },
    )
    assert created_route.status_code == 201, created_route.text
    route_id = created_route.json()["route"]["id"]

    point = client.post(
        f"/api/admin/routes/{route_id}/points",
        headers=admin_headers,
        json={
            "point_type": "BOARDING",
            "name": "Central Station",
            "address": "Main Road",
            "point_time": "06:30:00",
        },
    )
    assert point.status_code == 201, point.text
    assert client.get(
        f"/api/admin/routes/{route_id}", headers=admin_headers
    ).json()["route"]["boarding_points"][0]["name"] == "Central Station"


def test_trip_seat_states_payment_records_and_cancellation():
    admin_headers, user_headers, trip = prepare_data()
    response = client.get(f"/api/trips/{trip.id}/seats")
    assert response.status_code == 200, response.text
    seat_data = response.json()
    assert seat_data["seats"]
    seat_number = seat_data["available_seats"][0]

    blocked = client.patch(
        f"/api/admin/trips/{trip.id}/seats/{seat_number}",
        headers=admin_headers,
        json={"status": "BLOCKED"},
    )
    assert blocked.status_code == 200, blocked.text

    booking_payload = {
        "trip_id": trip.id,
        "passenger_count": 1,
        "selected_seats": [seat_number],
        "traveler_name": "Admin Management Test",
        "traveler_phone": "9876543210",
        "traveler_email": f"seat-{uuid4().hex}@example.com",
        "payment_method": "UPI",
    }
    rejected = client.post("/api/bookings", headers=user_headers, json=booking_payload)
    assert rejected.status_code == 409

    unblocked = client.patch(
        f"/api/admin/trips/{trip.id}/seats/{seat_number}",
        headers=admin_headers,
        json={"status": "AVAILABLE"},
    )
    assert unblocked.status_code == 200

    created = client.post("/api/bookings", headers=user_headers, json=booking_payload)
    assert created.status_code == 201, created.text
    booking = created.json()["booking"]
    assert booking["payment_status"] == "PAID"
    assert booking["payment"]["payment_method"] == "UPI"
    assert booking["payment"]["transaction_id"].startswith("SIM-")

    payments = client.get("/api/admin/payments", headers=admin_headers)
    assert payments.status_code == 200, payments.text
    assert any(item["booking_id"] == booking["booking_id"] for item in payments.json()["payments"])

    cancelled = client.patch(
        f"/api/admin/bookings/{booking['id']}/cancel",
        headers=admin_headers,
    )
    assert cancelled.status_code == 200, cancelled.text
    assert cancelled.json()["booking"]["status"] == "CANCELLED"

    refreshed = client.get(f"/api/trips/{trip.id}/seats").json()
    assert seat_number in refreshed["available_seats"]


def test_last_active_admin_cannot_be_deactivated():
    admin_headers, _, _ = prepare_data()
    db = SessionLocal()
    try:
        admin = db.scalar(select(User).where(User.email == "admin@govia.com"))
        assert admin is not None
        admin_id = admin.id
        other_active_admin = db.scalar(
            select(User).where(User.id != admin_id, User.role == "ADMIN", User.is_active.is_(True))
        )
        if other_active_admin:
            db.delete(other_active_admin)
            db.commit()
    finally:
        db.close()

    response = client.patch(
        f"/api/admin/users/{admin_id}",
        headers=admin_headers,
        json={"is_active": False},
    )
    assert response.status_code == 409
