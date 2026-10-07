from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    trip_id: Mapped[int] = mapped_column(
        ForeignKey("trips.id"),
        nullable=False,
        index=True,
    )

    passenger_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
    )

    traveler_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    traveler_phone: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    traveler_email: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    total_amount: Mapped[float] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="CONFIRMED",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="bookings",
    )

    trip = relationship(
        "Trip",
        back_populates="bookings",
    )

    seats = relationship(
        "BookingSeat",
        back_populates="booking",
        cascade="all, delete-orphan",
    )

    payment = relationship(
        "Payment",
        back_populates="booking",
        cascade="all, delete-orphan",
        uselist=False,
    )


class BookingSeat(Base):
    __tablename__ = "booking_seats"

    __table_args__ = (
        UniqueConstraint(
            "trip_id",
            "seat_number",
            name="uq_booking_trip_seat",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    booking_id: Mapped[int] = mapped_column(
        ForeignKey("bookings.id"),
        nullable=False,
        index=True,
    )

    trip_id: Mapped[int] = mapped_column(
        ForeignKey("trips.id"),
        nullable=False,
        index=True,
    )

    seat_number: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        index=True,
    )

    booking = relationship(
        "Booking",
        back_populates="seats",
    )

    trip = relationship(
        "Trip",
        back_populates="booking_seats",
    )