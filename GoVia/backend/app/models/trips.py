from __future__ import annotations

from datetime import date, datetime, time

from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String, Time, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Trip(Base):
    __tablename__ = "trips"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    bus_id: Mapped[int] = mapped_column(
        ForeignKey("buses.id"),
        nullable=False,
    )

    route_id: Mapped[int] = mapped_column(
        ForeignKey("routes.id"),
        nullable=False,
    )

    travel_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        index=True,
    )

    departure_time: Mapped[time] = mapped_column(
        Time,
        nullable=False,
    )

    arrival_time: Mapped[time] = mapped_column(
        Time,
        nullable=False,
    )

    fare: Mapped[float] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="SCHEDULED",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    bus = relationship(
        "Bus",
        back_populates="trips",
    )

    route = relationship(
        "Route",
        back_populates="trips",
    )

    bookings = relationship(
        "Booking",
        back_populates="trip",
        cascade="all, delete-orphan",
    )
    booking_seats = relationship(
        "BookingSeat",
        back_populates="trip",
        cascade="all, delete-orphan",
    )