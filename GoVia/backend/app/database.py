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


def init_db() -> None:
    from app.models.user import User
    from app.models.operator import BusOperator
    from app.models.bus import Bus
    from app.models.routes import Route
    from app.models.trips import Trip
    from app.models.booking import Booking, BookingSeat

    # Create tables that do not already exist.
    Base.metadata.create_all(bind=engine)

    # Safely update the existing SQLite buses table.
    # This keeps all existing users, buses, trips and bookings.
    if settings.database_url.startswith("sqlite"):
        with engine.begin() as connection:
            columns = connection.execute(
                text("PRAGMA table_info(buses)")
            ).fetchall()

            column_names = {column[1] for column in columns}

            if "registration_number" not in column_names:
                connection.execute(
                    text(
                        """
                        ALTER TABLE buses
                        ADD COLUMN registration_number VARCHAR(50)
                        """
                    )
                )

            if "status" not in column_names:
                connection.execute(
                    text(
                        """
                        ALTER TABLE buses
                        ADD COLUMN status VARCHAR(30) DEFAULT 'ACTIVE'
                        """
                    )
                )

            # Existing buses receive an ACTIVE status.
            connection.execute(
                text(
                    """
                    UPDATE buses
                    SET status = 'ACTIVE'
                    WHERE status IS NULL
                    """
                )
            )


def check_database_connection() -> tuple[bool, str]:
    try:
        with SessionLocal() as session:
            session.execute(text("SELECT 1"))

        if settings.database_url.startswith("sqlite"):
            return True, "SQLite database connection successful"

        return True, "Database connection successful"

    except SQLAlchemyError:
        return False, "Database connection failed"