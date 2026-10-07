from __future__ import annotations

from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings


class Base(DeclarativeBase):
    pass


engine = create_engine(
    settings.database_url,
    future=True,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def migrate_schema(database_engine) -> None:
    """Apply additive SQLite migrations without changing existing records."""
    if not settings.database_url.startswith("sqlite"):
        return

    with database_engine.begin() as connection:
        existing_tables = {
            row[0]
            for row in connection.execute(
                text("SELECT name FROM sqlite_master WHERE type = 'table'")
            )
        }

        if "bus_operating_schedules" not in existing_tables:
            connection.execute(
                text(
                    """
                    CREATE TABLE bus_operating_schedules (
                        id INTEGER PRIMARY KEY,
                        bus_id INTEGER NOT NULL UNIQUE,
                        start_date DATE NOT NULL,
                        end_date DATE NOT NULL,
                        operating_days JSON NOT NULL DEFAULT '[]',
                        status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
                        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE
                    )
                    """
                )
            )

        migrations = {
            "operators": {
                "address": "VARCHAR(300)",
                "status": "VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'",
            },
            "routes": {
                "estimated_duration_minutes": "INTEGER",
                "status": "VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'",
            },
            "users": {"is_active": "BOOLEAN NOT NULL DEFAULT 1"},
            "trips": {
                "schedule_id": "INTEGER REFERENCES bus_operating_schedules(id) ON DELETE SET NULL",
                "boarding_point_id": "INTEGER REFERENCES route_points(id)",
                "dropping_point_id": "INTEGER REFERENCES route_points(id)",
            },
        }

        for table_name, columns_to_add in migrations.items():
            existing_names = {
                row[1]
                for row in connection.execute(
                    text(f"PRAGMA table_info({table_name})")
                )
            }
            for column_name, column_type in columns_to_add.items():
                if column_name not in existing_names:
                    connection.execute(
                        text(
                            f"ALTER TABLE {table_name} ADD COLUMN "
                            f"{column_name} {column_type}"
                        )
                    )

        buses_columns = {
            row[1]
            for row in connection.execute(
                text("PRAGMA table_info(buses)")
            )
        }
        if "registration_number" not in buses_columns:
            connection.execute(
                text("ALTER TABLE buses ADD COLUMN registration_number VARCHAR(50)")
            )
        if "status" not in buses_columns:
            connection.execute(
                text("ALTER TABLE buses ADD COLUMN status VARCHAR(30) DEFAULT 'ACTIVE'")
            )
        connection.execute(
            text("UPDATE buses SET status = 'ACTIVE' WHERE status IS NULL")
        )


def init_db() -> None:
    from app.models.user import User
    from app.models.operator import BusOperator
    from app.models.bus import Bus
    from app.models.bus_operating_schedule import BusOperatingSchedule
    from app.models.bus_seat import BusSeat
    from app.models.routes import Route
    from app.models.route_point import RoutePoint
    from app.models.trips import Trip
    from app.models.booking import Booking, BookingSeat
    from app.models.payment import Payment
    from app.models.trip_seat_state import TripSeatState

    # Create tables that do not already exist.
    Base.metadata.create_all(bind=engine)
    migrate_schema(engine)


def check_database_connection() -> tuple[bool, str]:
    try:
        with SessionLocal() as session:
            session.execute(text("SELECT 1"))

        if settings.database_url.startswith("sqlite"):
            return True, "SQLite database connection successful"

        return True, "Database connection successful"

    except SQLAlchemyError:
        return False, "Database connection failed"