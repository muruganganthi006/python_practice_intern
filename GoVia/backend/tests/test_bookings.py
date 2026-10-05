from datetime import date, time

from fastapi.testclient import TestClient
from sqlalchemy import select

from app.database import SessionLocal, init_db
from app.main import app
from app.models.bus import Bus
from app.models.operator import BusOperator
from app.models.routes import Route
from app.models.trips import Trip
from app.models.user import User, UserRole
from app.utils.security import create_access_token


client = TestClient(app)


def test_user_can_create_and_list_bookings():
    init_db()

    db = SessionLocal()
    try:
        user = db.scalar(select(User).where(User.email == "demo-booking@govia.com"))
        if user is None:
            user = User(
                name="Booking User",
                email="demo-booking@govia.com",
                password_hash="hashed",
                phone="9876543212",
                role=UserRole.USER,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        operator = db.scalar(select(BusOperator).where(BusOperator.name == "Skyline Travels"))
        if operator is None:
            operator = BusOperator(name="Skyline Travels", phone="9876500001", email="skyline@govia.com")
            db.add(operator)
            db.commit()
            db.refresh(operator)

        route = db.scalar(select(Route).where(Route.origin == "Chennai", Route.destination == "Bangalore"))
        if route is None:
            route = Route(origin="Chennai", destination="Bangalore", distance_km=345)
            db.add(route)
            db.commit()
            db.refresh(route)

        bus = db.scalar(select(Bus).where(Bus.bus_number == "TN-01-1001"))
        if bus is None:
            bus = Bus(
                operator_id=operator.id,
                bus_number="TN-01-1001",
                bus_type="AC Sleeper",
                total_seats=24,
                amenities="AC,Wi‑Fi,Charging",
            )
            db.add(bus)
            db.commit()
            db.refresh(bus)

        trip = db.scalar(select(Trip).where(Trip.route_id == route.id, Trip.bus_id == bus.id))
        if trip is None:
            trip = Trip(
                bus_id=bus.id,
                route_id=route.id,
                travel_date=date.today(),
                departure_time=time.fromisoformat("06:30:00"),
                arrival_time=time.fromisoformat("13:10:00"),
                fare=699.0,
                status="SCHEDULED",
            )
            db.add(trip)
            db.commit()
            db.refresh(trip)
    finally:
        db.close()

    token = create_access_token(str(user.id), user.role.value)

    create_response = client.post(
        "/api/bookings",
        json={
            "trip_id": trip.id,
            "passenger_count": 2,
            "traveler_name": "Demo Traveler",
            "traveler_phone": "9876543210",
            "traveler_email": "traveler@example.com",
        },
        headers={"Authorization": f"Bearer {token}"},
    )

    assert create_response.status_code == 201, create_response.text
    created = create_response.json()
    assert created["booking"]["status"] == "CONFIRMED"

    list_response = client.get(
        "/api/bookings/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert list_response.status_code == 200, list_response.text
    body = list_response.json()
    assert body["bookings"]
    assert body["bookings"][0]["route"] == "Chennai → Bangalore"
