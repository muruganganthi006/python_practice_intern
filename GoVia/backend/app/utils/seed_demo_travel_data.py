from __future__ import annotations

from datetime import date, time, timedelta

from sqlalchemy import select

from app.database import SessionLocal
from app.models.bus import Bus
from app.models.operator import BusOperator
from app.models.routes import Route
from app.models.trips import Trip


def seed_demo_travel_data() -> None:
    db = SessionLocal()
    try:
        if db.scalar(select(Route.id).limit(1)) is not None:
            return

        operators = [
            BusOperator(name="Skyline Travels", phone="9876500001", email="skyline@govia.com"),
            BusOperator(name="GreenLine Express", phone="9876500002", email="greenline@govia.com"),
            BusOperator(name="CityRide Travels", phone="9876500003", email="cityride@govia.com"),
        ]
        db.add_all(operators)
        db.flush()

        routes = [
            Route(origin="Chennai", destination="Bangalore", distance_km=345),
            Route(origin="Chennai", destination="Coimbatore", distance_km=500),
            Route(origin="Bangalore", destination="Chennai", distance_km=345),
        ]
        db.add_all(routes)
        db.flush()

        buses = [
            Bus(operator_id=operators[0].id, bus_number="TN-01-1001", bus_type="AC Sleeper", total_seats=24, amenities="AC,Wi‑Fi,Charging"),
            Bus(operator_id=operators[1].id, bus_number="KA-02-2001", bus_type="Volvo", total_seats=18, amenities="AC,Water,USB"),
            Bus(operator_id=operators[2].id, bus_number="TN-03-3001", bus_type="Executive", total_seats=12, amenities="AC,TV,Charging"),
            Bus(operator_id=operators[0].id, bus_number="TN-01-1002", bus_type="AC Semi-Sleeper", total_seats=20, amenities="AC,Wi‑Fi"),
        ]
        db.add_all(buses)
        db.flush()

        today = date.today()
        trips = [
            Trip(
                bus_id=buses[0].id,
                route_id=routes[0].id,
                travel_date=today + timedelta(days=1),
                departure_time=time.fromisoformat("06:30:00"),
                arrival_time=time.fromisoformat("13:10:00"),
                fare=699.0,
                status="SCHEDULED",
            ),
            Trip(
                bus_id=buses[1].id,
                route_id=routes[1].id,
                travel_date=today + timedelta(days=2),
                departure_time=time.fromisoformat("07:45:00"),
                arrival_time=time.fromisoformat("14:25:00"),
                fare=799.0,
                status="SCHEDULED",
            ),
            Trip(
                bus_id=buses[2].id,
                route_id=routes[2].id,
                travel_date=today + timedelta(days=3),
                departure_time=time.fromisoformat("09:00:00"),
                arrival_time=time.fromisoformat("15:40:00"),
                fare=899.0,
                status="SCHEDULED",
            ),
            Trip(
                bus_id=buses[3].id,
                route_id=routes[0].id,
                travel_date=today + timedelta(days=4),
                departure_time=time.fromisoformat("18:15:00"),
                arrival_time=time.fromisoformat("00:55:00"),
                fare=749.0,
                status="SCHEDULED",
            ),
        ]
        db.add_all(trips)
        db.commit()
    finally:
        db.close()
