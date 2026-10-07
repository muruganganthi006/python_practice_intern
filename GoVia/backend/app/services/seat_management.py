from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.booking import Booking, BookingSeat
from app.models.bus import Bus
from app.models.bus_seat import BusSeat
from app.models.trips import Trip
from app.models.trip_seat_state import TripSeatState


SEAT_COLUMNS = (0, 1, 3, 4)


def ensure_bus_seats(db: Session, bus: Bus) -> list[BusSeat]:
    seats = db.scalars(
        select(BusSeat).where(BusSeat.bus_id == bus.id).order_by(BusSeat.seat_number)
    ).all()
    existing_numbers = {seat.seat_number for seat in seats}
    normalized_type = bus.bus_type.lower()
    seat_type = "SLEEPER" if "sleeper" in normalized_type and "semi" not in normalized_type else "SEATER"

    for seat_number in range(1, bus.total_seats + 1):
        if seat_number in existing_numbers:
            continue
        zero_based = seat_number - 1
        if seat_type == "SLEEPER":
            column_index = 0 if zero_based % 2 == 0 else 3
            row_index = zero_based // 2
            label_letter = "A" if zero_based % 2 == 0 else "B"
            label_row = row_index + 1
        else:
            column = zero_based % 4
            column_index = SEAT_COLUMNS[column]
            row_index = zero_based // 4
            label_letter = chr(ord("A") + column)
            label_row = row_index + 1
        db.add(
            BusSeat(
                bus_id=bus.id,
                seat_number=seat_number,
                seat_label=f"{label_letter}{label_row}",
                seat_type=seat_type,
                row_index=row_index,
                column_index=column_index,
                status="AVAILABLE",
            )
        )

    if len(existing_numbers) < bus.total_seats:
        db.flush()
        seats = db.scalars(
            select(BusSeat).where(BusSeat.bus_id == bus.id).order_by(BusSeat.seat_number)
        ).all()
    return seats


def trip_seat_payload(db: Session, trip: Trip) -> dict:
    bus = trip.bus
    if bus is None:
        return {"trip_id": trip.id, "total_seats": 0, "booked_seats": [], "available_seats": [], "seats": []}

    bus_seats = ensure_bus_seats(db, bus)
    booked_rows = db.execute(
        select(BookingSeat, Booking)
        .join(Booking, Booking.id == BookingSeat.booking_id)
        .where(Booking.trip_id == trip.id, Booking.status != "CANCELLED")
    ).all()
    booked_by_number = {seat.seat_number: (seat, booking) for seat, booking in booked_rows}
    overrides = {
        state.seat_number: state.status
        for state in db.scalars(
            select(TripSeatState).where(TripSeatState.trip_id == trip.id)
        ).all()
    }

    seats = []
    for bus_seat in bus_seats:
        booked_pair = booked_by_number.get(bus_seat.seat_number)
        if booked_pair:
            booking_seat, booking = booked_pair
            seat_status = "BOOKED"
            booking_info = {
                "booking_id": booking.id,
                "passenger": booking.traveler_name,
            }
        else:
            seat_status = overrides.get(bus_seat.seat_number, bus_seat.status)
            booking_info = None

        seats.append(
            {
                "seat_number": bus_seat.seat_number,
                "seat_label": bus_seat.seat_label,
                "seat_type": bus_seat.seat_type,
                "row_index": bus_seat.row_index,
                "column_index": bus_seat.column_index,
                "status": seat_status,
                "booking": booking_info,
            }
        )

    booked = sorted(booked_by_number)
    available = [seat["seat_number"] for seat in seats if seat["status"] == "AVAILABLE"]
    return {
        "trip_id": trip.id,
        "total_seats": len(bus_seats),
        "booked_seats": booked,
        "available_seats": available,
        "seats": seats,
    }
