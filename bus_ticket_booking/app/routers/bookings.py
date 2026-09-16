from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Booking, Trip, User
from app.schemas import BookingCreate, BookingResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/bookings", tags=["Bookings"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=BookingResponse, status_code=201)
def create_booking(
    booking: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip = db.query(Trip).filter(Trip.id == booking.trip_id).first()

    if not trip:
        raise HTTPException(
            status_code=404,
            detail="Trip not found"
        )

    if trip.status != "scheduled":
        raise HTTPException(
            status_code=400,
            detail="Trip is not available for booking"
        )

    if len(booking.seat_numbers) == 0:
        raise HTTPException(
            status_code=400,
            detail="At least one seat must be selected"
        )

    if len(booking.seat_numbers) > trip.available_seats:
        raise HTTPException(
            status_code=400,
            detail="Not enough seats available"
        )

    if len(set(booking.seat_numbers)) != len(booking.seat_numbers):
        raise HTTPException(
            status_code=400,
            detail="Duplicate seat numbers are not allowed"
        )

    bus = trip.bus

    for seat_number in booking.seat_numbers:
        if seat_number < 1 or seat_number > bus.total_seats:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid seat number: {seat_number}"
            )

    existing_bookings = (
        db.query(Booking)
        .filter(
            Booking.trip_id == trip.id,
            Booking.status == "confirmed"
        )
        .all()
    )

    booked_seats = []

    for existing_booking in existing_bookings:
        booked_seats.extend(
            int(seat.strip())
            for seat in existing_booking.seat_numbers.split(",")
            if seat.strip()
        )

    for seat_number in booking.seat_numbers:
        if seat_number in booked_seats:
            raise HTTPException(
                status_code=400,
                detail=f"Seat {seat_number} is already booked"
            )

    num_seats = len(booking.seat_numbers)
    total_amount = num_seats * trip.fare
    seat_numbers = ",".join(
        str(seat) for seat in booking.seat_numbers
    )

    new_booking = Booking(
        user_id=current_user.id,
        trip_id=trip.id,
        seat_numbers=seat_numbers,
        num_seats=num_seats,
        total_amount=total_amount,
        status="confirmed"
    )

    trip.available_seats -= num_seats

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    return new_booking

@router.get("/", response_model=list[BookingResponse])
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    bookings = (
        db.query(Booking)
        .filter(Booking.user_id == current_user.id)
        .all()
    )

    return bookings

@router.delete("/{booking_id}")
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = (
        db.query(Booking)
        .filter(Booking.id == booking_id)
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    if booking.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You cannot cancel someone else's booking"
        )

    if booking.status == "cancelled":
        raise HTTPException(
            status_code=400,
            detail="Booking is already cancelled"
        )

    trip = db.query(Trip).filter(Trip.id == booking.trip_id).first()

    if not trip:
        raise HTTPException(
            status_code=404,
            detail="Trip not found"
        )

    booking.status = "cancelled"
    trip.available_seats += booking.num_seats

    db.commit()

    return {
        "message": "Booking cancelled successfully",
        "booking_id": booking.id,
        "seats_restored": booking.num_seats,
        "available_seats": trip.available_seats
    }