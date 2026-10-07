from datetime import date, time

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import Session

from app.database import Base, migrate_schema
from app.models.bus import Bus
from app.models.bus_operating_schedule import BusOperatingSchedule
from app.models.operator import BusOperator
from app.models.trips import Trip


def test_schedule_is_linked_to_bus_and_trip_without_breaking_legacy_trips():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)

    with Session(engine) as session:
        operator = BusOperator(
            name="Schedule Operator",
            phone="9876543210",
            email="schedule@example.com",
        )
        bus = Bus(
            operator=operator,
            bus_number="TN-01-SCHEDULE",
            bus_type="AC Seater",
            total_seats=24,
        )
        session.add_all([operator, bus])
        session.flush()

        schedule = BusOperatingSchedule(
            bus_id=bus.id,
            start_date=date(2026, 10, 1),
            end_date=date(2026, 10, 31),
            operating_days=["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
            status="ACTIVE",
        )
        legacy_trip = Trip(
            bus_id=bus.id,
            route_id=1,
            travel_date=date(2026, 10, 5),
            departure_time=time.fromisoformat("06:30:00"),
            arrival_time=time.fromisoformat("13:10:00"),
            fare=699.0,
            status="SCHEDULED",
        )
        session.add_all([schedule, legacy_trip])
        session.commit()

        session.refresh(schedule)
        session.refresh(legacy_trip)
        assert schedule.bus_id == bus.id
        assert schedule.operating_days == ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
        assert legacy_trip.schedule_id is None

    inspector = inspect(engine)
    assert inspector.has_table("bus_operating_schedules")
    assert inspector.has_table("trips")
    assert "schedule_id" in {column["name"] for column in inspector.get_columns("trips")}


def test_migrate_schema_adds_schedule_columns_without_deleting_existing_data():
    engine = create_engine("sqlite:///:memory:")
    with engine.begin() as connection:
        connection.execute(text("CREATE TABLE operators (id INTEGER PRIMARY KEY, name VARCHAR(150) NOT NULL)"))
        connection.execute(text("CREATE TABLE buses (id INTEGER PRIMARY KEY, operator_id INTEGER NOT NULL, bus_number VARCHAR(50) NOT NULL, bus_type VARCHAR(50) NOT NULL, total_seats INTEGER NOT NULL)"))
        connection.execute(text("CREATE TABLE routes (id INTEGER PRIMARY KEY, name VARCHAR(150) NOT NULL)"))
        connection.execute(text("CREATE TABLE route_points (id INTEGER PRIMARY KEY, route_id INTEGER NOT NULL, name VARCHAR(150) NOT NULL)"))
        connection.execute(text("CREATE TABLE users (id INTEGER PRIMARY KEY, email VARCHAR(255) NOT NULL)"))
        connection.execute(text("CREATE TABLE trips (id INTEGER PRIMARY KEY, bus_id INTEGER NOT NULL, route_id INTEGER NOT NULL, travel_date DATE NOT NULL, departure_time TIME NOT NULL, arrival_time TIME NOT NULL, fare NUMERIC(10, 2) NOT NULL, status VARCHAR(30) NOT NULL)"))
        connection.execute(text("INSERT INTO operators (id, name) VALUES (1, 'Legacy Operator')"))
        connection.execute(text("INSERT INTO buses (id, operator_id, bus_number, bus_type, total_seats) VALUES (1, 1, 'TN-01-LEGACY', 'AC Seater', 24)"))
        connection.execute(text("INSERT INTO trips (id, bus_id, route_id, travel_date, departure_time, arrival_time, fare, status) VALUES (1, 1, 1, '2026-10-05', '06:30:00', '13:10:00', 699, 'SCHEDULED')"))

    migrate_schema(engine)

    with engine.connect() as connection:
        trip_count = connection.execute(text("SELECT COUNT(*) FROM trips")).scalar_one()
        trip_schedule_id = connection.execute(text("SELECT schedule_id FROM trips WHERE id = 1")).scalar_one()
        schedule_table_exists = connection.execute(text("SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = 'bus_operating_schedules'")).scalar_one()

    assert trip_count == 1
    assert trip_schedule_id is None
    assert schedule_table_exists == 1
