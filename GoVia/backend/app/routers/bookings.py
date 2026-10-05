from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.dependencies.auth import get_current_user
from app.models.booking import Booking, BookingSeat
from app.models.bus import Bus
from app.models.operator import BusOperator
from app.models.routes import Route
from app.models.trips import Trip
from app.models.user import User

router = APIRouter(prefix="/api", tags=["bookings"])


class BookingCreateRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    trip_id: int
    passenger_count: int = Field(default=1, ge=1)
    selected_seats: list[int] | None = None
    traveler_name: str
    traveler_phone: str
    traveler_email: str


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def serialize_booking(booking: Booking) -> dict:
    route = booking.trip.route if booking.trip and booking.trip.route else None
    bus = booking.trip.bus if booking.trip and booking.trip.bus else None
    operator = bus.operator if bus and bus.operator else None

    route_label = f"{route.origin} → {route.destination}" if route else "Unknown route"
    departure = str(booking.trip.departure_time) if booking.trip else "N/A"
    arrival = str(booking.trip.arrival_time) if booking.trip else "N/A"
    travel_date = booking.trip.travel_date.isoformat() if booking.trip else date.today().isoformat()

    return {
        "id": booking.id,
        "booking_id": f"GV-{booking.id:05d}",
        "trip_id": booking.trip_id,
        "route": route_label,
        "from": route.origin if route else "Unknown",
        "to": route.destination if route else "Unknown",
        "date": travel_date,
        "departure": departure,
        "arrival": arrival,
        "operator": operator.name if operator else "Unknown Operator",
        "bus_number": bus.bus_number if bus else "Unknown bus",
        "traveler_name": booking.traveler_name,
        "seats": sorted(seat.seat_number for seat in booking.seats),
        "passenger_count": booking.passenger_count,
        "status": booking.status,
        "payment_status": "PAID" if booking.status.upper() in {"CONFIRMED", "CANCELLED"} else "PENDING",
        "amount": float(booking.total_amount),
        "created_at": booking.created_at.isoformat(),
    }


@router.post("/bookings", status_code=status.HTTP_201_CREATED)
def create_booking(payload: BookingCreateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.get(Trip, payload.trip_id)
    if trip is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found.")

    if trip.status.upper() not in {"SCHEDULED", "AVAILABLE"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This trip is no longer available.")

    bus = trip.bus
    if bus is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Trip is not linked to a valid bus.")

    selected_seats = payload.selected_seats or []
    if selected_seats:
        if len(selected_seats) != payload.passenger_count:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Number of selected seats must match passenger count.",
            )

        if len(set(selected_seats)) != len(selected_seats):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected seats must be unique.",
            )

        invalid_seats = [seat for seat in selected_seats if seat < 1 or seat > bus.total_seats]
        if invalid_seats:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Seat numbers are invalid for this bus: {invalid_seats}",
            )

        booked_seats = db.scalars(
            select(BookingSeat.seat_number)
            .join(Booking, Booking.id == BookingSeat.booking_id)
            .where(
                Booking.trip_id == trip.id,
                Booking.status != "CANCELLED",
                BookingSeat.seat_number.in_(selected_seats),
            )
        ).all()

        if booked_seats:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"These seats are already booked: {sorted(booked_seats)}",
            )

    total_amount = float(trip.fare) * payload.passenger_count
    booking = Booking(
        user_id=current_user.id,
        trip_id=trip.id,
        passenger_count=payload.passenger_count,
        traveler_name=payload.traveler_name.strip(),
        traveler_phone=payload.traveler_phone.strip(),
        traveler_email=payload.traveler_email.strip().lower(),
        total_amount=total_amount,
        status="CONFIRMED",
    )

    db.add(booking)
    db.flush()

    for seat_number in selected_seats:
        db.add(
            BookingSeat(
                booking_id=booking.id,
                trip_id=trip.id,
                seat_number=seat_number,
            )
        )

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="One or more selected seats are already reserved for this trip.",
        )

    db.refresh(booking)

    return {
        "message": "Booking confirmed successfully.",
        "booking": serialize_booking(booking),
    }


@router.get("/bookings/me")
def get_my_bookings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    bookings = (
        db.execute(
            select(Booking)
            .where(Booking.user_id == current_user.id)
            .order_by(Booking.created_at.desc())
        )
        .scalars()
        .all()
    )

    return {
        "bookings": [serialize_booking(booking) for booking in bookings],
    }

@router.patch("/bookings/{booking_id}/cancel")
def cancel_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    booking = db.get(Booking, booking_id)

    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found.",
        )

    if booking.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot cancel this booking.",
        )

    if booking.status.upper() == "CANCELLED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking is already cancelled.",
        )

    if booking.status.upper() != "CONFIRMED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only confirmed bookings can be cancelled.",
        )

    booking.status = "CANCELLED"

    for seat in list(booking.seats):
        db.delete(seat)

    db.commit()
    db.refresh(booking)

    return {
        "message": "Booking cancelled successfully.",
        "booking": serialize_booking(booking),
    }
